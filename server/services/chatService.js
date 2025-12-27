const { chromaClient, llmModel, getEmbedder } = require('../config/ai');

const askAI = async (workspaceId, question) => {
	try {
		console.log(`[Chat] Question: ${question}`);

		// 1. Векторизація питання
		const embedder = await getEmbedder();
		const output = await embedder(question, {
			pooling: 'mean',
			normalize: true,
		});
		const queryVector = Array.from(output.data);

		// 2. Пошук в ChromaDB
		const collectionName = `workspace_${workspaceId}`;
		let collection;

		// Перевіряємо, чи існує колекція, перш ніж робити запит
		try {
			collection = await chromaClient.getCollection({
				name: collectionName,
				embeddingFunction: { generate: async () => [] },
			});
		} catch (e) {
			// Якщо колекції немає - це нормально для нового чату
			console.log(
				`[Chat] Collection ${collectionName} not found (empty workspace).`
			);
			// Повертаємо загальну відповідь від LLM без контексту
			const result = await llmModel.generateContent(
				`Answer the user's question. Context is unavailable (no documents). Question: ${question}`
			);
			return result.response.text();
		}

		const searchResults = await collection.query({
			queryEmbeddings: [queryVector],
			nResults: 15,
		});

		const context = searchResults.documents[0].join('\n\n---\n\n');
		console.log(`[Chat] Context length: ${context.length} chars`);

		// Якщо контекст порожній або дуже малий
		if (!context || context.length < 50) {
			return 'Unfortunately, I did not find enough information in your documents to answer this question.';
		}

		// 3. Промпт
		const prompt = `
        You are an intelligent expert assistant named "CorpMindAI".
        Your task is to answer the user's question accurately using ONLY the provided context below.
        
        Context information is extracted from the user's uploaded documents (PDFs, etc).
        
        Instructions:
        1. Analyze the context thoroughly. The answer might be spread across multiple sections.
        2. If the context contains the answer, explain it clearly in Ukrainian.
        3. Use formatting (bullet points, bold text) to make the answer readable.
        4. If the exact answer is missing, but there is related info, summarize what is available.
        5. If the context has absolutely no relevance to the question, politely state that you cannot find the answer in the documents.

        Context:
        ${context}

        User Question: 
        ${question}
        `;

		// 4. Генерація
		const result = await llmModel.generateContent(prompt);
		const response = result.response;
		const text = response.text();

		return text;
	} catch (err) {
		console.error('[Chat Error]', err);
		return 'Sorry, an error occurred while processing the request.';
	}
};

module.exports = { askAI };
