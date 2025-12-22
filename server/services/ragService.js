const fs = require('fs');
const pdf = require('@cyber2024/pdf-parse-fixed');
const mammoth = require('mammoth');
const { chromaClient, getEmbedder } = require('../config/ai');

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
		console.error('File parsing error:', err);
		throw new Error('Failed to parse document content');
	}
};

const splitText = (text, chunkSize = 1000, overlap = 200) => {
	if (!text) return [];
	const cleanText = text.replace(/\s+/g, ' ').trim();
	const chunks = [];
	for (let i = 0; i < cleanText.length; i += chunkSize - overlap) {
		chunks.push(cleanText.slice(i, i + chunkSize));
	}
	return chunks;
};

const processDocument = async (filePath, fileType, workspaceId, docId) => {
	try {
		// 1. Text Extraction
		console.log(`[RAG] Reading file: ${filePath}`);
		const fullText = await extractText(filePath, fileType);

		if (!fullText || fullText.length < 10) {
			throw new Error('File content is empty or too short');
		}

		// 2. Chunking
		const chunks = splitText(fullText);
		console.log(`[RAG] Split into ${chunks.length} chunks`);

		// 3. Setup AI & DB
		const embedder = await getEmbedder();
		const collectionName = `workspace_${workspaceId}`;
		const collection = await chromaClient.getOrCreateCollection({
			name: collectionName,
			embeddingFunction: {
				generate: async (texts) => {
					// Це заглушка. Ми генеруємо вектори самі через BAAI,
					// але Хрома вимагає функцію, якщо ми не хочемо дефолтну.
					return [];
				},
			},
		});

		// 4. Vectorization & Indexing
		const ids = [];
		const embeddings = [];
		const metadatas = [];
		const documents = [];

		// Обробляємо кожен шматок
		for (let i = 0; i < chunks.length; i++) {
			const chunk = chunks[i];

			// Генеруємо вектор
			const output = await embedder(chunk, {
				pooling: 'mean',
				normalize: true,
			});
			const vector = Array.from(output.data);

			ids.push(`doc_${docId}_chunk_${i}`);
			embeddings.push(vector);
			documents.push(chunk);
			metadatas.push({
				docId: docId,
				source: filePath,
			});
		}

		// Зберігаємо в Chroma
		if (ids.length > 0) {
			await collection.add({ ids, embeddings, metadatas, documents });
		}

		console.log(`[RAG] Document ${docId} indexed successfully!`);
		return true;
	} catch (err) {
		console.error('[RAG Error]', err);
		throw err;
	}
};

module.exports = { processDocument };
