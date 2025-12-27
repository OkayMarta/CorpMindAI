import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workspaceService } from '../services/workspaces';
import { chatService } from '../services/chat';
import { toast } from 'react-toastify';
import { ArrowLeft, Settings, Trash2 } from 'lucide-react';

// Components
import ChatWindow from '../features/chat/components/ChatWindow';
import ChatInput from '../features/chat/components/ChatInput';
import WorkspaceSettingsModal from '../features/workspace/components/WorkspaceSettingsModal';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const Workspace = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const [workspace, setWorkspace] = useState(null);
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [sending, setSending] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);

	// Confirmation Modal State
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		const loadData = async () => {
			try {
				const [ws, history] = await Promise.all([
					workspaceService.getOne(id),
					chatService.getHistory(id),
				]);
				setWorkspace(ws);
				setMessages(history);
			} catch (error) {
				console.error(error);
				toast.error('Error loading workspace');
				navigate('/dashboard');
			} finally {
				setLoading(false);
			}
		};
		if (id) loadData();
	}, [id, navigate]);

	const handleSendMessage = async (content) => {
		setSending(true);
		const tempMsg = {
			id: Date.now(),
			role: 'user',
			content: content,
			created_at: new Date().toISOString(),
		};
		setMessages((prev) => [...prev, tempMsg]);

		try {
			const response = await chatService.sendMessage(id, content);
			setMessages((prev) => [...prev, response]);
		} catch (error) {
			toast.error('Failed to send message');
		} finally {
			setSending(false);
		}
	};

	// Відкриття модалки
	const handleDeleteClick = () => {
		setConfirmOpen(true);
	};

	// Виконання видалення
	const handleConfirmDelete = async () => {
		setIsDeleting(true);
		const isOwner = workspace.role === 'owner';
		try {
			if (isOwner) await workspaceService.delete(id);
			else await workspaceService.leave(id);
			navigate('/dashboard');
		} catch (e) {
			toast.error('Operation failed');
			setIsDeleting(false);
		}
	};

	if (loading)
		return (
			<div className="text-center mt-20 text-gray-500">Loading...</div>
		);

	return (
		<div className="flex flex-col h-full relative">
			{/* HEADER */}
			<div className="fixed top-0 left-0 lg:left-72 right-0 h-16 flex items-center justify-between px-4 lg:px-6 border-b border-gray-700 bg-dark z-50">
				{/* LEFT: Back + Title */}
				<div className="flex items-center gap-3 overflow-hidden">
					<button
						onClick={() => navigate('/dashboard')}
						className="p-2 text-gray-400 hover:text-light hover:bg-gray-800 rounded-full transition-colors flex-shrink-0"
						title="Back to Dashboard"
					>
						<ArrowLeft className="w-5 h-5" />
					</button>

					{/* Назва чату */}
					<h2 className="text-lg lg:text-xl font-bold text-light truncate">
						{workspace?.title}
					</h2>
				</div>

				{/* RIGHT: Buttons */}
				<div className="flex items-center gap-1 lg:gap-4 flex-shrink-0 ml-2">
					{/* Role Badge: Тільки на планшетах і десктопах */}
					<span
						className={`hidden md:inline-flex mr-2 lg:mr-4 text-xs px-3 py-1 rounded uppercase font-bold tracking-wider shadow-sm ${
							workspace?.role === 'owner'
								? 'bg-gold/20 text-gold'
								: 'bg-purple/20 text-purple'
						}`}
					>
						{workspace?.role === 'owner' ? 'Admin' : 'Member'}
					</span>

					<div className="flex items-center gap-0.5 md:gap-1">
						<button
							onClick={() => setSettingsOpen(true)}
							className="p-2 text-gray-400 hover:text-light hover:bg-gray-800 rounded-full transition-colors"
							title="Workspace Settings"
						>
							<Settings className="w-5 h-5" />
						</button>

						<button
							onClick={handleDeleteClick}
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

			{/* CONTENT */}
			<div className="flex-1 flex flex-col pt-0 h-[calc(100vh-64px)]">
				<ChatWindow
					messages={messages}
					workspaceRole={workspace?.role}
				/>
				<ChatInput onSend={handleSendMessage} disabled={sending} />
			</div>

			{/* Settings Modal */}
			{workspace && (
				<WorkspaceSettingsModal
					isOpen={settingsOpen}
					onClose={() => setSettingsOpen(false)}
					workspaceId={workspace.id}
					currentRole={workspace.role}
					workspaceTitle={workspace.title}
					onUpdate={(t) =>
						setWorkspace((prev) => ({ ...prev, title: t }))
					}
				/>
			)}

			{/* Confirmation Modal */}
			<ConfirmationModal
				isOpen={confirmOpen}
				onClose={() => setConfirmOpen(false)}
				onConfirm={handleConfirmDelete}
				isLoading={isDeleting}
				title={
					workspace?.role === 'owner'
						? 'Delete Workspace'
						: 'Leave Workspace'
				}
				message={
					workspace?.role === 'owner'
						? 'Are you sure you want to permanently delete this workspace? This action cannot be undone and will delete all documents and chat history.'
						: 'Are you sure you want to leave this workspace? You will lose access to documents and chats.'
				}
				confirmText={workspace?.role === 'owner' ? 'Delete' : 'Leave'}
				isDangerous={true}
			/>
		</div>
	);
};

export default Workspace;
