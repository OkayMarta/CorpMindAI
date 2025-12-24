import React, { useState, useEffect, useRef } from 'react';
import {
	X,
	FileText,
	Users,
	Upload,
	Trash2,
	Loader2,
	Mail,
	MessageSquare,
} from 'lucide-react';
import { toast } from 'react-toastify';

// Сервіси
import { documentService } from '../services/documents';
import { workspaceService } from '../services/workspaces';
import { invitationService } from '../services/invitations';

const WorkspaceSettingsModal = ({
	isOpen,
	onClose,
	workspaceId,
	currentRole,
}) => {
	// --- State ---
	const [activeTab, setActiveTab] = useState('documents'); // 'documents' | 'members'
	const [loading, setLoading] = useState(false);

	// Data
	const [documents, setDocuments] = useState([]);
	const [members, setMembers] = useState([]);

	// Upload State
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef(null);

	// Invite State
	const [inviteEmail, setInviteEmail] = useState('');
	const [inviting, setInviting] = useState(false);

	const isAdmin = currentRole === 'owner';

	// --- Effects ---
	useEffect(() => {
		if (isOpen && workspaceId) {
			fetchData();
		}
	}, [isOpen, workspaceId, activeTab]);

	const fetchData = async () => {
		setLoading(true);
		try {
			if (activeTab === 'documents') {
				const docs = await documentService.getAll(workspaceId);
				setDocuments(docs);
			} else if (activeTab === 'members') {
				const team = await workspaceService.getMembers(workspaceId);
				setMembers(team);
			}
		} catch (error) {
			console.error(error);
			toast.error('Failed to load data');
		} finally {
			setLoading(false);
		}
	};

	// --- Document Handlers ---
	const handleFileSelect = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		setUploading(true);
		try {
			const newDoc = await documentService.upload(workspaceId, file);
			setDocuments([newDoc, ...documents]);
			toast.success('Document uploaded & indexed!');
		} catch (error) {
			console.error(error);
			toast.error('Upload failed. Only PDF, DOCX, TXT allowed.');
		} finally {
			setUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = '';
		}
	};

	const handleDeleteDocument = async (docId) => {
		if (
			!window.confirm(
				'Are you sure? This will remove the document from the AI knowledge base.'
			)
		)
			return;
		try {
			await documentService.delete(docId);
			setDocuments((prev) => prev.filter((d) => d.id !== docId));
			toast.success('Document deleted');
		} catch (error) {
			toast.error('Failed to delete document');
		}
	};

	// --- Member Handlers ---
	const handleInvite = async (e) => {
		e.preventDefault();
		if (!inviteEmail.trim()) return;

		setInviting(true);
		try {
			await invitationService.sendInvite(workspaceId, inviteEmail);
			toast.success(`Invitation sent to ${inviteEmail}`);
			setInviteEmail('');
		} catch (error) {
			console.error(error);
			toast.error(error.response?.data || 'Failed to send invite');
		} finally {
			setInviting(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			<div className="bg-dark2 border border-gray-700 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh]">
				{/* --- HEADER --- */}
				<div className="flex justify-between items-center p-6 border-b border-gray-700">
					<h2 className="text-xl font-bold text-light flex items-center gap-2">
						<MessageSquare className="w-5 h-5 text-blue" />
						Workspace Settings
					</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-light transition-colors"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				{/* --- TABS --- */}
				<div className="flex border-b border-gray-700 px-6 gap-6">
					<button
						onClick={() => setActiveTab('documents')}
						className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
							activeTab === 'documents'
								? 'border-blue text-blue'
								: 'border-transparent text-gray-400 hover:text-light'
						}`}
					>
						<FileText className="w-4 h-4" /> Documents (Knowledge
						Base)
					</button>
					<button
						onClick={() => setActiveTab('members')}
						className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
							activeTab === 'members'
								? 'border-blue text-blue'
								: 'border-transparent text-gray-400 hover:text-light'
						}`}
					>
						<Users className="w-4 h-4" /> Team Members
					</button>
				</div>

				{/* --- CONTENT AREA --- */}
				<div className="p-6 overflow-y-auto custom-scrollbar flex-1">
					{/* ===== DOCUMENTS TAB ===== */}
					{activeTab === 'documents' && (
						<div className="space-y-6">
							{/* Upload Area (Admin Only) */}
							{isAdmin && (
								<div
									className={`border-2 border-dashed border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center text-center transition-all ${
										uploading
											? 'bg-gray-800 opacity-50'
											: 'hover:border-blue hover:bg-gray-800/50 cursor-pointer'
									}`}
									onClick={() =>
										!uploading &&
										fileInputRef.current.click()
									}
								>
									<input
										type="file"
										ref={fileInputRef}
										onChange={handleFileSelect}
										className="hidden"
										accept=".pdf,.docx,.txt"
									/>
									{uploading ? (
										<>
											<Loader2 className="w-8 h-8 text-blue animate-spin mb-2" />
											<p className="text-light font-medium">
												Processing & Indexing...
											</p>
											<p className="text-xs text-gray-500">
												This might take a few seconds
											</p>
										</>
									) : (
										<>
											<div className="bg-gray-800 p-3 rounded-full mb-3">
												<Upload className="w-6 h-6 text-blue" />
											</div>
											<p className="text-light font-medium">
												Click to Upload Document
											</p>
											<p className="text-xs text-gray-500 mt-1">
												Supported: PDF, DOCX, TXT (Max
												10MB)
											</p>
										</>
									)}
								</div>
							)}

							{/* Documents List */}
							<div>
								<h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
									Uploaded Files ({documents.length})
								</h3>
								{loading ? (
									<div className="text-center py-4 text-gray-500">
										Loading...
									</div>
								) : documents.length === 0 ? (
									<div className="text-center py-8 bg-dark rounded-lg border border-gray-800">
										<p className="text-gray-400">
											No documents found.
										</p>
										{isAdmin && (
											<p className="text-xs text-gray-500 mt-1">
												Upload files to start chatting
												with them.
											</p>
										)}
									</div>
								) : (
									<div className="space-y-2">
										{documents.map((doc) => (
											<div
												key={doc.id}
												className="flex items-center justify-between bg-dark border border-gray-800 p-3 rounded-lg hover:border-gray-600 transition-colors"
											>
												<div className="flex items-center gap-3 overflow-hidden">
													<div className="bg-blue/10 p-2 rounded text-blue">
														<FileText className="w-5 h-5" />
													</div>
													<div className="min-w-0">
														<p className="text-light text-sm font-medium truncate">
															{doc.filename}
														</p>
														<p className="text-xs text-gray-500">
															{(
																doc.size /
																1024 /
																1024
															).toFixed(2)}{' '}
															MB •{' '}
															{new Date(
																doc.uploaded_at
															).toLocaleDateString()}
														</p>
													</div>
												</div>
												{isAdmin && (
													<button
														onClick={() =>
															handleDeleteDocument(
																doc.id
															)
														}
														className="p-2 text-gray-500 hover:text-uiError hover:bg-uiError/10 rounded-full transition-colors"
														title="Delete File"
													>
														<Trash2 className="w-4 h-4" />
													</button>
												)}
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					)}

					{/* ===== MEMBERS TAB ===== */}
					{activeTab === 'members' && (
						<div className="space-y-6">
							{/* Invite Form (Admin Only) */}
							{isAdmin && (
								<form
									onSubmit={handleInvite}
									className="flex gap-2"
								>
									<div className="relative flex-1">
										<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
										<input
											type="email"
											placeholder="Enter colleague's email..."
											className="w-full bg-dark border border-gray-700 text-light rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue"
											value={inviteEmail}
											onChange={(e) =>
												setInviteEmail(e.target.value)
											}
										/>
									</div>
									<button
										type="submit"
										disabled={inviting || !inviteEmail}
										className={`px-4 py-2.5 rounded-lg font-medium text-light flex items-center gap-2 ${
											inviting || !inviteEmail
												? 'bg-gray-700 cursor-not-allowed text-gray-400'
												: 'bg-gradient-btn hover:bg-gradient-btn-hover'
										}`}
									>
										{inviting ? (
											<Loader2 className="w-4 h-4 animate-spin" />
										) : (
											'Invite'
										)}
									</button>
								</form>
							)}

							{/* Members List */}
							<div>
								<h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
									Team Members ({members.length})
								</h3>
								{loading ? (
									<div className="text-center py-4 text-gray-500">
										Loading...
									</div>
								) : (
									<div className="space-y-2">
										{members.map((member) => (
											<div
												key={member.id}
												className="flex items-center justify-between bg-dark border border-gray-800 p-3 rounded-lg"
											>
												<div className="flex items-center gap-3">
													{member.avatar_url ? (
														<img
															src={
																member.avatar_url
															}
															alt={
																member.nickname
															}
															className="w-10 h-10 rounded-full object-cover"
														/>
													) : (
														<div className="w-10 h-10 rounded-full bg-gradient-btn flex items-center justify-center text-light font-bold text-sm">
															{member.nickname
																?.substring(
																	0,
																	2
																)
																.toUpperCase()}
														</div>
													)}
													<div>
														<p className="text-light text-sm font-medium flex items-center gap-2">
															{member.nickname}
														</p>
														<p className="text-xs text-gray-500">
															{member.email}
														</p>
													</div>
												</div>
												<span
													className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
														member.role === 'owner'
															? 'bg-gold/20 text-gold'
															: 'bg-purple/20 text-purple'
													}`}
												>
													{member.role === 'owner'
														? 'Admin'
														: 'Member'}
												</span>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default WorkspaceSettingsModal;
