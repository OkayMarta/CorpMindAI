import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

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
			setTitle(''); // Очистити поле після успіху
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		// Backdrop (Темний фон)
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			{/* Modal Content */}
			<div className="bg-[#1A1D21] border border-gray-700 rounded-xl w-full max-w-md shadow-2xl transform transition-all scale-100">
				{/* Header */}
				<div className="flex justify-between items-center p-6 border-b border-gray-700">
					<h2 className="text-xl font-bold text-white">
						Create New Workspace
					</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-white transition-colors"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="p-6">
					<div className="mb-6">
						<label className="block text-gray-400 text-sm font-medium mb-2">
							Workspace Name
						</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="e.g. Marketing Q3 Report"
							className="w-full bg-dark border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
							autoFocus
						/>
					</div>

					<div className="flex justify-end gap-3">
						<button
							type="button"
							onClick={onClose}
							className="px-5 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors font-medium"
							disabled={isLoading}
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={!title.trim() || isLoading}
							className={`px-6 py-2.5 rounded-lg font-bold text-white flex items-center gap-2 transition-all ${
								!title.trim() || isLoading
									? 'bg-gray-700 cursor-not-allowed text-gray-400'
									: 'bg-gradient-btn hover:bg-gradient-btn-hover shadow-lg hover:shadow-blue/20'
							}`}
						>
							{isLoading && (
								<Loader2 className="w-4 h-4 animate-spin" />
							)}
							{isLoading ? 'Creating...' : 'Create Workspace'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default CreateWorkspaceModal;
