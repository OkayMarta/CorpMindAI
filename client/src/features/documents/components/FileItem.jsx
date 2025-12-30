import { FileText, File, Trash2, DownloadCloud } from 'lucide-react';

const FileItem = ({ file, onDelete, canDelete }) => {
	// Отримуємо токен для безпечного посилання
	const token = localStorage.getItem('token');

	const formatSize = (bytes) => {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const isPdf = file.file_type?.includes('pdf');

	// Формуємо безпечне ім'я файлу та посилання
	const filename = file.filepath.split(/[/\\]/).pop();
	const secureUrl = `/api/documents/file/${filename}?token=${token}`;

	return (
		<div className="flex items-center justify-between bg-dark p-3 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors group">
			{/* Ліва частина: Іконка + Текст */}
			<div className="flex items-center gap-3 overflow-hidden">
				<div
					className={`p-2 rounded ${
						isPdf
							? 'bg-uiError/10 text-uiError'
							: 'bg-blue/10 text-blue'
					}`}
				>
					{isPdf ? <FileText size={20} /> : <File size={20} />}
				</div>

				<div className="min-w-0 flex flex-col">
					<a
						href={secureUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-light text-sm font-medium truncate hover:text-blue hover:underline cursor-pointer"
						title={file.filename}
					>
						{file.filename}
					</a>
					<p className="text-xs text-gray-500">
						{formatSize(file.size)} • {formatDate(file.uploaded_at)}
					</p>
				</div>
			</div>

			{/* Права частина: Кнопки дій */}
			<div className="flex items-center gap-2">
				{/* Кнопка скачування */}
				<a
					href={secureUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="p-2 text-gray-500 hover:text-light hover:bg-gray-700 rounded-full transition-colors"
					title="Download"
				>
					<DownloadCloud size={18} />
				</a>

				{/* Кнопка видалення */}
				{canDelete && (
					<button
						onClick={() => onDelete(file.id)}
						className="p-2 text-gray-500 hover:text-uiError hover:bg-uiError/10 rounded-full transition-colors"
						title="Delete document"
					>
						<Trash2 size={18} />
					</button>
				)}
			</div>
		</div>
	);
};

export default FileItem;
