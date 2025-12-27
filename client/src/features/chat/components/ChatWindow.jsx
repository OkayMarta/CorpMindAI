import { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ messages, workspaceRole }) => {
	const messagesEndRef = useRef(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const isOwner = workspaceRole === 'owner';

	if (messages.length === 0) {
		return (
			<div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60 px-4 text-center">
				<Bot className="w-12 h-12 md:w-16 md:h-16 mb-4 text-blue" />
				<p className="font-medium">Start a conversation</p>
				<p className="text-xs md:text-sm mt-1">
					Ask questions about your documents.
				</p>
			</div>
		);
	}

	return (
		<div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6 custom-scrollbar">
			{messages.map((msg) => (
				<MessageBubble key={msg.id} message={msg} isOwner={isOwner} />
			))}
			<div ref={messagesEndRef} />
		</div>
	);
};

export default ChatWindow;
