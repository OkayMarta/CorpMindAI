import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

const ChatInput = ({ onSend, disabled }) => {
	const [input, setInput] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!input.trim() || disabled) return;
		onSend(input);
		setInput('');
	};

	return (
		<div className="p-4 bg-dark border-t border-gray-700">
			<form
				onSubmit={handleSubmit}
				className="max-w-4xl mx-auto relative flex items-center gap-3"
			>
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Ask a question about your documents..."
					className="flex-1 bg-dark text-light border border-gray-600 rounded-full py-3 px-5 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
					disabled={disabled}
				/>

				<button
					type="submit"
					disabled={!input.trim() || disabled}
					className={`p-3 rounded-full flex items-center justify-center transition-all ${
						!input.trim() || disabled
							? 'bg-gray-700 text-gray-500 cursor-not-allowed'
							: 'bg-gradient-btn hover:bg-gradient-btn-hover text-light shadow-lg transform hover:scale-105'
					}`}
				>
					{disabled ? (
						<Loader2 className="w-5 h-5 animate-spin" />
					) : (
						<Send className="w-5 h-5 ml-0.5" />
					)}
				</button>
			</form>
			<div className="text-center mt-2">
				<p className="text-[10px] text-gray-500">
					AI can make mistakes. Please verify important information.
				</p>
			</div>
		</div>
	);
};

export default ChatInput;
