import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Сервіси
import { workspaceService } from '../services/workspaces';
import { chatService } from '../services/chat';
import { invitationService } from '../services/invitations';

// Компоненти
import Sidebar from '../components/Sidebar';
import WorkspaceSettingsModal from '../components/WorkspaceSettingsModal';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal';
import NotificationsModal from '../components/NotificationsModal';
import ProfileSettingsModal from '../components/ProfileSettingsModal';

// Іконки
import {
	ArrowLeft,
	Settings,
	Trash2,
	Send,
	Bot,
	User,
	Loader2,
} from 'lucide-react';
import { toast } from 'react-toastify';

const WorkspaceView = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();

	// --- Data States ---
	const [workspace, setWorkspace] = useState(null);
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [invitations, setInvitations] = useState([]);

	// --- Chat Input State ---
	const [input, setInput] = useState('');
	const [sending, setSending] = useState(false);

	// --- Modal States ---
	const [settingsModalOpen, setSettingsModalOpen] = useState(false);
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
	const [profileModalOpen, setProfileModalOpen] = useState(false);

	const messagesEndRef = useRef(null);

	useEffect(() => {
		const fetchAllData = async () => {
			try {
				const [wsData, chatHistory, inviteData] = await Promise.all([
					workspaceService.getOne(id),
					chatService.getHistory(id),
					invitationService.getMyInvitations(),
				]);
				setWorkspace(wsData);
				setMessages(chatHistory);
				setInvitations(inviteData);
			} catch (error) {
				console.error(error);
				toast.error('Failed to load workspace');
				navigate('/dashboard');
			} finally {
				setLoading(false);
			}
		};
		if (id) fetchAllData();
	}, [id, navigate]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const handleSendMessage = async (e) => {
		e.preventDefault();
		if (!input.trim() || sending) return;

		const userMsgContent = input;
		setInput('');
		setSending(true);

		const tempUserMsg = {
			id: Date.now(),
			role: 'user',
			content: userMsgContent,
			created_at: new Date().toISOString(),
		};
		setMessages((prev) => [...prev, tempUserMsg]);

		try {
			const aiResponse = await chatService.sendMessage(
				id,
				userMsgContent
			);
			setMessages((prev) => [...prev, aiResponse]);
		} catch (error) {
			console.error(error);
			toast.error('Failed to send message');
		} finally {
			setSending(false);
		}
	};

	const handleDeleteWorkspace = async () => {
		if (!workspace) return;
		const isOwner = workspace.role === 'owner';
		const confirmMessage = isOwner
			? `Are you sure you want to delete "${workspace.title}"?`
			: `Are you sure you want to leave "${workspace.title}"?`;

		if (!window.confirm(confirmMessage)) return;

		try {
			if (isOwner) {
				await workspaceService.delete(id);
				toast.success('Workspace deleted');
			} else {
				await workspaceService.leave(id);
				toast.success('Left workspace');
			}
			navigate('/dashboard');
		} catch (error) {
			toast.error('Operation failed');
		}
	};

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

	if (loading)
		return (
			<div className="min-h-screen bg-dark flex items-center justify-center text-light">
				Loading...
			</div>
		);

	return (
		<div className="min-h-screen bg-dark text-light font-sans flex flex-col">
			{/* --- HEADER --- */}
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

				<div className="flex-1 flex items-center justify-between px-6 bg-dark">
					<div className="flex items-center gap-4">
						<button
							onClick={() => navigate('/dashboard')}
							className="p-2 rounded-full text-gray-400 hover:text-light hover:bg-gray-800 transition-colors"
							title="Back to Dashboard"
						>
							<ArrowLeft className="w-5 h-5" />
						</button>

						<h2 className="text-lg font-bold text-light leading-none">
							{workspace?.title}
						</h2>
					</div>

					<div className="flex items-center gap-4">
						<span className="text-xs text-gray-500 hidden sm:inline-block">
							Created{' '}
							{new Date(
								workspace?.created_at
							).toLocaleDateString()}
						</span>

						<span
							className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
								workspace?.role === 'owner'
									? 'bg-gold/20 text-gold'
									: 'bg-purple/20 text-purple'
							}`}
						>
							{workspace?.role === 'owner' ? 'Admin' : 'Member'}
						</span>

						<div className="h-6 w-px bg-gray-700 mx-1"></div>

						<div className="flex items-center gap-1">
							<button
								onClick={() => setSettingsModalOpen(true)}
								className="p-2 text-gray-400 hover:text-light hover:bg-gray-800 rounded-full transition-colors"
								title="Workspace Settings"
							>
								<Settings className="w-5 h-5" />
							</button>
							<button
								onClick={handleDeleteWorkspace}
								className="p-2 text-gray-400 hover:text-uiError hover:bg-uiError/10 rounded-full transition-colors"
								title={
									workspace?.role === 'owner'
										? 'Delete Workspace'
										: 'Leave Workspace'
								}
							>
								<Trash2 className="w-5 h-5" />
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* --- MAIN LAYOUT --- */}
			<div className="flex flex-1 pt-16 h-screen">
				<Sidebar
					onOpenCreate={() => setCreateModalOpen(true)}
					onOpenNotifications={() => setNotificationsModalOpen(true)}
					onOpenProfile={() => setProfileModalOpen(true)}
					notificationCount={invitations.length}
				/>

				<main className="flex-1 flex flex-col bg-dark ml-72 relative h-[calc(100vh-64px)]">
					{/* Messages Scroll Area */}
					<div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
						{messages.length === 0 ? (
							<div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
								<Bot className="w-16 h-16 mb-4 text-blue" />
								<p>
									Start a conversation with your AI assistant.
								</p>
								<p className="text-sm">
									Ask questions about your documents.
								</p>
							</div>
						) : (
							messages.map((msg) => {
								const isUser = msg.role === 'user';
								const isOwner = workspace?.role === 'owner';

								let avatarStyle = '';
								if (!isUser) {
									avatarStyle = 'bg-blue/20 text-blue';
								} else {
									avatarStyle = isOwner
										? 'bg-gold/20 text-gold'
										: 'bg-purple/20 text-purple';
								}

								let bubbleStyle = '';
								if (!isUser) {
									bubbleStyle =
										'bg-dark2 text-gray-200 rounded-tl-sm border border-gray-700';
								} else {
									if (isOwner) {
										bubbleStyle =
											'bg-gold/10 text-light rounded-tr-sm border border-gold/20';
									} else {
										bubbleStyle =
											'bg-purple/10 text-light rounded-tr-sm border border-purple/20';
									}
								}

								return (
									<div
										key={msg.id}
										className={`flex gap-4 max-w-3xl ${
											isUser
												? 'ml-auto flex-row-reverse'
												: ''
										}`}
									>
										<div
											className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${avatarStyle}`}
										>
											{isUser ? (
												<User className="w-5 h-5" />
											) : (
												<Bot className="w-5 h-5" />
											)}
										</div>
										<div
											className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${bubbleStyle}`}
										>
											{msg.content}
										</div>
									</div>
								);
							})
						)}
						<div ref={messagesEndRef} />
					</div>

					{/* Input Area */}
					<div className="p-4 bg-dark border-t border-gray-700">
						<form
							onSubmit={handleSendMessage}
							className="max-w-4xl mx-auto relative flex items-center gap-3"
						>
							<input
								type="text"
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder="Ask a question about your documents..."
								className="flex-1 bg-dark text-light border border-gray-600 rounded-full py-3 px-5 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
								disabled={sending}
							/>

							<button
								type="submit"
								disabled={!input.trim() || sending}
								className={`p-3 rounded-full flex items-center justify-center transition-all ${
									!input.trim() || sending
										? 'bg-gray-700 text-gray-500 cursor-not-allowed'
										: 'bg-gradient-btn hover:bg-gradient-btn-hover text-light shadow-lg transform hover:scale-105'
								}`}
							>
								{sending ? (
									<Loader2 className="w-5 h-5 animate-spin" />
								) : (
									<Send className="w-5 h-5 ml-0.5" />
								)}
							</button>
						</form>
						<div className="text-center mt-2">
							<p className="text-[10px] text-gray-500">
								AI can make mistakes. Please verify important
								information.
							</p>
						</div>
					</div>
				</main>
			</div>

			{/* --- Modals --- */}
			{workspace && (
				<WorkspaceSettingsModal
					isOpen={settingsModalOpen}
					onClose={() => setSettingsModalOpen(false)}
					workspaceId={workspace.id}
					currentRole={workspace.role}
					// --- ВИПРАВЛЕНО: Використовуємо workspace.title ---
					workspaceTitle={workspace.title}
					onUpdate={(newTitle) =>
						setWorkspace((prev) => ({ ...prev, title: newTitle }))
					}
				/>
			)}

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

export default WorkspaceView;
