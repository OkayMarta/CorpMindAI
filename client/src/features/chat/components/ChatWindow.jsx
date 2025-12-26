import { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ messages, workspaceRole }) => {
	const messagesEndRef = useRef(null);

	// Автоскрол вниз
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const isOwner = workspaceRole === 'owner';

	if (messages.length === 0) {
		return (
			<div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
				<Bot className="w-16 h-16 mb-4 text-blue" />
				<p>Start a conversation with your AI assistant.</p>
				<p className="text-sm">Ask questions about your documents.</p>
			</div>
		);
	}

	return (
		<div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
			{messages.map((msg) => (
				<MessageBubble key={msg.id} message={msg} isOwner={isOwner} />
			))}
			<div ref={messagesEndRef} />
		</div>
	);
};

export default ChatWindow;
