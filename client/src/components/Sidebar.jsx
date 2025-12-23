// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
	LogOut,
	Settings,
	MessageSquare,
	Plus,
	Bell,
	Check,
	X,
} from 'lucide-react';
import { authService } from '../services/auth';
import { workspaceService } from '../services/workspaces';
import { invitationService } from '../services/invitations'; // Імпорт сервісу
import { toast } from 'react-toastify';

const Sidebar = ({ onSelectWorkspace }) => {
	const navigate = useNavigate();
	const [workspaces, setWorkspaces] = useState([]);
	const [invitations, setInvitations] = useState([]);
	const [showNotifications, setShowNotifications] = useState(false);
	const [currentUser, setCurrentUser] = useState(null);

	// Завантаження даних
	const fetchData = async () => {
		try {
			const [wsData, inviteData, userData] = await Promise.all([
				workspaceService.getAll(),
				invitationService.getMyInvitations(),
				authService.getMe(),
			]);
			setWorkspaces(wsData);
			setInvitations(inviteData);
			setCurrentUser(userData);
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	// Обробка відповіді на запрошення
	const handleRespond = async (token, action) => {
		try {
			await invitationService.respond(token, action);
			toast.success(
				action === 'accept'
					? 'Joined workspace!'
					: 'Invitation declined'
			);

			// Оновлюємо списки
			const newInvites = invitations.filter((i) => i.token !== token);
			setInvitations(newInvites);

			if (newInvites.length === 0) setShowNotifications(false);

			if (action === 'accept') {
				const updatedWorkspaces = await workspaceService.getAll();
				setWorkspaces(updatedWorkspaces);
			}
		} catch (err) {
			toast.error(err.response?.data || 'Error responding');
		}
	};

	const handleLogout = () => {
		localStorage.removeItem('token');
		window.location.href = '/';
	};

	return (
		<div className="w-20 md:w-64 bg-dark border-r border-gray-800 flex flex-col h-screen text-white transition-all duration-300 relative">
			{/* Логотип */}
			<div className="p-4 md:p-6 flex items-center justify-between font-bold text-xl tracking-wider text-purple">
				<span className="hidden md:block">CorpMind</span>
				<span className="md:hidden">CM</span>
			</div>

			{/* СПОВІЩЕННЯ (Notification Center) */}
			<div className="px-4 mb-4 relative">
				<button
					onClick={() => setShowNotifications(!showNotifications)}
					className="relative p-2 rounded-lg hover:bg-gray-800 transition w-full flex items-center justify-center md:justify-start"
				>
					<Bell size={20} className="text-gray-400" />
					<span className="hidden md:block ml-3 text-sm text-gray-400">
						Notifications
					</span>
					{invitations.length > 0 && (
						<span className="absolute top-1 right-2 md:top-2 md:right-auto md:left-6 w-3 h-3 bg-red-500 rounded-full border-2 border-dark"></span>
					)}
				</button>

				{/* Випадаюче меню сповіщень */}
				{showNotifications && (
					<div className="absolute left-16 md:left-4 top-12 w-72 bg-[#1A1D21] border border-gray-700 rounded-lg shadow-xl z-50 p-2">
						<h3 className="text-sm font-bold text-gray-300 mb-2 px-2">
							Invitations
						</h3>
						{invitations.length === 0 ? (
							<p className="text-xs text-gray-500 px-2 pb-2">
								No new invitations
							</p>
						) : (
							<div className="space-y-2 max-h-60 overflow-y-auto">
								{invitations.map((inv) => (
									<div
										key={inv.id}
										className="bg-gray-800 p-3 rounded text-sm"
									>
										<p className="text-white mb-1">
											<span className="text-purple font-semibold">
												{inv.sender_nickname}
											</span>{' '}
											invited you to{' '}
											<span className="text-blue font-semibold">
												{inv.workspace_title}
											</span>
										</p>
										<div className="flex gap-2 mt-2">
											<button
												onClick={() =>
													handleRespond(
														inv.token,
														'accept'
													)
												}
												className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded flex items-center justify-center gap-1 transition"
											>
												<Check size={14} /> Accept
											</button>
											<button
												onClick={() =>
													handleRespond(
														inv.token,
														'decline'
													)
												}
												className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded flex items-center justify-center gap-1 transition"
											>
												<X size={14} /> Decline
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>

			{/* Список воркспейсів */}
			<div className="flex-1 overflow-y-auto px-2 space-y-1">
				<div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 hidden md:block">
					Workspaces
				</div>
				{workspaces.map((ws) => (
					<Link
						key={ws.id}
						to={`/workspace/${ws.id}`}
						onClick={() =>
							onSelectWorkspace && onSelectWorkspace(ws)
						}
						className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors group"
					>
						<MessageSquare size={18} />
						<span className="ml-3 hidden md:block truncate">
							{ws.title}
						</span>
						{/* Роль користувача (опціонально) */}
						{ws.role === 'owner' && (
							<span className="ml-auto text-[10px] bg-purple/20 text-purple px-1 rounded hidden md:block">
								OWNER
							</span>
						)}
					</Link>
				))}
			</div>

			{/* Профіль та Вихід */}
			<div className="p-4 border-t border-gray-800">
				<div className="flex items-center gap-3 mb-4 px-2">
					<div className="w-8 h-8 rounded-full bg-gradient-btn flex items-center justify-center text-white font-bold text-sm">
						{currentUser?.nickname?.charAt(0).toUpperCase()}
					</div>
					<div className="hidden md:block overflow-hidden">
						<p className="text-sm font-medium text-white truncate">
							{currentUser?.nickname}
						</p>
						<p className="text-xs text-gray-500 truncate">
							{currentUser?.email}
						</p>
					</div>
				</div>
				<button
					onClick={handleLogout}
					className="flex items-center w-full px-2 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
				>
					<LogOut size={18} />
					<span className="ml-3 hidden md:block text-sm">
						Log Out
					</span>
				</button>
			</div>
		</div>
	);
};

export default Sidebar;
