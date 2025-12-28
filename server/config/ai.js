const { ChromaClient } = require('chromadb');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// 1. Chroma
const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
const chromaClient = new ChromaClient({ path: chromaUrl });

// 2. Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const llmModel = genAI.getGenerativeModel({
	model: 'gemini-1.5-flash',
});

// 3. Локальна модель (Embeddings)
let embedder = null;

const getEmbedder = async () => {
	if (!embedder) {
		const { pipeline } = await import('@xenova/transformers');
		console.log('⏳ Loading embedding model...');

		embedder = await pipeline(
			'feature-extraction',
			'Xenova/paraphrase-multilingual-MiniLM-L12-v2'
		);

		console.log('Multilingual Embedding model loaded!');
	}
	return embedder;
};

module.exports = { chromaClient, llmModel, getEmbedder };
