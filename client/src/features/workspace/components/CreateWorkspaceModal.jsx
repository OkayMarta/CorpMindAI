import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { handleError } from '../../../utils/errorHandler';

const CreateWorkspaceModal = ({ isOpen, onClose, onSubmit }) => {
	const [title, setTitle] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	if (!isOpen) return null;

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!title.trim()) return;

		setIsLoading(true);
		try {
			await onSubmit(title);
			setTitle(''); // Очистити після успіху
		} catch (error) {
			handleError(error, 'Failed to create workspace');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		// Backdrop
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			{/* Modal Container */}
			<div className="bg-dark2 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl transform transition-all scale-100">
				{/* Header */}
				<div className="flex justify-between items-center p-6 border-b border-gray-700">
					<h2 className="text-xl font-bold text-light">
						Create New Workspace
					</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-light transition-colors"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				{/* Form */}
				<form
					onSubmit={handleSubmit}
					className="p-6 flex flex-col gap-6"
				>
					{/* Reusable Input */}
					<Input
						variant="dark"
						label="Workspace Name"
						placeholder="e.g. Marketing Q3 Report"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						autoFocus
					/>

					{/* Buttons Row */}
					<div className="flex justify-end gap-3">
						<Button
							variant="secondary"
							onClick={onClose}
							disabled={isLoading}
						>
							Cancel
						</Button>

						<Button
							type="submit"
							variant="primary"
							isLoading={isLoading}
							disabled={!title.trim()}
						>
							{isLoading ? 'Creating...' : 'Create Workspace'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default CreateWorkspaceModal;
