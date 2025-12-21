import api from './api';

export const authService = {
	async register(data) {
		// data = { email, nickname, password }
		const response = await api.post('/auth/register', data);
		return response.data; // повертає { token }
	},

	async login(data) {
		// data = { email, password }
		const response = await api.post('/auth/login', data);
		return response.data; // повертає { token }
	},

	async getMe() {
		const response = await api.get('/auth/me');
		return response.data; // повертає user object
	},

	async forgotPassword(email) {
		const response = await api.post('/auth/forgot-password', { email });
		return response.data;
	},

	async resetPassword(token, password) {
		const response = await api.post(`/auth/reset-password/${token}`, {
			password,
		});
		return response.data;
	},
};
