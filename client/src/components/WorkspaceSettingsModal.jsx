import React, { useState, useEffect } from 'react';
import { X, FileText, Users, Mail, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { invitationService } from '../services/invitations';
import { workspaceService } from '../services/workspaces';
import DocumentsManager from '../modules/Documents/DocumentsManager';

const WorkspaceSettingsModal = ({ isOpen, onClose, workspace }) => {
	// 1. Всі useState (Хуки)
	const [activeTab, setActiveTab] = useState('documents');
	const [inviteEmail, setInviteEmail] = useState('');
	const [isLoadingInvite, setIsLoadingInvite] = useState(false);

	const [members, setMembers] = useState([]);
	const [isLoadingMembers, setIsLoadingMembers] = useState(false);

	// 2. Логічні змінні
	const isAdmin = workspace?.role === 'owner' || workspace?.role === 'admin';

	// 3. useEffect (Хук)
	useEffect(() => {
		if (activeTab === 'members' && workspace?.id && isOpen) {
			fetchMembers();
		}
	}, [activeTab, workspace?.id, isOpen]);

	// Допоміжні функції
	const fetchMembers = async () => {
		setIsLoadingMembers(true);
		try {
			const data = await workspaceService.getMembers(workspace.id);
			setMembers(data);
		} catch (err) {
			console.error(err);
			toast.error('Failed to load members');
		} finally {
			setIsLoadingMembers(false);
		}
	};

	const handleSendInvite = async (e) => {
		e.preventDefault();
		if (!inviteEmail) return;

		setIsLoadingInvite(true);
		try {
			await invitationService.sendInvite(workspace.id, inviteEmail);
			toast.success(`Invitation sent to ${inviteEmail}`);
			setInviteEmail('');
		} catch (err) {
			console.error(err);
			const errorMsg =
				err.response?.data?.message ||
				err.response?.data ||
				'Failed to send invite';
			toast.error(errorMsg);
		} finally {
			setIsLoadingInvite(false);
		}
	};

	// 4. ТІЛЬКИ ТУТ можна робити перевірку на закриття
	if (!isOpen || !workspace) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
			<div className="bg-dark w-full max-w-4xl rounded-xl shadow-2xl border border-gray-700 flex flex-col max-h-[90vh]">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-700 bg-[#1A1D21] rounded-t-xl">
					<div>
						<h2 className="text-xl font-bold text-white tracking-wide">
							{workspace.title}
						</h2>
						<p className="text-xs text-gray-400 uppercase tracking-wider mt-1">
							Workspace Settings
						</p>
					</div>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-white transition p-1 hover:bg-gray-700 rounded-full"
					>
						<X size={24} />
					</button>
				</div>

				{/* Tabs */}
				<div className="flex border-b border-gray-700 px-6 bg-[#1A1D21]">
					<button
						onClick={() => setActiveTab('documents')}
						className={`py-4 mr-8 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
							activeTab === 'documents'
								? 'border-purple text-purple'
								: 'border-transparent text-gray-400 hover:text-white'
						}`}
					>
						<FileText size={18} /> Knowledge Base
					</button>
					<button
						onClick={() => setActiveTab('members')}
						className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
							activeTab === 'members'
								? 'border-purple text-purple'
								: 'border-transparent text-gray-400 hover:text-white'
						}`}
					>
						<Users size={18} /> Team Members
					</button>
				</div>

				{/* Content */}
				<div className="p-6 overflow-y-auto flex-1 bg-dark">
					{activeTab === 'documents' && (
						<div className="h-full">
							<DocumentsManager
								workspaceId={workspace.id}
								userRole={workspace.role}
							/>
						</div>
					)}

					{activeTab === 'members' && (
						<div className="max-w-xl mx-auto space-y-8">
							{/* Блок запрошення (тільки для адмінів) */}
							{isAdmin && (
								<div className="bg-[#1A1D21] p-6 rounded-xl border border-gray-700">
									<div className="flex items-center gap-3 mb-4">
										<div className="p-2 bg-purple/10 rounded-lg text-purple">
											<Mail size={20} />
										</div>
										<h3 className="text-lg font-semibold text-white">
											Invite New Member
										</h3>
									</div>

									<form
										onSubmit={handleSendInvite}
										className="flex flex-col sm:flex-row gap-3"
									>
										<input
											type="email"
											placeholder="Enter colleague email..."
											value={inviteEmail}
											onChange={(e) =>
												setInviteEmail(e.target.value)
											}
											className="flex-1 input-field bg-dark text-white border-gray-600 focus:border-purple"
											required
										/>
										<button
											type="submit"
											disabled={isLoadingInvite}
											className="btn-outlined bg-purple border-purple hover:bg-white hover:text-purple whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{isLoadingInvite
												? 'Sending...'
												: 'Send Invite'}
										</button>
									</form>
									<p className="text-xs text-gray-500 mt-3">
										The user must utilize this email address
										to accept the invitation within
										CorpMind.
									</p>
								</div>
							)}

							{/* Список учасників */}
							<div>
								<h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex justify-between items-center">
									<span>Current Members</span>
									<span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">
										{members.length}
									</span>
								</h3>

								{isLoadingMembers ? (
									<div className="text-center py-4 text-gray-500">
										Loading members...
									</div>
								) : (
									<div className="space-y-2">
										{members.map((member) => (
											<div
												key={member.id}
												className="flex items-center justify-between bg-[#1A1D21] p-3 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors"
											>
												<div className="flex items-center gap-3">
													<div
														className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white uppercase shadow-sm ${
															member.role ===
															'owner'
																? 'bg-gradient-btn'
																: 'bg-gray-600'
														}`}
													>
														{member.nickname?.charAt(
															0
														)}
													</div>

													<div>
														<div className="flex items-center gap-2">
															<p className="text-sm text-white font-medium">
																{
																	member.nickname
																}
															</p>
															{member.role ===
															'owner' ? (
																<span className="text-[10px] bg-purple/20 text-purple px-1.5 py-0.5 rounded border border-purple/30">
																	OWNER
																</span>
															) : (
																<span className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
																	MEMBER
																</span>
															)}
														</div>
														<p className="text-xs text-gray-500">
															{member.email}
														</p>
													</div>
												</div>

												{isAdmin &&
													member.role !== 'owner' && (
														<button
															className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
															title="Remove user"
															onClick={() =>
																toast.info(
																	'Remove functionality pending'
																)
															}
														>
															<Trash2 size={16} />
														</button>
													)}
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
