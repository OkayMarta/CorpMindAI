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
	User,
} from 'lucide-react';

const Sidebar = ({ onOpenCreate }) => {
	const { user, logoutUser } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	// Функція для активного стилю
	const isActive = (path) => location.pathname === path;

	// Генерація ініціалів для аватара, якщо немає фото
	const getInitials = (name) => {
		return name ? name.substring(0, 2).toUpperCase() : 'UR';
	};

	// Обробник виходу
	const handleLogout = () => {
		logoutUser();
		navigate('/');
	};

	// Обробник профілю (поки немає сторінки)
	const handleProfileClick = () => {
		toast.info('Profile settings are under development');
		// Коли створите сторінку Profile.jsx і додасте роут, розкоментуйте:
		// navigate('/profile');
	};

	return (
		<aside className="w-72 bg-[#141619] border-r border-gray-700 flex flex-col fixed left-0 h-[calc(100vh-64px)] overflow-y-auto">
			{/* --- 1. PROFILE SECTION (Top) --- */}
			<div className="p-6 flex flex-col items-center border-b border-gray-800">
				{/* Avatar */}
				<div className="relative mb-3">
					{user?.avatar_url ? (
						<img
							src={user.avatar_url}
							alt={user.nickname}
							className="w-20 h-20 rounded-full object-cover border-2 border-blue"
						/>
					) : (
						<div className="w-20 h-20 rounded-full bg-gradient-btn flex items-center justify-center text-white text-2xl font-bold shadow-lg">
							{getInitials(user?.nickname)}
						</div>
					)}
				</div>

				{/* User Info */}
				<h3 className="text-white font-bold text-lg truncate max-w-full">
					{user?.nickname || 'Guest'}
				</h3>
				<p className="text-gray-500 text-sm truncate max-w-full mb-1">
					{user?.email}
				</p>
			</div>

			{/* --- 2. NAVIGATION BUTTONS --- */}
			<nav className="flex-1 p-4 space-y-2">
				{/* My Chats */}
				<button
					onClick={() => navigate('/')}
					className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
						isActive('/')
							? 'bg-blue text-white shadow-md'
							: 'text-gray-400 hover:bg-gray-800 hover:text-white'
					}`}
				>
					<MessageSquare className="w-5 h-5" />
					<span className="font-medium">My Workspaces</span>
				</button>

				{/* Create New Chat */}
				<button
					onClick={onOpenCreate}
					className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gold transition-all duration-200 group"
				>
					<PlusCircle className="w-5 h-5 group-hover:text-gold transition-colors" />
					<span className="font-medium">Create New Chat</span>
				</button>

				{/* Notifications */}
				<button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200 relative">
					<div className="relative">
						<Bell className="w-5 h-5" />
						{/* Example badge */}
						<span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-uiError rounded-full"></span>
					</div>
					<span className="font-medium">Notifications</span>
				</button>

				{/* Profile Settings */}
				<button
					onClick={() => navigate('/profile')} // Припустимо, що такий роут є або буде
					className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200"
				>
					<Settings className="w-5 h-5" />
					<span className="font-medium">Profile Settings</span>
				</button>
			</nav>

			{/* --- 3. FOOTER (Logout) --- */}
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
