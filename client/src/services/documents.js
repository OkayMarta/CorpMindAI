import api from './api';

export const documentService = {
	// Отримати список
	async getAll(workspaceId) {
		const res = await api.get(`/documents/${workspaceId}`);
		return res.data;
	},

	// Завантажити файл
	async upload(workspaceId, file) {
		const formData = new FormData();
		formData.append('workspaceId', workspaceId);
		formData.append('file', file);

		const res = await api.post('/documents/upload', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
		return res.data;
	},

	// Видалити
	async delete(docId) {
		const res = await api.delete(`/documents/${docId}`);
		return res.data;
	},
};
