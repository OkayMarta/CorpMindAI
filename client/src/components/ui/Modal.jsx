import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div className="bg-light rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-fadeIn">
				{/* Header */}
				<div className="flex justify-between items-center p-4 border-b border-gray-100">
					<h3 className="text-xl font-bold text-gray-800">{title}</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 transition"
					>
						<X size={24} />
					</button>
				</div>

				{/* Body */}
				<div className="p-6">{children}</div>
			</div>
		</div>
	);
};

export default Modal;
