import { Bot, User } from 'lucide-react';

const MessageBubble = ({ message, isOwner }) => {
	const isUser = message.role === 'user';

	// Стилі для аватара
	let avatarStyle = '';
	if (!isUser) {
		avatarStyle = 'bg-blue/20 text-blue';
	} else {
		avatarStyle = isOwner
			? 'bg-gold/20 text-gold'
			: 'bg-purple/20 text-purple';
	}

	// Стилі для бульбашки
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
			className={`flex gap-2 md:gap-4 max-w-3xl ${
				isUser ? 'ml-auto flex-row-reverse' : ''
			}`}
		>
			{/* Аватар */}
			<div
				className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${avatarStyle}`}
			>
				{isUser ? (
					<User className="w-4 h-4 md:w-5 md:h-5" />
				) : (
					<Bot className="w-4 h-4 md:w-5 md:h-5" />
				)}
			</div>

			{/* Бульбашка з текстом */}
			<div
				className={`p-3 md:p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap max-w-[85%] md:max-w-full ${bubbleStyle}`}
			>
				{message.content}
			</div>
		</div>
	);
};

export default MessageBubble;
