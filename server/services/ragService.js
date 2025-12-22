const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { chromaClient, getEmbedder } = require('../config/ai');

// 1. Функція читання тексту з файлу
const extractText = async (filePath, fileType) => {
	const buffer = fs.readFileSync(filePath);

	try {
		if (fileType === 'application/pdf') {
			const data = await pdf(buffer);
			return data.text;
		} else if (
			fileType ===
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
		) {
			const result = await mammoth.extractRawText({ buffer });
			return result.value;
		} else {
			// text/plain
			return buffer.toString('utf8');
		}
	} catch (err) {
		console.error('Error parsing file:', err);
		throw new Error('Failed to parse document text');
	}
};

// 2. Функція розбиття на шматки (Chunking)
// overlap (перекриття) потрібен, щоб не губити контекст на межі шматків
const splitText = (text, chunkSize = 500, overlap = 50) => {
	if (!text) return [];

	// Очистка від зайвих пробілів
	const cleanText = text.replace(/\s+/g, ' ').trim();

	const chunks = [];
	for (let i = 0; i < cleanText.length; i += chunkSize - overlap) {
		chunks.push(cleanText.slice(i, i + chunkSize));
	}
	return chunks;
};

// 3. Головна функція обробки
const processDocument = async (filePath, fileType, workspaceId, docId) => {
	try {
		// А. Отримуємо текст
		const fullText = await extractText(filePath, fileType);
		if (!fullText || fullText.length < 10) {
			throw new Error('File is empty or unreadable');
		}

		// Б. Ріжемо на шматки
		const chunks = splitText(fullText);
		console.log(
			`[RAG] Document ${docId}: generated ${chunks.length} chunks`
		);

		// В. Ініціалізуємо модель (якщо ще не завантажена)
		const embedder = await getEmbedder();

		// Г. Готуємо колекцію в ChromaDB
		// Кожен Workspace має свою колекцію. Це ізолює дані.
		const collectionName = `workspace_${workspaceId}`;
		const collection = await chromaClient.getOrCreateCollection({
			name: collectionName,
		});

		// Д. Генеруємо вектори і зберігаємо
		const ids = [];
		const embeddings = [];
		const metadatas = [];
		const documents = [];

		for (let i = 0; i < chunks.length; i++) {
			const chunk = chunks[i];

			// Локальна генерація вектора
			const output = await embedder(chunk, {
				pooling: 'mean',
				normalize: true,
			});
			// output.data - це Float32Array, конвертуємо в звичайний масив
			const vector = Array.from(output.data);

			ids.push(`doc_${docId}_chunk_${i}`);
			embeddings.push(vector);
			documents.push(chunk);
			metadatas.push({
				docId: docId,
				source: filePath,
			});
		}

		// Записуємо все в ChromaDB одним пакетом
		await collection.add({
			ids,
			embeddings,
			metadatas,
			documents,
		});

		console.log(`[RAG] Successfully indexed document ${docId}`);
		return true;
	} catch (err) {
		console.error('[RAG Error]', err);
		throw err;
	}
};

module.exports = { processDocument };
