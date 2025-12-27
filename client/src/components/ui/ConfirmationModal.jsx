import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	isDangerous = false,
	isLoading = false,
}) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title}>
			<div className="flex flex-col gap-4">
				{/* Іконка та повідомлення */}
				<div className="flex items-center gap-4">
					{isDangerous && (
						<div className="flex-shrink-0 bg-uiError/10 p-3 rounded-full text-uiError">
							<AlertTriangle className="w-6 h-6" />
						</div>
					)}
					<p className="text-gray-300 text-sm leading-relaxed">
						{message}
					</p>
				</div>

				{/* Кнопки */}
				<div className="flex justify-end gap-3 mt-4">
					<Button
						variant="secondary"
						onClick={onClose}
						disabled={isLoading}
					>
						{cancelText}
					</Button>
					<Button
						variant={isDangerous ? 'danger' : 'primary'}
						onClick={onConfirm}
						isLoading={isLoading}
					>
						{confirmText}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default ConfirmationModal;
