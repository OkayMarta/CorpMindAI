import { useState, useEffect } from 'react';
import { X, FileText, Users, Settings, Save, Mail } from 'lucide-react';
import { toast } from 'react-toastify';

// Services
import { workspaceService } from '../../../services/workspaces';
import { invitationService } from '../../../services/invitations';

// Components
import DocumentsManager from '../../documents/components/DocumentsManager';
import Avatar from '../../../components/ui/Avatar';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

// Utils
import { handleError } from '../../../utils/errorHandler';

const WorkspaceSettingsModal = ({
	isOpen,
	onClose,
	workspaceId,
	currentRole,
	workspaceTitle,
	onUpdate,
}) => {
	const isAdmin = currentRole === 'owner';
	const [activeTab, setActiveTab] = useState(
		isAdmin ? 'general' : 'documents'
	);

	// Data States
	const [members, setMembers] = useState([]);
	const [loadingMembers, setLoadingMembers] = useState(false);

	// General Tab State
	const [title, setTitle] = useState(workspaceTitle || '');
	const [savingTitle, setSavingTitle] = useState(false);

	// Invite State
	const [inviteEmail, setInviteEmail] = useState('');
	const [inviting, setInviting] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setTitle(workspaceTitle || '');
			if (activeTab === 'members') fetchMembers();
		}
	}, [isOpen, activeTab, workspaceTitle]);

	const fetchMembers = async () => {
		setLoadingMembers(true);
		try {
			const team = await workspaceService.getMembers(workspaceId);
			setMembers(team);
		} catch (error) {
			handleError(error, 'Failed to load members');
		} finally {
			setLoadingMembers(false);
		}
	};

	const handleUpdateTitle = async (e) => {
		e.preventDefault();
		if (!title.trim() || title === workspaceTitle) return;
		setSavingTitle(true);
		try {
			const updatedWs = await workspaceService.update(workspaceId, title);
			toast.success('Renamed successfully');
			if (onUpdate) onUpdate(updatedWs.title);
		} catch (error) {
			handleError(error, 'Update failed');
		} finally {
			setSavingTitle(false);
		}
	};

	const handleInvite = async (e) => {
		e.preventDefault();
		if (!inviteEmail.trim()) return;
		setInviting(true);
		try {
			await invitationService.sendInvite(workspaceId, inviteEmail);
			toast.success(`Invite sent to ${inviteEmail}`);
			setInviteEmail('');
		} catch (error) {
			handleError(error, 'Invitation failed');
		} finally {
			setInviting(false);
		}
	};

	if (!isOpen) return null;

	// Допоміжна функція для класів вкладок
	const getTabClass = (name) => {
		const isActive = activeTab === name;
		return `py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
			isActive
				? 'border-blue text-blue'
				: 'border-transparent text-gray-400 hover:text-light'
		}`;
	};

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			<div className="bg-dark2 border border-gray-700 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] h-auto">
				{/* --- Header --- */}
				<div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-700 flex-shrink-0">
					<h2 className="text-lg md:text-xl font-bold text-light flex items-center gap-2">
						<Settings className="w-5 h-5 text-blue" />
						Settings
					</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-light transition"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				{/* --- Tabs --- */}
				<div className="flex border-b border-gray-700 px-4 md:px-6 gap-4 md:gap-6 overflow-x-auto no-scrollbar">
					{isAdmin && (
						<button
							onClick={() => setActiveTab('general')}
							className={getTabClass('general')}
						>
							<Settings className="w-4 h-4" /> General
						</button>
					)}
					<button
						onClick={() => setActiveTab('documents')}
						className={getTabClass('documents')}
					>
						<FileText className="w-4 h-4" /> Documents
					</button>
					<button
						onClick={() => setActiveTab('members')}
						className={getTabClass('members')}
					>
						<Users className="w-4 h-4" /> Members
					</button>
				</div>

				{/* --- Content --- */}
				<div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1">
					{/* GENERAL TAB */}
					{activeTab === 'general' && isAdmin && (
						<form
							onSubmit={handleUpdateTitle}
							className="flex flex-col gap-4"
						>
							<div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-2">
								<div className="flex-1">
									<Input
										variant="dark"
										label="Workspace Name"
										value={title}
										onChange={(e) =>
											setTitle(e.target.value)
										}
									/>
								</div>
								<Button
									type="submit"
									disabled={
										savingTitle ||
										!title.trim() ||
										title === workspaceTitle
									}
									isLoading={savingTitle}
									className="mb-[1px] w-full md:w-auto"
								>
									<Save className="w-4 h-4" />
									Save
								</Button>
							</div>
						</form>
					)}

					{/* DOCUMENTS TAB */}
					{activeTab === 'documents' && (
						<DocumentsManager
							workspaceId={workspaceId}
							userRole={currentRole}
						/>
					)}

					{/* MEMBERS TAB */}
					{activeTab === 'members' && (
						<div className="space-y-6">
							{/* Invite Form */}
							{isAdmin && (
								<form
									onSubmit={handleInvite}
									className="flex flex-col md:flex-row md:items-end gap-3 md:gap-2"
								>
									<div className="flex-1">
										<Input
											variant="dark"
											icon={Mail}
											placeholder="Invite by email..."
											value={inviteEmail}
											onChange={(e) =>
												setInviteEmail(e.target.value)
											}
										/>
									</div>
									<Button
										type="submit"
										disabled={inviting || !inviteEmail}
										isLoading={inviting}
										className="mb-[1px] w-full md:w-auto"
									>
										Invite
									</Button>
								</form>
							)}

							{/* Members List */}
							<div>
								<h3 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">
									Team Members
								</h3>
								{loadingMembers ? (
									<p className="text-center text-gray-500 py-4">
										Loading...
									</p>
								) : (
									<div className="space-y-2">
										{members.map((m) => (
											<div
												key={m.id}
												className="flex justify-between items-center bg-dark p-3 rounded-lg border border-gray-800"
											>
												<div className="flex items-center gap-3 overflow-hidden">
													<div className="flex-shrink-0">
														<Avatar
															url={m.avatar_url}
															name={m.nickname}
														/>
													</div>

													<div className="min-w-0">
														<p className="text-light text-sm font-medium truncate">
															{m.nickname}
														</p>
														<p className="text-xs text-gray-500 truncate">
															{m.email}
														</p>
													</div>
												</div>

												<span
													className={`text-[10px] px-2 py-0.5 ml-2 rounded uppercase font-bold tracking-wider flex-shrink-0 ${
														m.role === 'owner'
															? 'bg-gold/20 text-gold'
															: 'bg-purple/20 text-purple'
													}`}
												>
													{m.role === 'owner'
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
