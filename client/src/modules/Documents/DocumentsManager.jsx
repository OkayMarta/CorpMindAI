import { useState, useEffect } from 'react';
import { documentService } from '../../services/documents';
import { toast } from 'react-toastify';
import { FileText, Trash2, UploadCloud, Loader2 } from 'lucide-react';

const DocumentsManager = ({ workspaceId }) => {
	const [documents, setDocuments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState(false);

	// Завантаження списку
	const fetchDocs = async () => {
		try {
			const data = await documentService.getAll(workspaceId);
			setDocuments(data);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchDocs();
	}, [workspaceId]);

	// Обробка вибору файлу
	const handleFileUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		setUploading(true);
		try {
			await documentService.upload(workspaceId, file);
			toast.success('Document uploaded & indexed!');
			fetchDocs(); // Оновити список
		} catch (err) {
			toast.error('Upload failed. Check console.');
			console.error(err);
		} finally {
			setUploading(false);
			e.target.value = null; // Скинути інпут
		}
	};

	// Видалення
	const handleDelete = async (id) => {
		if (
			!confirm(
				'Are you sure? This will remove it from the AI knowledge base.'
			)
		)
			return;
		try {
			await documentService.delete(id);
			toast.success('Document deleted');
			setDocuments(documents.filter((d) => d.id !== id));
		} catch (err) {
			toast.error('Failed to delete');
		}
	};

	return (
		<div className="space-y-6">
			{/* Upload Area */}
			<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors bg-gray-50">
				{uploading ? (
					<div className="flex flex-col items-center text-blue-600">
						<Loader2 className="animate-spin mb-2" size={32} />
						<p>Processing & Indexing AI Vectors...</p>
						<p className="text-xs text-gray-500 mt-1">
							This might take a minute for large files.
						</p>
					</div>
				) : (
					<label className="cursor-pointer flex flex-col items-center">
						<UploadCloud size={40} className="text-gray-400 mb-2" />
						<span className="text-gray-700 font-medium">
							Click to upload PDF or DOCX
						</span>
						<span className="text-xs text-gray-400 mt-1">
							Max size 10MB
						</span>
						<input
							type="file"
							className="hidden"
							accept=".pdf,.docx,.txt"
							onChange={handleFileUpload}
						/>
					</label>
				)}
			</div>

			{/* List */}
			<div>
				<h4 className="font-bold text-gray-700 mb-3">
					Knowledge Base ({documents.length})
				</h4>

				{loading ? (
					<p className="text-center text-gray-400">Loading...</p>
				) : documents.length === 0 ? (
					<p className="text-center text-gray-400 py-4 bg-gray-50 rounded">
						No documents yet.
					</p>
				) : (
					<ul className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
						{documents.map((doc) => (
							<li
								key={doc.id}
								className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded hover:shadow-sm transition"
							>
								<div className="flex items-center gap-3 overflow-hidden">
									<div className="bg-blue-100 p-2 rounded text-blue-600">
										<FileText size={18} />
									</div>
									<div className="truncate">
										<p className="font-medium text-gray-800 text-sm truncate">
											{doc.filename}
										</p>
										<p className="text-xs text-gray-400">
											{(doc.size / 1024).toFixed(1)} KB •{' '}
											{new Date(
												doc.uploaded_at
											).toLocaleDateString()}
										</p>
									</div>
								</div>
								<button
									onClick={() => handleDelete(doc.id)}
									className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
								>
									<Trash2 size={18} />
								</button>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
};

export default DocumentsManager;
