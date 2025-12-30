const pool = require('../config/db');
const { processDocument } = require('../services/ragService');
const { chromaClient } = require('../config/ai');
const fs = require('fs');
const path = require('path');

const uploadDocument = async (req, res) => {
	// Змінні оголошуємо зовні try, щоб мати до них доступ у catch
	let newDocId = null;
	const file = req.file;

	try {
		if (!file) return res.status(400).send('No file uploaded');

		const { workspaceId } = req.body;
		const userId = req.user.id;

		// 1. ПЕРЕВІРКА ПРАВ (Тільки owner/admin може вантажити)
		const check = await pool.query(
			"SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2 AND role IN ('owner', 'admin')",
			[workspaceId, userId]
		);

		if (check.rows.length === 0) {
			// Якщо прав немає - ми ще нічого не створили, але файл multer вже зберіг. Видаляємо його.
			if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
			return res.status(403).send('Not authorized to upload here');
		}

		// 2. ЗАПИС В БД
		const insertResult = await pool.query(
			'INSERT INTO documents (workspace_id, filename, filepath, file_type, size) VALUES ($1, $2, $3, $4, $5) RETURNING *',
			[
				workspaceId,
				file.originalname,
				file.path,
				file.mimetype,
				file.size,
			]
		);

		const newDoc = insertResult.rows[0];
		newDocId = newDoc.id; // Запам'ятовуємо ID для можливого відкату

		// 3. RAG PIPELINE
		console.log(`[Upload] Starting RAG processing for doc #${newDocId}...`);

		await processDocument(file.path, file.mimetype, workspaceId, newDocId);

		console.log(`[Upload] Success! Doc #${newDocId} is ready.`);

		// 4. УСПІХ
		res.json(newDoc);
	} catch (err) {
		console.error('[Upload Error] Pipeline failed:', err.message);

		// === ROLLBACK (ВІДКАТ) ===

		// Крок А: Видаляємо вектори з ChromaDB (якщо встигли щось записати)
		if (newDocId) {
			try {
				const { workspaceId } = req.body;
				const collectionName = `workspace_${workspaceId}`;
				const collection = await chromaClient.getCollection({
					name: collectionName,
				});
				await collection.delete({ where: { docId: newDocId } });
				console.log('[Rollback] Cleared partial vectors from ChromaDB');
			} catch (chromaErr) {
				console.warn(
					'[Rollback] Chroma cleanup skipped:',
					chromaErr.message
				);
			}

			// Крок Б: Видаляємо запис з PostgreSQL
			try {
				await pool.query('DELETE FROM documents WHERE id = $1', [
					newDocId,
				]);
				console.log('[Rollback] Deleted DB record');
			} catch (dbErr) {
				console.error('[Rollback] DB delete failed:', dbErr.message);
			}
		}

		// Крок В: Видаляємо фізичний файл
		if (file && file.path && fs.existsSync(file.path)) {
			try {
				fs.unlinkSync(file.path);
				console.log('[Rollback] Deleted physical file');
			} catch (fsErr) {
				console.error('[Rollback] File delete failed:', fsErr.message);
			}
		}

		// Повертаємо помилку клієнту
		res.status(500).send(`Upload failed: ${err.message}`);
	}
};

// Отримати список файлів
const getDocuments = async (req, res) => {
	try {
		const { workspaceId } = req.params;
		// Перевіряємо, чи юзер взагалі учасник
		const check = await pool.query(
			'SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
			[workspaceId, req.user.id]
		);
		if (check.rows.length === 0)
			return res.status(403).send('Access Denied');

		const docs = await pool.query(
			'SELECT * FROM documents WHERE workspace_id = $1 ORDER BY uploaded_at DESC',
			[workspaceId]
		);
		res.json(docs.rows);
	} catch (err) {
		console.error(err);
		res.status(500).send('Server Error');
	}
};

// Видалити файл
const deleteDocument = async (req, res) => {
	try {
		const { id } = req.params; // ID документа з URL

		// 1. Отримуємо інфу про документ
		const docResult = await pool.query(
			'SELECT * FROM documents WHERE id = $1',
			[id]
		);
		if (docResult.rows.length === 0) {
			return res.status(404).json('Document not found');
		}
		const doc = docResult.rows[0];

		// 2. Перевіряємо права (тільки Owner або Admin)
		const check = await pool.query(
			"SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2 AND role IN ('owner', 'admin')",
			[doc.workspace_id, req.user.id]
		);
		if (check.rows.length === 0) {
			return res.status(403).json('Not authorized to delete documents');
		}

		// 3. Видаляємо вектори з ChromaDB
		try {
			const collectionName = `workspace_${doc.workspace_id}`;
			const collection = await chromaClient.getCollection({
				name: collectionName,
			});

			// Видаляємо всі вектори, де metadata.docId == id
			// ChromaDB дозволяє видаляти за фільтром метаданих
			await collection.delete({
				where: { docId: doc.id },
			});
			console.log(`[RAG] Deleted vectors for doc ${doc.id}`);
		} catch (chromaErr) {
			console.error(
				'ChromaDB delete error (maybe collection empty):',
				chromaErr
			);
			// Не зупиняємо процес, навіть якщо в Хромі помилка
		}

		// 4. Видаляємо фізичний файл
		if (fs.existsSync(doc.filepath)) {
			fs.unlinkSync(doc.filepath);
		}

		// 5. Видаляємо запис з БД
		await pool.query('DELETE FROM documents WHERE id = $1', [id]);

		res.json({ message: 'Document deleted successfully' });
	} catch (err) {
		console.error(err);
		res.status(500).send('Server Error');
	}
};

const serveDocument = async (req, res) => {
	try {
		const { filename } = req.params;
		const userId = req.user.id;

		// 1. Шукаємо документ у таблиці documents
		const docResult = await pool.query(
			'SELECT * FROM documents WHERE filepath LIKE $1',
			[`%${filename}`]
		);

		if (docResult.rows.length === 0) {
			return res.status(404).json('Document not found');
		}

		const doc = docResult.rows[0];

		// 2. Перевірка доступу
		const memberCheck = await pool.query(
			'SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
			[doc.workspace_id, userId]
		);

		if (memberCheck.rows.length === 0) {
			return res
				.status(403)
				.json('Access Denied: You are not a member of this workspace');
		}

		// 3. Віддаємо файл
		const absolutePath = path.join(__dirname, '../uploads', filename);

		if (fs.existsSync(absolutePath)) {
			res.sendFile(absolutePath);
		} else {
			res.status(404).json('File physically not found on server');
		}
	} catch (err) {
		console.error(err);
		res.status(500).send('Server Error');
	}
};

module.exports = {
	uploadDocument,
	getDocuments,
	deleteDocument,
	serveDocument,
};
