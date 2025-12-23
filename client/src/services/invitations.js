import api from './api';

export const invitationService = {
	// Отримати мої запрошення
	async getMyInvitations() {
		const res = await api.get('/invitations');
		return res.data;
	},

	// Відповісти на запрошення (action = 'accept' | 'decline')
	async respond(token, action) {
		const res = await api.post('/invitations/respond', { token, action });
		return res.data;
	},

	// Надіслати запрошення (адмін воркспейсу)
	async sendInvite(workspaceId, email) {
		const res = await api.post(`/workspaces/${workspaceId}/invite`, {
			email,
		});
		return res.data;
	},
};
