import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { chatService } from '../services/chat';
import { workspaceService } from '../services/workspaces';
import { Send, Bot, User, Loader2, Settings } from 'lucide-react'; // Додали Settings
import WorkspaceSettingsModal from '../components/WorkspaceSettingsModal'; // Імпорт модалки

const WorkspaceView = () => {
	const { id } = useParams();
	const [workspace, setWorkspace] = useState(null);
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	// Стан для модального вікна налаштувань
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	const messagesEndRef = useRef(null);

	// Завантаження даних воркспейсу та історії
	useEffect(() => {
		const loadData = async () => {
			try {
				if (!id) return;
				const wsData = await workspaceService.getOne(id);
				setWorkspace(wsData);

				const history = await chatService.getHistory(id);
				setMessages(history);
			} catch (error) {
				console.error('Failed to load workspace data', error);
			}
		};
		loadData();
	}, [id]);

	// Автоскрол вниз
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const handleSendMessage = async (e) => {
		e.preventDefault();
		if (!input.trim()) return;

		const userMsg = { role: 'user', content: input };
		setMessages((prev) => [...prev, userMsg]);
		setInput('');
		setIsLoading(true);

		try {
			const response = await chatService.sendMessage(id, userMsg.content);
			// response - це об'єкт повідомлення з бази
			setMessages((prev) => [...prev, response]);
		} catch (error) {
			console.error('Chat error', error);
			setMessages((prev) => [
				...prev,
				{
					role: 'assistant',
					content: 'Error: Could not get response.',
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex h-screen bg-dark text-light font-sans">
			{/* Сайдбар */}
			<Sidebar />

			{/* Основна область */}
			<div className="flex-1 flex flex-col relative">
				{/* HEADER */}
				<header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-dark/95 backdrop-blur z-10">
					<h1 className="text-lg font-semibold tracking-wide text-white">
						{workspace ? workspace.title : 'Loading...'}
					</h1>

					{/* Кнопка налаштувань (шестерня) */}
					{workspace && (
						<button
							onClick={() => setIsSettingsOpen(true)}
							className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition duration-200"
							title="Workspace Settings"
						>
							<Settings size={20} />
						</button>
					)}
				</header>

				{/* CHAT AREA */}
				<div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
					{messages.length === 0 ? (
						<div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
							<Bot size={64} className="mb-4" />
							<p>No messages yet. Start the conversation!</p>
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
									className={`flex max-w-[80%] md:max-w-[70%] ${
										msg.role === 'user'
											? 'flex-row-reverse'
											: 'flex-row'
									} gap-3`}
								>
									{/* Avatar */}
									<div
										className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
											msg.role === 'user'
												? 'bg-purple'
												: 'bg-blue'
										}`}
									>
										{msg.role === 'user' ? (
											<User
												size={16}
												className="text-white"
											/>
										) : (
											<Bot
												size={16}
												className="text-white"
											/>
										)}
									</div>

									{/* Bubble */}
									<div
										className={`p-3 rounded-2xl text-sm leading-relaxed ${
											msg.role === 'user'
												? 'bg-purple/20 text-white rounded-tr-none border border-purple/30'
												: 'bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700'
										}`}
									>
										{/* Простий рендер тексту (можна додати Markdown пізніше) */}
										<div className="whitespace-pre-wrap">
											{msg.content}
										</div>
									</div>
								</div>
							</div>
						))
					)}

					{/* Індикатор завантаження */}
					{isLoading && (
						<div className="flex justify-start">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-full bg-blue flex items-center justify-center">
									<Bot size={16} className="text-white" />
								</div>
								<div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-700 flex items-center">
									<Loader2
										size={16}
										className="animate-spin text-gray-400"
									/>
								</div>
							</div>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>

				{/* INPUT AREA */}
				<div className="p-4 border-t border-gray-800 bg-dark">
					<form
						onSubmit={handleSendMessage}
						className="relative max-w-4xl mx-auto"
					>
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Ask something about your documents..."
							className="w-full bg-[#1A1D21] text-white border border-gray-700 rounded-full py-3 pl-5 pr-12 focus:outline-none focus:border-purple transition-colors placeholder-gray-500"
							disabled={isLoading}
						/>
						<button
							type="submit"
							disabled={isLoading || !input.trim()}
							className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-btn rounded-full text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<Send size={18} />
						</button>
					</form>
				</div>

				{/* МОДАЛЬНЕ ВІКНО НАЛАШТУВАНЬ */}
				<WorkspaceSettingsModal
					isOpen={isSettingsOpen}
					onClose={() => setIsSettingsOpen(false)}
					workspace={workspace}
				/>
			</div>
		</div>
	);
};

export default WorkspaceView;
