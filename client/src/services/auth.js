import api from './api';

export const authService = {
	async register(data) {
		const response = await api.post('/auth/register', data);
		return response.data;
	},

	async login(data) {
		const response = await api.post('/auth/login', data);
		return response.data;
	},

	async getMe() {
		const response = await api.get('/auth/me');
		return response.data;
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

	async updateProfile(nickname, avatarFile, shouldRemoveAvatar) {
		const formData = new FormData();
		if (nickname) formData.append('nickname', nickname);
		if (avatarFile) formData.append('avatar', avatarFile);
		if (shouldRemoveAvatar) formData.append('removeAvatar', 'true');

		const response = await api.put('/users/profile', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
		return response.data;
	},

	async deleteAccount() {
		const response = await api.delete('/users/profile');
		return response.data;
	},
};
