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

		// Перевіряємо, чи існує колекція
		try {
			collection = await chromaClient.getCollection({
				name: collectionName,
				embeddingFunction: { generate: async () => [] },
			});
		} catch (e) {
			console.log(
				`[Chat] Collection ${collectionName} not found (empty workspace).`
			);
			return "I don't see any documents in this workspace yet. Please upload a PDF, DOCX, or TXT file so I can answer your questions based on them.";
		}

		const searchResults = await collection.query({
			queryEmbeddings: [queryVector],
			nResults: 15,
		});

		const context = searchResults.documents[0].join('\n\n---\n\n');
		console.log(`[Chat] Context length: ${context.length} chars`);

		if (!context || context.length < 50) {
			return 'Unfortunately, I did not find enough information in your documents to answer this question.';
		}

		// 3. Промпт
		const prompt = `
        You are an intelligent expert assistant named "CorpMindAI".
        Your task is to answer the user's question accurately using ONLY the provided context below.
        
        Context information is extracted from the user's uploaded documents.
        
        Instructions:
        1. Analyze the context thoroughly.
        2. If the context contains the answer, explain it clearly.
        3. Use formatting (bullet points, bold text).
        4. If the context has absolutely no relevance to the question, politely state that you cannot find the answer in the documents.

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
