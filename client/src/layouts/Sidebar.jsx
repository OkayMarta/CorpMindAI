import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
	MessageSquare,
	PlusCircle,
	Bell,
	Settings,
	LogOut,
	X,
} from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const Sidebar = ({
	onOpenCreate,
	onOpenNotifications,
	onOpenProfile,
	notificationCount = 0,
	onClose,
}) => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [logoutModalOpen, setLogoutModalOpen] = useState(false);

	const isActive = (path) => location.pathname === path;
	const handleLogoutClick = () => setLogoutModalOpen(true);
	const handleConfirmLogout = () => {
		logout();
		navigate('/');
		setLogoutModalOpen(false);
	};

	return (
		<div className="flex flex-col h-full w-full bg-dark">
			{/* --- HEADER SIDEBAR --- */}

			{/* 1. MOBILE VERSION: Close Button (X) */}
			<div className="lg:hidden h-16 flex items-center px-4 border-b border-gray-700 flex-shrink-0">
				<button
					onClick={onClose}
					className="text-gray-400 hover:text-light transition-colors p-1"
				>
					<X className="w-6 h-6" />
				</button>
			</div>

			{/* 2. DESKTOP VERSION: Logo */}
			<div className="hidden lg:flex h-16 items-center px-6 border-b border-gray-700 flex-shrink-0">
				<img
					src="/logoCropped.svg"
					alt="CorpMindAI"
					className="h-12 mr-3"
				/>
				<span className="font-bold text-2xl tracking-wide text-light">
					CorpMind<span className="text-gold">AI</span>
				</span>
			</div>

			{/* --- PROFILE INFO --- */}
			<div className="p-6 flex flex-col items-center border-b border-gray-800 flex-shrink-0">
				<div className="relative mb-3">
					<Avatar
						url={user?.avatar_url}
						name={user?.nickname}
						size="w-20 h-20"
						textSize="text-2xl"
					/>
					<div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-dark rounded-full"></div>
				</div>
				<h3 className="text-light font-bold text-lg truncate max-w-full px-2">
					{user?.nickname || 'Guest'}
				</h3>
				<p className="text-gray-500 text-sm truncate max-w-full mb-1 px-2">
					{user?.email}
				</p>
			</div>

			{/* --- NAVIGATION --- */}
			<nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
				<button
					onClick={() => {
						navigate('/dashboard');
						onClose && onClose();
					}}
					className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
						isActive('/dashboard') || isActive('/')
							? 'bg-blue text-light shadow-md'
							: 'text-gray-400 hover:bg-gray-800 hover:text-light'
					}`}
				>
					<MessageSquare className="w-5 h-5 flex-shrink-0" />{' '}
					<span className="font-medium">My Workspaces</span>
				</button>
				<button
					onClick={() => {
						onOpenCreate();
						onClose && onClose();
					}}
					className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gold transition-all group"
				>
					<PlusCircle className="w-5 h-5 flex-shrink-0 group-hover:text-gold" />{' '}
					<span className="font-medium">Create New Chat</span>
				</button>
				<button
					onClick={() => {
						onOpenNotifications();
						onClose && onClose();
					}}
					className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-light transition-all relative"
				>
					<div className="relative flex-shrink-0">
						<Bell className="w-5 h-5" />
						{notificationCount > 0 && (
							<span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-uiError rounded-full animate-pulse"></span>
						)}
					</div>
					<span className="font-medium flex-1 text-left flex justify-between">
						Notifications{' '}
						{notificationCount > 0 && (
							<span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
								{notificationCount}
							</span>
						)}
					</span>
				</button>
				<button
					onClick={() => {
						onOpenProfile();
						onClose && onClose();
					}}
					className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-light transition-all"
				>
					<Settings className="w-5 h-5 flex-shrink-0" />{' '}
					<span className="font-medium">Profile Settings</span>
				</button>
			</nav>

			{/* --- LOGOUT --- */}
			<div className="p-4 border-t border-gray-800 flex-shrink-0">
				<button
					onClick={handleLogoutClick}
					className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-uiError hover:border-uiError transition-all"
				>
					<LogOut className="w-4 h-4" />{' '}
					<span className="text-sm font-semibold uppercase tracking-wider">
						Log Out
					</span>
				</button>
			</div>

			<ConfirmationModal
				isOpen={logoutModalOpen}
				onClose={() => setLogoutModalOpen(false)}
				onConfirm={handleConfirmLogout}
				title="Log Out"
				message="Are you sure you want to log out?"
				confirmText="Log Out"
				isDangerous={true}
			/>
		</div>
	);
};

export default Sidebar;
