import { useState } from 'react';
import { Send } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

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
				className="max-w-4xl mx-auto flex items-center gap-3"
			>
				{/* Інпут */}
				<div className="flex-1">
					<Input
						variant="dark"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Ask a question about your documents..."
						disabled={disabled}
					/>
				</div>

				{/* Кнопка */}
				<Button
					type="submit"
					disabled={!input.trim() || disabled}
					isLoading={disabled}
					className="px-4"
				>
					{!disabled && <Send className="w-5 h-5 ml-0.5" />}
				</Button>
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
