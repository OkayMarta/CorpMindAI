import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Імпортуємо модалки, які глобальні для лейауту
import CreateWorkspaceModal from '../features/workspace/components/CreateWorkspaceModal';
import NotificationsModal from '../features/invitations/components/NotificationsModal';
import ProfileSettingsModal from '../features/profile/components/ProfileSettingsModal';

// Сервіси для глобальних дій (створення, запрошення)
import { workspaceService } from '../services/workspaces';
import { invitationService } from '../services/invitations';
import { toast } from 'react-toastify';

const DashboardLayout = () => {
	const navigate = useNavigate();

	// Стан модалок
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
	const [profileModalOpen, setProfileModalOpen] = useState(false);

	// Стан запрошень (для бейджика в сайдбарі)
	const [invitations, setInvitations] = React.useState([]);

	React.useEffect(() => {
		const fetchInvites = async () => {
			try {
				const data = await invitationService.getMyInvitations();
				setInvitations(data);
			} catch (e) {
				console.error(e);
			}
		};
		fetchInvites();
	}, []);

	// Хендлери
	const handleCreateSubmit = async (title) => {
		try {
			const newWorkspace = await workspaceService.create(title);
			toast.success('Workspace created!');
			setCreateModalOpen(false);
			navigate(`/workspace/${newWorkspace.id}`);
		} catch (error) {
			toast.error('Failed to create workspace');
		}
	};

	const handleRespondToInvitation = async (token, action) => {
		try {
			await invitationService.respond(token, action);
			setInvitations((prev) => prev.filter((inv) => inv.token !== token));
			if (action === 'accept') toast.success('Invitation accepted!');
		} catch (error) {
			toast.error('Failed to respond');
		}
	};

	return (
		<div className="min-h-screen bg-dark text-light font-sans flex flex-col">
			{/* Header */}
			<header className="h-16 border-b border-gray-700 bg-dark flex items-center flex-shrink-0 z-20 fixed top-0 w-full">
				<div className="w-72 flex items-center px-6 border-r border-gray-700 h-full">
					<img
						src="/logoCropped.svg"
						alt="CorpMind AI"
						className="h-12 mr-3"
					/>
					<span className="font-bold text-2xl tracking-wide">
						CorpMind<span className="text-gold">AI</span>
					</span>
				</div>
				<div className="flex-1 flex justify-center items-center px-4">
					<div className="relative w-full max-w-xl">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
						<input
							type="text"
							placeholder="Search (global)..."
							className="w-full bg-dark2 border border-gray-700 text-light rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-blue transition-colors"
						/>
					</div>
				</div>
			</header>

			<div className="flex flex-1 pt-16 h-screen">
				<Sidebar
					onOpenCreate={() => setCreateModalOpen(true)}
					onOpenNotifications={() => setNotificationsModalOpen(true)}
					onOpenProfile={() => setProfileModalOpen(true)}
					notificationCount={invitations.length}
				/>

				{/* ТУТ ВІДОБРАЖАЮТЬСЯ СТОРІНКИ (Dashboard.jsx або Workspace.jsx) */}
				<main className="flex-1 overflow-y-auto bg-dark ml-72">
					<Outlet />
				</main>
			</div>

			{/* Global Modals */}
			<CreateWorkspaceModal
				isOpen={createModalOpen}
				onClose={() => setCreateModalOpen(false)}
				onSubmit={handleCreateSubmit}
			/>
			<NotificationsModal
				isOpen={notificationsModalOpen}
				onClose={() => setNotificationsModalOpen(false)}
				invitations={invitations}
				onRespond={handleRespondToInvitation}
			/>
			<ProfileSettingsModal
				isOpen={profileModalOpen}
				onClose={() => setProfileModalOpen(false)}
			/>
		</div>
	);
};

export default DashboardLayout;
