const { ChromaClient } = require('chromadb');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// 1. Підключення до Chroma (Docker)
const chromaClient = new ChromaClient({ path: 'http://localhost:8000' });

// 2. Підключення до Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Використовуємо модель
const llmModel = genAI.getGenerativeModel({
	model: 'gemini-flash-latest',
});
// 3. Локальна модель для ембеддингів (Singleton)
// Це "мозок", який перетворює текст у цифри прямо у тебе на комп'ютері
let embedder = null;

const getEmbedder = async () => {
	if (!embedder) {
		const { pipeline } = await import('@xenova/transformers');
		console.log('⏳ Loading embedding model... (first time runs slower)');

		// Використовуємо маленьку, але потужну модель
		embedder = await pipeline(
			'feature-extraction',
			'Xenova/all-MiniLM-L6-v2'
		);

		console.log('✅ Embedding model loaded!');
	}
	return embedder;
};

module.exports = { chromaClient, llmModel, getEmbedder };
