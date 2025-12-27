import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Search, Menu, X, ArrowLeft } from 'lucide-react';

// UI Components
import Input from '../components/ui/Input';

// Modals & Services
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

	// State for UI
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

	// Modals State
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
	const [profileModalOpen, setProfileModalOpen] = useState(false);

	const [invitations, setInvitations] = React.useState([]);
	const [searchQuery, setSearchQuery] = useState('');

	// Закриваємо мобільні меню при зміні роуту
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
		<div className="min-h-screen bg-dark text-light font-sans flex flex-col">
			{/* Header */}
			<header className="h-16 border-b border-gray-700 bg-dark flex items-center fixed top-0 w-full z-40 transition-all duration-300">
				{/* --- MOBILE/TABLET SEARCH MODE --- */}
				{isMobileSearchOpen ? (
					<div className="w-full flex items-center px-4 animate-fadeIn gap-2">
						<button
							onClick={() => setIsMobileSearchOpen(false)}
							className="text-gray-400 p-2"
						>
							<ArrowLeft className="w-6 h-6" />
						</button>
						<div className="flex-1">
							<Input
								autoFocus
								icon={Search}
								placeholder="Search..."
								className="w-full"
								variant="dark"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>
				) : (
					/* --- NORMAL MODE --- */
					<>
						{/* LEFT: Logo (Desktop) / Burger (Mobile/Tablet) */}
						<div className="flex items-center h-full px-4 lg:px-0 lg:w-72 lg:border-r border-gray-700 lg:bg-dark">
							{/* Burger */}
							<button
								onClick={() => setIsSidebarOpen(!isSidebarOpen)}
								className="lg:hidden text-gray-400 mr-4 p-1"
							>
								{isSidebarOpen ? (
									<X className="w-6 h-6" />
								) : (
									<Menu className="w-6 h-6" />
								)}
							</button>

							{/* Logo: Тільки на Desktop (LG+) */}
							<div className="hidden lg:flex items-center px-6">
								<img
									src="/logoCropped.svg"
									alt="CorpMind AI"
									className="h-12 mr-3"
								/>
								<span className="font-bold text-2xl tracking-wide">
									CorpMind
									<span className="text-gold">AI</span>
								</span>
							</div>
						</div>

						{/* CENTER LOGO (Mobile/Tablet Only) */}
						<div className="lg:hidden absolute left-1/2 transform -translate-x-1/2 flex items-center">
							<img
								src="/logoCropped.svg"
								alt="Logo"
								className="h-8 w-auto"
							/>
						</div>

						{/* RIGHT: Search */}
						<div className="flex-1 flex justify-end lg:justify-center items-center px-4">
							{!isWorkspacePage && (
								<>
									{/* Desktop Search Input (LG+) */}
									<div className="hidden lg:block w-full max-w-xl">
										<Input
											icon={Search}
											placeholder="Search workspaces..."
											className="w-full"
											variant="dark"
											value={searchQuery}
											onChange={(e) =>
												setSearchQuery(e.target.value)
											}
										/>
									</div>

									{/* Mobile/Tablet Search Icon */}
									{/* Показуємо ТІЛЬКИ якщо сайдбар закритий */}
									{!isSidebarOpen && (
										<button
											onClick={() =>
												setIsMobileSearchOpen(true)
											}
											className="lg:hidden text-gray-400 p-2"
										>
											<Search className="w-6 h-6" />
										</button>
									)}
								</>
							)}
						</div>
					</>
				)}
			</header>

			{/* Main Container */}
			<div className="flex flex-1 pt-16 h-screen overflow-hidden">
				{/* Sidebar Overlay (Mobile & Tablet) */}
				{isSidebarOpen && (
					<div
						className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
						onClick={() => setIsSidebarOpen(false)}
					/>
				)}

				{/* Sidebar Container */}
				<div
					className={`
					fixed lg:relative 
					z-40 lg:z-auto 
					h-[calc(100vh-64px)] 
					transition-transform duration-300 ease-in-out
					${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
				`}
				>
					<Sidebar
						onOpenCreate={() => setCreateModalOpen(true)}
						onOpenNotifications={() =>
							setNotificationsModalOpen(true)
						}
						onOpenProfile={() => setProfileModalOpen(true)}
						notificationCount={invitations.length}
					/>
				</div>

				{/* Content Area */}
				<main className="flex-1 overflow-y-auto bg-dark w-full relative">
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
