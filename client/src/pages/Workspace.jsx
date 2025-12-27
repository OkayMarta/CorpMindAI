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

const Workspace = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const [workspace, setWorkspace] = useState(null);
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [sending, setSending] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);

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

	const handleDelete = async () => {
		const isOwner = workspace.role === 'owner';
		const text = isOwner ? 'Delete Workspace?' : 'Leave Workspace?';
		if (!window.confirm(text)) return;

		try {
			if (isOwner) await workspaceService.delete(id);
			else await workspaceService.leave(id);
			navigate('/dashboard');
		} catch (e) {
			toast.error('Operation failed');
		}
	};

	if (loading)
		return (
			<div className="text-center mt-20 text-gray-500">Loading...</div>
		);

	return (
		<div className="flex flex-col h-full relative">
			{/* HEADER */}
			<div className="fixed top-0 left-72 right-0 h-16 flex items-center justify-between px-6 border-b border-gray-700 bg-dark z-30">
				{/* LEFT: Back + Title */}
				<div className="flex items-center gap-4">
					<button
						onClick={() => navigate('/dashboard')}
						className="p-2 text-gray-400 hover:text-light hover:bg-gray-800 rounded-full transition-colors"
						title="Back to Dashboard"
					>
						<ArrowLeft className="w-5 h-5" />
					</button>

					{/* Назва чату */}
					<h2 className="text-xl font-bold text-light truncate max-w-md tracking-tight">
						{workspace?.title}
					</h2>
				</div>

				<div className="flex items-center gap-4">
					{/* Role Badge */}
					<span
						className={`mr-10 text-xs px-3 py-1 rounded uppercase font-bold tracking-wider shadow-sm ${
							workspace?.role === 'owner'
								? 'bg-gold/20 text-gold'
								: 'bg-purple/20 text-purple'
						}`}
					>
						{workspace?.role === 'owner' ? 'Admin' : 'Member'}
					</span>

					<div className="flex items-center gap-1">
						<button
							onClick={() => setSettingsOpen(true)}
							className="p-2 text-gray-400 hover:text-light hover:bg-gray-800 rounded-full transition-colors"
							title="Workspace Settings"
						>
							<Settings className="w-5 h-5" />
						</button>

						<button
							onClick={handleDelete}
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

			<div className="flex-1 flex flex-col pt-0 h-[calc(100vh-64px)]">
				<ChatWindow
					messages={messages}
					workspaceRole={workspace?.role}
				/>
				<ChatInput onSend={handleSendMessage} disabled={sending} />
			</div>

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
		</div>
	);
};

export default Workspace;
