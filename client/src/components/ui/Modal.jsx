import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
	if (!isOpen) return null;

	return createPortal(
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div className="bg-dark2 border border-gray-700 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-fadeIn relative">
				{/* Header */}
				<div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-700">
					<h3 className="text-xl font-bold text-light">{title}</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-light transition"
					>
						<X size={24} />
					</button>
				</div>

				{/* Body */}
				<div className="p-4 md:p-6">{children}</div>
			</div>
		</div>,
		document.body
	);
};

export default Modal;
