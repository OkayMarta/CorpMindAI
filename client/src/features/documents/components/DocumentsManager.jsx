import React, { useState, useEffect } from 'react';
import { documentService } from '../../../services/documents';
import { toast } from 'react-toastify';
import FileItem from './FileItem';
import UploadZone from './UploadZone';
import { handleError } from '../../../utils/errorHandler';

const DocumentsManager = ({ workspaceId, userRole }) => {
	const [documents, setDocuments] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	const isAdmin = userRole === 'owner' || userRole === 'admin';

	useEffect(() => {
		fetchDocuments();
	}, [workspaceId]);

	const fetchDocuments = async () => {
		setIsLoading(true);
		try {
			const data = await documentService.getAll(workspaceId);
			setDocuments(data);
		} catch (error) {
			handleError(error, 'Failed to load documents');
		} finally {
			setIsLoading(false);
		}
	};

	const handleFileSelect = async (file) => {
		setIsUploading(true);
		try {
			const newDoc = await documentService.upload(workspaceId, file);
			setDocuments((prev) => [newDoc, ...prev]);
			toast.success('Document uploaded & indexed!');
		} catch (error) {
			handleError(error, 'Upload failed');
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
			handleError(error, 'Delete failed');
		}
	};

	return (
		<div className="space-y-6">
			{/* Зона завантаження */}
			{isAdmin && (
				<UploadZone
					onFileSelect={handleFileSelect}
					isUploading={isUploading}
				/>
			)}

			{/* Список файлів */}
			<div>
				<h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
					Knowledge Base ({documents.length})
				</h3>

				{isLoading ? (
					<p className="text-center text-gray-500 py-4">
						Loading documents...
					</p>
				) : documents.length === 0 ? (
					<div className="text-center py-6 border border-dashed border-gray-800 rounded-lg">
						<p className="text-gray-500 text-sm">
							No documents yet.
						</p>
					</div>
				) : (
					<div className="space-y-2">
						{documents.map((doc) => (
							<FileItem
								key={doc.id}
								file={doc}
								canDelete={isAdmin}
								onDelete={handleDelete}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default DocumentsManager;
