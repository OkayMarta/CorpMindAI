import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { workspaceService } from '../services/workspaces';
import { chatService } from '../services/chat'; // Імпорт сервісу
import { Settings, Send } from 'lucide-react';
import Modal from '../components/Modal';
import DocumentsManager from '../modules/Documents/DocumentsManager';

const WorkspaceView = () => {
	const { id } = useParams();
	const [workspace, setWorkspace] = useState(null);
	const [messages, setMessages] = useState([]); // Стан чату
	const [input, setInput] = useState('');
	const [isSending, setIsSending] = useState(false);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const messagesEndRef = useRef(null);

	// Скрол вниз
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	// Завантаження даних
	useEffect(() => {
		const init = async () => {
			try {
				const wsData = await workspaceService.getOne(id);
				setWorkspace(wsData);
				const chatData = await chatService.getHistory(id);
				setMessages(chatData);
			} catch (err) {
				console.error(err);
			}
		};
		init();
	}, [id]);

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// Відправка
	const handleSend = async (e) => {
		e.preventDefault();
		if (!input.trim()) return;

		const userMsg = { role: 'user', content: input };
		setMessages((prev) => [...prev, userMsg]); // Оптимістичне додавання
		setInput('');
		setIsSending(true);

		try {
			const aiMsg = await chatService.sendMessage(id, userMsg.content);
			setMessages((prev) => [...prev, aiMsg]);
		} catch (err) {
			setMessages((prev) => [
				...prev,
				{
					role: 'assistant',
					content: 'Error: Could not get response.',
				},
			]);
		} finally {
			setIsSending(false);
		}
	};

	if (!workspace)
		return (
			<div className="bg-dark min-h-screen text-white flex items-center justify-center">
				Loading...
			</div>
		);

	return (
		<div className="flex min-h-screen bg-dark text-white font-sans">
			<Sidebar />

			<main className="flex-1 ml-64 flex flex-col h-screen">
				{/* Header */}
				<header className="h-16 border-b border-uiDisabled/20 flex items-center justify-between px-6 bg-dark">
					<div className="flex items-center gap-4">
						<Link
							to="/dashboard"
							className="text-uiDisabled hover:text-white text-xl transition"
						>
							←
						</Link>
						<h2 className="font-bold text-lg text-white">
							{workspace.title}
						</h2>
					</div>
					<button
						onClick={() => setIsSettingsOpen(true)}
						className="text-uiDisabled hover:text-blue transition p-2 rounded hover:bg-white/5"
					>
						<Settings size={24} />
					</button>
				</header>

				{/* Chat Area */}
				<div className="flex-1 overflow-y-auto p-6 bg-dark flex flex-col gap-4">
					{messages.length === 0 ? (
						<div className="flex-1 flex flex-col items-center justify-center text-uiDisabled opacity-50">
							<p className="text-6xl mb-4">🤖</p>
							<p className="text-lg">Chat with your documents</p>
						</div>
					) : (
						messages.map((msg, idx) => (
							<div
								key={idx}
								className={`flex ${
									msg.role === 'user'
										? 'justify-end'
										: 'justify-start'
								}`}
							>
								<div
									className={`max-w-[70%] p-4 rounded-xl ${
										msg.role === 'user'
											? 'bg-blue text-white rounded-br-none'
											: 'bg-[#1A1D21] text-light border border-uiDisabled/20 rounded-bl-none'
									}`}
								>
									<p className="whitespace-pre-wrap text-sm leading-relaxed">
										{msg.content}
									</p>
								</div>
							</div>
						))
					)}
					{isSending && (
						<div className="flex justify-start">
							<div className="bg-[#1A1D21] p-4 rounded-xl rounded-bl-none border border-uiDisabled/20">
								<span className="animate-pulse">
									Thinking...
								</span>
							</div>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>

				{/* Input Area */}
				<div className="p-6 border-t border-uiDisabled/20 bg-dark">
					<form
						onSubmit={handleSend}
						className="max-w-4xl mx-auto relative"
					>
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Ask a question about your documents..."
							className="w-full bg-[#1A1D21] text-white rounded-xl pl-6 pr-14 py-4 focus:outline-none focus:ring-1 focus:ring-blue placeholder-uiDisabled/50 shadow-lg"
							disabled={isSending}
						/>
						<button
							type="submit"
							disabled={isSending}
							className="absolute right-3 top-3 p-2 bg-gradient-btn hover:bg-gradient-btn-hover rounded-lg text-white transition shadow-md disabled:opacity-50"
						>
							<Send size={20} />
						</button>
					</form>
				</div>
			</main>

			<Modal
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
				title={`Manage: ${workspace.title}`}
			>
				<DocumentsManager workspaceId={id} />
			</Modal>
		</div>
	);
};

export default WorkspaceView;
