import { FileText, File, Trash2 } from 'lucide-react';

const FileItem = ({ file, onDelete, canDelete }) => {
	// Форматування розміру файлу
	const formatSize = (bytes) => {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	// Форматування дати
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const isPdf = file.file_type?.includes('pdf');

	return (
		<div className="flex items-center justify-between bg-dark p-3 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors group">
			<div className="flex items-center gap-3 overflow-hidden">
				{/* Іконка типу файлу */}
				<div
					className={`p-2 rounded ${
						isPdf
							? 'bg-uiError/10 text-uiError'
							: 'bg-blue/10 text-blue'
					}`}
				>
					{isPdf ? <FileText size={20} /> : <File size={20} />}
				</div>

				{/* Інфо про файл */}
				<div className="min-w-0">
					<p
						className="text-light text-sm font-medium truncate"
						title={file.filename}
					>
						{file.filename}
					</p>
					<p className="text-xs text-gray-500">
						{formatSize(file.size)} • {formatDate(file.uploaded_at)}
					</p>
				</div>
			</div>

			{/* Кнопка видалення (тільки якщо є права) */}
			{canDelete && (
				<button
					onClick={() => onDelete(file.id)}
					className="p-2 text-gray-500 hover:text-uiError hover:bg-uiError/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
					title="Delete document"
				>
					<Trash2 size={18} />
				</button>
			)}
		</div>
	);
};

export default FileItem;
