import React, { useState, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { authService } from '../../../services/auth';
import { X, User, Save, Camera, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import { handleError } from '../../../utils/errorHandler';

const ProfileSettingsModal = ({ isOpen, onClose }) => {
	const { user, updateUser, logout } = useAuth();

	// State
	const [nickname, setNickname] = useState(user?.nickname || '');
	const [preview, setPreview] = useState(user?.avatar_url || null);

	const [avatarFile, setAvatarFile] = useState(null);
	const [removeAvatar, setRemoveAvatar] = useState(false);

	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState('general');

	// State для модалки видалення
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);

	const fileInputRef = useRef(null);

	// Оновлюємо дані при відкритті модалки
	React.useEffect(() => {
		if (isOpen && user) {
			setNickname(user.nickname);
			setPreview(user.avatar_url);
			setAvatarFile(null);
			setRemoveAvatar(false);
		}
	}, [isOpen, user]);

	// --- Handlers ---

	const handleFileSelect = (e) => {
		const file = e.target.files[0];
		if (file) {
			setAvatarFile(file);
			setRemoveAvatar(false);
			const objectUrl = URL.createObjectURL(file);
			setPreview(objectUrl);
		}
	};

	const handleRemoveAvatarClick = (e) => {
		e.stopPropagation();
		setPreview(null);
		setAvatarFile(null);
		setRemoveAvatar(true);
		if (fileInputRef.current) fileInputRef.current.value = '';
	};

	const handleUpdate = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			if (nickname === user.nickname && !avatarFile && !removeAvatar)
				return;

			const updatedUserData = await authService.updateProfile(
				nickname,
				avatarFile,
				removeAvatar
			);

			updateUser(updatedUserData);
			toast.success('Profile updated successfully!');
		} catch (error) {
			handleError(error, 'Update failed');
		} finally {
			setLoading(false);
		}
	};

	// 1. Просто відкриває модалку
	const handleDeleteClick = () => {
		setDeleteModalOpen(true);
	};

	// 2. Реальне видалення (викликається з модалки)
	const handleConfirmDelete = async () => {
		setLoading(true);
		try {
			await authService.deleteAccount();
			toast.success('Account deleted.');
			logout(); // Це перенаправить на головну
		} catch (error) {
			handleError(error, 'Failed to delete account');
			setLoading(false);
			setDeleteModalOpen(false);
		}
	};

	if (!isOpen) return null;

	const getTabClass = (name) => {
		const isActive = activeTab === name;
		return `py-4 text-sm font-medium border-b-2 transition-colors ${
			isActive
				? 'border-blue text-blue'
				: 'border-transparent text-gray-400 hover:text-light'
		}`;
	};

	return (
		<>
			<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
				<div className="bg-dark2 border border-gray-700 rounded-xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
					{/* Header */}
					<div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-700 flex-shrink-0">
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
					<div className="flex border-b border-gray-700 px-6 gap-6 flex-shrink-0">
						<button
							onClick={() => setActiveTab('general')}
							className={getTabClass('general')}
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
					<div className="p-6 overflow-y-auto custom-scrollbar">
						{/* ===== GENERAL TAB ===== */}
						{activeTab === 'general' && (
							<form onSubmit={handleUpdate} className="space-y-6">
								{/* Avatar Upload */}
								<div className="flex flex-col items-center gap-4">
									<div className="relative group">
										<div
											className="cursor-pointer relative"
											onClick={() =>
												fileInputRef.current.click()
											}
										>
											{preview ? (
												<img
													src={
														preview.startsWith(
															'blob:'
														)
															? preview
															: `/api/users/avatar/${preview
																	.split(
																		/[/\\]/
																	)
																	.pop()}?token=${localStorage.getItem(
																	'token'
															  )}`
													}
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

											<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
												<Camera className="w-8 h-8 text-light drop-shadow-md" />
											</div>
										</div>

										{preview && (
											<button
												type="button"
												onClick={
													handleRemoveAvatarClick
												}
												className="absolute -right-2 top-0 bg-gray-800 hover:bg-uiError text-light p-1.5 rounded-full border border-gray-600 transition-colors shadow-sm z-10"
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
										onClick={() =>
											fileInputRef.current.click()
										}
										className="text-blue text-sm hover:underline"
									>
										Change Avatar
									</button>
								</div>

								<Input
									variant="dark"
									label="Nickname"
									value={nickname}
									onChange={(e) =>
										setNickname(e.target.value)
									}
									placeholder="Enter new nickname"
								/>

								<Button
									type="submit"
									isLoading={loading}
									disabled={
										nickname === user?.nickname &&
										!avatarFile &&
										!removeAvatar
									}
									className="w-full py-3"
								>
									<Save className="w-5 h-5" />
									Save Changes
								</Button>
							</form>
						)}

						{/* ===== DANGER ZONE TAB ===== */}
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
										workspaces, documents, and messages will
										be permanently deleted.
									</p>
								</div>

								<Button
									variant="danger"
									onClick={handleDeleteClick}
									isLoading={loading}
									className="w-full py-3"
								>
									<Trash2 className="w-5 h-5" />
									Delete My Account
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>

			<ConfirmationModal
				isOpen={deleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				onConfirm={handleConfirmDelete}
				isLoading={loading}
				title="Delete Account"
				message="Are you absolutely sure you want to delete your account? This action cannot be undone. You will lose all your workspaces and data."
				confirmText="Delete My Account"
				isDangerous={true}
			/>
		</>
	);
};

export default ProfileSettingsModal;
