import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Search, Menu, ArrowLeft } from 'lucide-react';
import Input from '../components/ui/Input';
import CreateWorkspaceModal from '../features/workspace/components/CreateWorkspaceModal';
import NotificationsModal from '../features/invitations/components/NotificationsModal';
import ProfileSettingsModal from '../features/profile/components/ProfileSettingsModal';
import { workspaceService } from '../services/workspaces';
import { invitationService } from '../services/invitations';
import { toast } from 'react-toastify';

const DashboardLayout = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const isWorkspacePage = location.pathname.includes('/workspace/');

	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
	const [profileModalOpen, setProfileModalOpen] = useState(false);
	const [invitations, setInvitations] = React.useState([]);
	const [searchQuery, setSearchQuery] = useState('');

	useEffect(() => {
		setIsSidebarOpen(false);
		setIsMobileSearchOpen(false);
	}, [location.pathname]);

	useEffect(() => {
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
		<div className="flex h-screen w-full bg-dark text-light overflow-hidden">
			{/* --- SIDEBAR --- */}
			{isSidebarOpen && (
				<div
					className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}

			<div
				className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 bg-dark border-r border-gray-700 transform transition-transform duration-300 ease-in-out flex-shrink-0
                ${
					isSidebarOpen
						? 'translate-x-0'
						: '-translate-x-full lg:translate-x-0'
				}
            `}
			>
				<Sidebar
					onClose={() => setIsSidebarOpen(false)}
					onOpenCreate={() => setCreateModalOpen(true)}
					onOpenNotifications={() => setNotificationsModalOpen(true)}
					onOpenProfile={() => setProfileModalOpen(true)}
					notificationCount={invitations.length}
				/>
			</div>

			{/* --- MAIN CONTENT AREA --- */}
			<div className="flex-1 flex flex-col min-w-0 h-full relative">
				{/* GLOBAL HEADER (Лише якщо не в чаті) */}
				{!isWorkspacePage && (
					<header className="h-16 border-b border-gray-700 bg-dark flex-shrink-0 z-30">
						{/* 1. MOBILE HEADER */}
						<div className="flex lg:hidden items-center justify-between h-full px-4 w-full relative">
							{isMobileSearchOpen ? (
								// --- SEARCH MODE ---
								<div className="flex items-center w-full gap-2 animate-fadeIn">
									<button
										onClick={() =>
											setIsMobileSearchOpen(false)
										}
										className="text-gray-400 p-1"
									>
										<ArrowLeft className="w-6 h-6" />
									</button>
									<div className="flex-1">
										<Input
											autoFocus
											variant="dark"
											placeholder="Search..."
											value={searchQuery}
											onChange={(e) =>
												setSearchQuery(e.target.value)
											}
											className="w-full"
										/>
									</div>
								</div>
							) : (
								// --- NORMAL MODE ---
								<>
									{/* Left: Burger */}
									<button
										onClick={() => setIsSidebarOpen(true)}
										className="text-gray-400 p-1 z-10"
									>
										<Menu className="w-6 h-6" />
									</button>

									{/* Center: Logo */}
									<div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
										<img
											src="/logoCropped.svg"
											alt="Logo"
											className="h-10 w-auto"
										/>
									</div>

									{/* Right: Search Icon */}
									<button
										onClick={() =>
											setIsMobileSearchOpen(true)
										}
										className="text-gray-400 p-1 z-10"
									>
										<Search className="w-6 h-6" />
									</button>
								</>
							)}
						</div>

						{/* 2. DESKTOP HEADER */}
						<div className="hidden lg:flex items-center justify-center h-full px-8 w-full">
							<div className="w-full max-w-xl">
								<Input
									icon={Search}
									placeholder="Search workspaces..."
									variant="dark"
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
								/>
							</div>
						</div>
					</header>
				)}

				{/* CONTENT (Outlet) */}
				<main className="flex-1 overflow-hidden relative flex flex-col">
					<Outlet context={{ searchQuery }} />
				</main>
			</div>

			{/* Modals */}
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
