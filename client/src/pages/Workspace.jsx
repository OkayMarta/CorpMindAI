import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workspaceService } from '../services/workspaces';
import { chatService } from '../services/chat';
import { toast } from 'react-toastify';
import { ArrowLeft, Settings, Trash2 } from 'lucide-react';

// Нові компоненти
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
		// Оптимістичне оновлення UI
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
		if (!window.confirm('Are you sure?')) return;
		try {
			if (workspace.role === 'owner') await workspaceService.delete(id);
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
		<div className="flex flex-col h-[calc(100vh-64px)] relative">
			{/* Workspace Header (Local) */}
			<div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-dark/50 backdrop-blur-sm absolute top-0 w-full z-10">
				<div className="flex items-center gap-4">
					<button
						onClick={() => navigate('/dashboard')}
						className="p-2 text-gray-400 hover:text-light transition"
					>
						<ArrowLeft className="w-5 h-5" />
					</button>
					<h2 className="text-lg font-bold text-light">
						{workspace?.title}
					</h2>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={() => setSettingsOpen(true)}
						className="p-2 text-gray-400 hover:text-light transition"
					>
						<Settings className="w-5 h-5" />
					</button>
					<button
						onClick={handleDelete}
						className="p-2 text-gray-400 hover:text-uiError transition"
					>
						<Trash2 className="w-5 h-5" />
					</button>
				</div>
			</div>

			{/* Chat Area */}
			<div className="flex-1 flex flex-col pt-16">
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
		</div>
	);
};

export default Workspace;
