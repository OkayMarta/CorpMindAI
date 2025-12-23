import api from './api';

export const workspaceService = {
	async getAll() {
		const res = await api.get('/workspaces');
		return res.data;
	},
	async create(title) {
		const res = await api.post('/workspaces', { title });
		return res.data;
	},
	async getOne(id) {
		const res = await api.get(`/workspaces/${id}`);
		return res.data;
	},
	async getMembers(workspaceId) {
		const res = await api.get(`/workspaces/${workspaceId}/members`);
		return res.data;
	},
};
