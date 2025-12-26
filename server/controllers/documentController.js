const pool = require('../config/db');
const { processDocument } = require('../services/ragService');
const { chromaClient } = require('../config/ai');
const fs = require('fs');

const uploadDocument = async (req, res) => {
	// Оголошуємо змінну тут, щоб мати доступ до ID документа в catch блоці
	let newDocId = null;

	try {
		const { workspaceId } = req.body;
		const file = req.file;

		if (!file) return res.status(400).send('No file uploaded');

		// 1. Перевірка прав
		const check = await pool.query(
			"SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2 AND role IN ('owner', 'admin')",
			[workspaceId, req.user.id]
		);

		if (check.rows.length === 0) {
			fs.unlinkSync(file.path);
			return res.status(403).send('Not authorized to upload here');
		}

		// 2. Зберігаємо запис в PostgreSQL
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
		newDocId = newDoc.id; // Запам'ятовуємо ID

		// 3. Запускаємо RAG Pipeline
		try {
			await processDocument(
				file.path,
				file.mimetype,
				workspaceId,
				newDoc.id
			);
		} catch (ragError) {
			console.error(
				'[RAG Error] Processing failed, rolling back DB entry:',
				ragError
			);

			// Якщо RAG впав, видаляємо запис з БД, який ми щойно створили
			await pool.query('DELETE FROM documents WHERE id = $1', [newDocId]);

			// Прокидаємо помилку далі, щоб головний catch видалив фізичний файл
			throw ragError;
		}

		res.json(newDoc);
	} catch (err) {
		console.error(err);
		// Якщо помилка - видаляємо файл з диску
		if (req.file && fs.existsSync(req.file.path)) {
			fs.unlinkSync(req.file.path);
		}

		res.status(500).send('Upload failed: ' + err.message);
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

module.exports = { uploadDocument, getDocuments, deleteDocument };
