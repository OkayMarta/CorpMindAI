import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
	MessageSquare,
	PlusCircle,
	Bell,
	Settings,
	LogOut,
} from 'lucide-react';

const Sidebar = ({
	onOpenCreate,
	onOpenNotifications,
	notificationCount = 0,
}) => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const isActive = (path) => location.pathname === path;

	const getInitials = (name) => {
		return name ? name.substring(0, 2).toUpperCase() : 'UR';
	};

	const handleLogout = () => {
		logout();
		navigate('/');
	};

	const handleProfileClick = () => {
		toast.info('Profile settings are under development');
	};

	return (
		<aside className="w-72 bg-dark border-r border-gray-700 flex flex-col fixed left-0 top-16 h-[calc(100vh-64px)] overflow-y-auto">
			{/* PROFILE */}
			<div className="p-6 flex flex-col items-center border-b border-gray-800">
				<div className="relative mb-3">
					{user?.avatar_url ? (
						<img
							src={user.avatar_url}
							alt={user.nickname}
							className="w-20 h-20 rounded-full object-cover border-2 border-blue"
						/>
					) : (
						<div className="w-20 h-20 rounded-full bg-gradient-btn flex items-center justify-center text-light text-2xl font-bold shadow-lg">
							{getInitials(user?.nickname)}
						</div>
					)}
					<div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-dark rounded-full"></div>
				</div>

				<h3 className="text-light font-bold text-lg truncate max-w-full">
					{user?.nickname || 'Guest'}
				</h3>
				<p className="text-gray-500 text-sm truncate max-w-full mb-1">
					{user?.email}
				</p>
			</div>

			{/* NAVIGATION */}
			<nav className="flex-1 p-4 space-y-2">
				<button
					onClick={() => navigate('/dashboard')}
					className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
						isActive('/dashboard') || isActive('/')
							? 'bg-blue text-light shadow-md'
							: 'text-gray-400 hover:bg-gray-800 hover:text-light'
					}`}
				>
					<MessageSquare className="w-5 h-5" />
					<span className="font-medium">My Workspaces</span>
				</button>

				<button
					onClick={onOpenCreate}
					className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gold transition-all duration-200 group"
				>
					<PlusCircle className="w-5 h-5 group-hover:text-gold transition-colors" />
					<span className="font-medium">Create New Chat</span>
				</button>

				<button
					onClick={onOpenNotifications}
					className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-light transition-all duration-200 relative"
				>
					<div className="relative">
						<Bell className="w-5 h-5" />
						{notificationCount > 0 && (
							<span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-uiError rounded-full animate-pulse shadow-[0_0_8px_rgba(241,70,104,0.6)]"></span>
						)}
					</div>
					<span className="font-medium">
						Notifications
						{notificationCount > 0 && (
							<span className="ml-2 text-xs bg-gray-700 px-2 py-0.5 rounded-full text-light">
								{notificationCount}
							</span>
						)}
					</span>
				</button>

				<button
					onClick={handleProfileClick}
					className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-light transition-all duration-200"
				>
					<Settings className="w-5 h-5" />
					<span className="font-medium">Profile Settings</span>
				</button>
			</nav>

			{/* LOGOUT */}
			<div className="p-4 border-t border-gray-800">
				<button
					onClick={handleLogout}
					className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-uiError hover:border-uiError transition-all duration-300"
				>
					<LogOut className="w-4 h-4" />
					<span className="text-sm font-semibold uppercase tracking-wider">
						Log Out
					</span>
				</button>
			</div>
		</aside>
	);
};

export default Sidebar;
