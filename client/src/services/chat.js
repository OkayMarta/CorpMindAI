import api from './api';

export const chatService = {
	async getHistory(workspaceId) {
		const res = await api.get(`/chat/${workspaceId}`);
		return res.data;
	},

	async sendMessage(workspaceId, content) {
		const res = await api.post('/chat', { workspaceId, content });
		return res.data; // повертає об'єкт повідомлення від ШІ
	},
};
