const { chromaClient, llmModel, getEmbedder } = require('../config/ai');

const askAI = async (workspaceId, question) => {
	try {
		console.log(`[Chat] Question: ${question}`);

		// 1. Перетворюємо питання на вектор (Embed Query)
		const embedder = await getEmbedder();
		const output = await embedder(question, {
			pooling: 'mean',
			normalize: true,
		});
		const queryVector = Array.from(output.data);

		// 2. Шукаємо в ChromaDB (Retrieval)
		const collectionName = `workspace_${workspaceId}`;
		const collection = await chromaClient.getCollection({
			name: collectionName,
			embeddingFunction: { generate: async () => [] }, // Заглушка
		});

		const searchResults = await collection.query({
			queryEmbeddings: [queryVector],
			nResults: 5, // Беремо 5 найсхожіших шматків
		});

		// 3. Формуємо контекст (Context Construction)
		// searchResults.documents[0] - це масив знайдених текстів
		const context = searchResults.documents[0].join('\n\n---\n\n');

		console.log(`[Chat] Found context length: ${context.length}`);

		if (!context || context.length < 10) {
			return "I couldn't find any relevant information in your documents to answer this question.";
		}

		// 4. Формуємо Промпт (Prompt Engineering)
		const prompt = `
        You are a helpful AI assistant for a corporate knowledge base.
        Use the following context pieces to answer the user's question.
        If the answer is not in the context, just say that you don't know, don't try to make up an answer.
        Keep the answer concise and professional.

        Context:
        ${context}

        Question: 
        ${question}
        `;

		// 5. Запитуємо Gemini (Generation)
		const result = await llmModel.generateContent(prompt);
		const response = result.response;
		const text = response.text();

		return text;
	} catch (err) {
		console.error('[Chat Error]', err);
		throw new Error('Failed to generate answer');
	}
};

module.exports = { askAI };
