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
	async delete(id) {
		const res = await api.delete(`/workspaces/${id}`);
		return res.data;
	},
	async leave(id) {
		const res = await api.delete(`/workspaces/${id}/leave`);
		return res.data;
	},
	async update(id, title) {
		const res = await api.put(`/workspaces/${id}`, { title });
		return res.data;
	},
};
