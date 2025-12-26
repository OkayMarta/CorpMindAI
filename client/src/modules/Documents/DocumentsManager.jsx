import React, { useState, useEffect } from 'react';
import { Upload, Trash2, FileText, File, Loader2 } from 'lucide-react';
import { documentService } from '../../services/documents';
import { toast } from 'react-toastify';

// 1. Додаємо userRole у пропси
const DocumentsManager = ({ workspaceId, userRole }) => {
	const [documents, setDocuments] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	// 2. Визначаємо, чи є юзер адміном/власником
	const isAdmin = userRole === 'owner' || userRole === 'admin';

	// Завантаження списку (доступно всім)
	useEffect(() => {
		fetchDocuments();
	}, [workspaceId]);

	const fetchDocuments = async () => {
		setIsLoading(true);
		try {
			const data = await documentService.getAll(workspaceId);
			setDocuments(data);
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleFileUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		setIsUploading(true);
		try {
			const newDoc = await documentService.upload(workspaceId, file);
			setDocuments((prev) => [newDoc, ...prev]);
			toast.success('Document uploaded & indexed!');
		} catch (error) {
			toast.error('Upload failed');
			console.error(error);
		} finally {
			setIsUploading(false);
		}
	};

	const handleDelete = async (docId) => {
		if (
			!window.confirm(
				'Are you sure? This will remove it from the AI knowledge base.'
			)
		)
			return;
		try {
			await documentService.delete(docId);
			setDocuments((prev) => prev.filter((d) => d.id !== docId));
			toast.success('Document deleted');
		} catch (error) {
			toast.error('Delete failed');
		}
	};

	return (
		<div className="space-y-6">
			{/* 3. Приховуємо зону завантаження, якщо не адмін */}
			{isAdmin && (
				<div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-purple transition-colors bg-dark2">
					{isUploading ? (
						<div className="flex flex-col items-center text-purple">
							<Loader2 className="animate-spin mb-2" size={32} />
							<p>Processing & Indexing AI Vectors...</p>
						</div>
					) : (
						<>
							<input
								type="file"
								id="file-upload"
								className="hidden"
								onChange={handleFileUpload}
								accept=".pdf,.docx,.txt"
							/>
							<label
								htmlFor="file-upload"
								className="cursor-pointer flex flex-col items-center justify-center gap-2"
							>
								<div className="bg-gray-800 p-4 rounded-full text-gray-300">
									<Upload size={24} />
								</div>
								<p className="text-light font-medium">
									Click to upload documents
								</p>
								<p className="text-xs text-gray-500">
									PDF, DOCX, TXT (Max 10MB)
								</p>
							</label>
						</>
					)}
				</div>
			)}

			{/* Список файлів (доступний всім, але кнопка видалення - ні) */}
			<div className="space-y-3">
				<h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
					Knowledge Base ({documents.length})
				</h3>

				{isLoading ? (
					<p className="text-center text-gray-500">
						Loading documents...
					</p>
				) : documents.length === 0 ? (
					<p className="text-center text-gray-600 py-4">
						No documents yet.
					</p>
				) : (
					documents.map((doc) => (
						<div
							key={doc.id}
							className="flex items-center justify-between bg-dark2 p-4 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors"
						>
							<div className="flex items-center gap-4 overflow-hidden">
								<div className="p-2 bg-blue/10 text-blue rounded">
									{doc.file_type?.includes('pdf') ? (
										<FileText size={20} />
									) : (
										<File size={20} />
									)}
								</div>
								<div className="min-w-0">
									<p className="text-light text-sm font-medium truncate">
										{doc.filename}
									</p>
									<p className="text-xs text-gray-500">
										{(doc.size / 1024).toFixed(1)} KB •{' '}
										{new Date(
											doc.uploaded_at
										).toLocaleDateString()}
									</p>
								</div>
							</div>

							{/* 4. Приховуємо кнопку видалення */}
							{isAdmin && (
								<button
									onClick={() => handleDelete(doc.id)}
									className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition"
									title="Delete document"
								>
									<Trash2 size={18} />
								</button>
							)}
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default DocumentsManager;
