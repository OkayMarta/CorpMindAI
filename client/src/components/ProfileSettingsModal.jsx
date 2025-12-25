import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';
import {
	X,
	User,
	Save,
	Loader2,
	Camera,
	AlertTriangle,
	Trash2,
} from 'lucide-react';
import { toast } from 'react-toastify';

const ProfileSettingsModal = ({ isOpen, onClose }) => {
	const { user, updateUser, logout } = useAuth();

	const [nickname, setNickname] = useState(user?.nickname || '');
	const [preview, setPreview] = useState(user?.avatar_url || null);

	const [avatarFile, setAvatarFile] = useState(null);
	const [removeAvatar, setRemoveAvatar] = useState(false);

	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState('general');
	const fileInputRef = useRef(null);

	React.useEffect(() => {
		if (isOpen && user) {
			setNickname(user.nickname);
			setPreview(user.avatar_url);
			setAvatarFile(null);
			setRemoveAvatar(false);
		}
	}, [isOpen, user]);

	const handleFileSelect = (e) => {
		const file = e.target.files[0];
		if (file) {
			setAvatarFile(file);
			setRemoveAvatar(false);
			const objectUrl = URL.createObjectURL(file);
			setPreview(objectUrl);
		}
	};

	// Обробник видалення аватару (візуально)
	const handleRemoveAvatarClick = () => {
		setPreview(null);
		setAvatarFile(null);
		setRemoveAvatar(true);
		if (fileInputRef.current) fileInputRef.current.value = '';
	};

	const handleUpdate = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			// Якщо нічого не змінилось
			if (nickname === user.nickname && !avatarFile && !removeAvatar)
				return;

			// Передаємо removeAvatar у сервіс
			const updatedUserData = await authService.updateProfile(
				nickname,
				avatarFile,
				removeAvatar
			);

			updateUser(updatedUserData);

			toast.success('Profile updated successfully!');
		} catch (error) {
			console.error(error);
			toast.error(error.response?.data || 'Update failed');
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteAccount = async () => {
		const confirmText = prompt(
			"Type 'DELETE' to confirm account deletion."
		);
		if (confirmText !== 'DELETE') return;

		setLoading(true);
		try {
			await authService.deleteAccount();
			toast.success('Account deleted.');
			logout();
		} catch (error) {
			console.error(error);
			toast.error('Failed to delete account');
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			<div className="bg-dark2 border border-gray-700 rounded-xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
				{/* Header */}
				<div className="flex justify-between items-center p-6 border-b border-gray-700">
					<h2 className="text-xl font-bold text-light flex items-center gap-2">
						<User className="w-5 h-5 text-blue" />
						Profile Settings
					</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-light transition-colors"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				{/* Tabs */}
				<div className="flex border-b border-gray-700 px-6 gap-6">
					<button
						onClick={() => setActiveTab('general')}
						className={`py-4 text-sm font-medium border-b-2 transition-colors ${
							activeTab === 'general'
								? 'border-blue text-blue'
								: 'border-transparent text-gray-400 hover:text-light'
						}`}
					>
						General
					</button>
					<button
						onClick={() => setActiveTab('danger')}
						className={`py-4 text-sm font-medium border-b-2 transition-colors ${
							activeTab === 'danger'
								? 'border-uiError text-uiError'
								: 'border-transparent text-gray-400 hover:text-light'
						}`}
					>
						Danger Zone
					</button>
				</div>

				{/* Content */}
				<div className="p-6">
					{/* --- GENERAL TAB --- */}
					{activeTab === 'general' && (
						<form onSubmit={handleUpdate} className="space-y-6">
							{/* Avatar Section */}
							<div className="flex flex-col items-center gap-4">
								<div className="relative group">
									{/* Саме зображення або градієнт */}
									<div
										className="cursor-pointer"
										onClick={() =>
											fileInputRef.current.click()
										}
									>
										{preview ? (
											<img
												src={preview}
												alt="Avatar"
												className="w-24 h-24 rounded-full object-cover border-4 border-dark2 shadow-lg group-hover:opacity-75 transition-opacity"
											/>
										) : (
											<div className="w-24 h-24 rounded-full bg-gradient-btn flex items-center justify-center text-3xl font-bold text-light border-4 border-dark2 shadow-lg group-hover:opacity-90">
												{user?.nickname
													?.substring(0, 2)
													.toUpperCase()}
											</div>
										)}

										{/* Іконка камери при наведенні */}
										<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
											<Camera className="w-8 h-8 text-light drop-shadow-md" />
										</div>
									</div>

									{/* Кнопка видалення (з'являється, якщо є прев'ю) */}
									{preview && (
										<button
											type="button"
											onClick={handleRemoveAvatarClick}
											className="absolute -right-2 top-0 bg-gray-800 hover:bg-uiError text-light p-1.5 rounded-full border border-gray-600 transition-colors shadow-sm"
											title="Remove Avatar"
										>
											<Trash2 className="w-4 h-4" />
										</button>
									)}
								</div>

								<input
									type="file"
									ref={fileInputRef}
									onChange={handleFileSelect}
									className="hidden"
									accept="image/*"
								/>
								<button
									type="button"
									onClick={() => fileInputRef.current.click()}
									className="text-blue text-sm hover:underline"
								>
									Change Avatar
								</button>
							</div>

							{/* Nickname Input */}
							<div>
								<label className="block text-gray-400 text-sm font-medium mb-2">
									Nickname
								</label>
								<input
									type="text"
									value={nickname}
									onChange={(e) =>
										setNickname(e.target.value)
									}
									className="w-full bg-dark border border-gray-700 text-light rounded-lg px-4 py-3 focus:outline-none focus:border-blue transition-all"
									placeholder="Enter new nickname"
								/>
							</div>

							{/* Save Button */}
							<button
								type="submit"
								disabled={
									loading ||
									(nickname === user?.nickname &&
										!avatarFile &&
										!removeAvatar)
								}
								className={`w-full py-3 rounded-lg font-bold text-light flex items-center justify-center gap-2 transition-all ${
									loading ||
									(nickname === user?.nickname &&
										!avatarFile &&
										!removeAvatar)
										? 'bg-gray-700 cursor-not-allowed text-gray-400'
										: 'bg-gradient-btn hover:bg-gradient-btn-hover shadow-lg'
								}`}
							>
								{loading ? (
									<Loader2 className="w-5 h-5 animate-spin" />
								) : (
									<Save className="w-5 h-5" />
								)}
								Save Changes
							</button>
						</form>
					)}

					{/* --- DANGER ZONE TAB --- */}
					{activeTab === 'danger' && (
						<div className="text-center space-y-6 py-4">
							<div className="bg-uiError/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-uiError">
								<AlertTriangle className="w-8 h-8" />
							</div>
							<div>
								<h3 className="text-lg font-bold text-light mb-2">
									Delete Account
								</h3>
								<p className="text-gray-400 text-sm leading-relaxed">
									This action is permanent. All your owned
									workspaces, documents, and messages will be
									permanently deleted.
								</p>
							</div>
							<button
								onClick={handleDeleteAccount}
								disabled={loading}
								className="w-full bg-transparent border border-uiError text-uiError hover:bg-uiError hover:text-light py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
							>
								{loading ? (
									<Loader2 className="w-5 h-5 animate-spin" />
								) : (
									<Trash2 className="w-5 h-5" />
								)}
								Delete My Account
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ProfileSettingsModal;
