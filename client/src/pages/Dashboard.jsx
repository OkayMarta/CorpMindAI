import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Settings, Trash2, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

// Services
import { workspaceService } from '../services/workspaces';

// UI Components
import Button from '../components/ui/Button';

// Features / Modals
import WorkspaceSettingsModal from '../features/workspace/components/WorkspaceSettingsModal';
import CreateWorkspaceModal from '../features/workspace/components/CreateWorkspaceModal';

const Dashboard = () => {
	const navigate = useNavigate();

	// Data State
	const [workspaces, setWorkspaces] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState('all');

	// Modal State
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [settingsModalOpen, setSettingsModalOpen] = useState(false);
	const [selectedWorkspace, setSelectedWorkspace] = useState(null);

	useEffect(() => {
		const fetchWorkspaces = async () => {
			try {
				const data = await workspaceService.getAll();
				setWorkspaces(data);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};
		fetchWorkspaces();
	}, []);

	// --- Handlers ---

	const handleCreateSubmit = async (title) => {
		try {
			const newWorkspace = await workspaceService.create(title);
			const newWorkspaceWithRole = { ...newWorkspace, role: 'owner' };

			setWorkspaces([newWorkspaceWithRole, ...workspaces]);
			setCreateModalOpen(false);
			toast.success('Workspace created!');
			navigate(`/workspace/${newWorkspace.id}`);
		} catch (error) {
			console.error(error);
			toast.error('Failed to create workspace');
		}
	};

	const handleDeleteWorkspace = async (e, workspace) => {
		e.stopPropagation();
		const isOwner = workspace.role === 'owner';
		const confirmMessage = isOwner
			? `Are you sure you want to delete "${workspace.title}"?`
			: `Are you sure you want to leave "${workspace.title}"?`;

		if (!window.confirm(confirmMessage)) return;

		try {
			if (isOwner) {
				await workspaceService.delete(workspace.id);
				toast.success('Workspace deleted');
			} else {
				await workspaceService.leave(workspace.id);
				toast.success('Left workspace');
			}
			setWorkspaces((prev) => prev.filter((w) => w.id !== workspace.id));
		} catch (error) {
			toast.error('Operation failed');
		}
	};

	const handleOpenSettings = (e, workspace) => {
		e.stopPropagation();
		setSelectedWorkspace(workspace);
		setSettingsModalOpen(true);
	};

	// --- Helpers ---

	const getRoleBadgeStyles = (role) => {
		return role === 'owner'
			? 'bg-gold/20 text-gold'
			: 'bg-purple/20 text-purple';
	};

	const filteredWorkspaces = workspaces.filter((w) => {
		if (filter === 'owner') return w.role === 'owner';
		if (filter === 'member') return w.role === 'member';
		return true;
	});

	if (loading) {
		return (
			<div className="p-8 text-center text-gray-500">
				Loading workspaces...
			</div>
		);
	}

	return (
		<div className="p-8 max-w-5xl mx-auto">
			{/* --- EMPTY STATE --- */}
			{workspaces.length === 0 ? (
				<div className="flex flex-col items-center justify-center h-[60vh] text-center">
					<div className="bg-gray-800 p-6 rounded-full mb-6">
						<MessageSquare className="w-12 h-12 text-blue" />
					</div>
					<h2 className="text-2xl font-bold mb-2">
						Welcome to CorpMind<span className="text-gold">AI</span>
					</h2>
					<p className="text-gray-400 mb-8 max-w-md">
						It looks like you don't have any workspaces yet.
					</p>

					{/* Використовуємо наш UI Button */}
					<Button
						onClick={() => setCreateModalOpen(true)}
						className="transform hover:scale-105"
					>
						<Plus className="w-5 h-5" /> Create New Workspace
					</Button>
				</div>
			) : (
				<>
					{/* --- FILTERS HEADER --- */}
					<div className="flex items-center justify-between mb-6 select-none">
						<div className="flex items-center text-l gap-3">
							<button
								onClick={() => setFilter('all')}
								className={`transition-colors duration-200 ${
									filter === 'all'
										? 'text-light font-medium'
										: 'text-gray-500 hover:text-gray-300 font-light'
								}`}
							>
								All
							</button>
							<span className="text-gray-600 font-thin text-xl pb-1">
								|
							</span>
							<button
								onClick={() => setFilter('owner')}
								className={`transition-colors duration-200 ${
									filter === 'owner'
										? 'text-light font-medium'
										: 'text-gray-500 hover:text-gray-300 font-light'
								}`}
							>
								Admin
							</button>
							<span className="text-gray-600 font-thin text-xl pb-1">
								|
							</span>
							<button
								onClick={() => setFilter('member')}
								className={`transition-colors duration-200 ${
									filter === 'member'
										? 'text-light font-medium'
										: 'text-gray-500 hover:text-gray-300 font-light'
								}`}
							>
								Member
							</button>
						</div>
						<div className="text-gray-500 text-sm font-medium">
							Total:{' '}
							<span className="text-gray ml-1">
								{filteredWorkspaces.length}
							</span>
						</div>
					</div>

					{/* --- GRID --- */}
					<div className="space-y-3">
						{filteredWorkspaces.map((workspace) => (
							<div
								key={workspace.id}
								onClick={() =>
									navigate(`/workspace/${workspace.id}`)
								}
								className="group bg-dark2 border border-gray-800 hover:border-blue rounded-lg px-4 py-3 flex items-center cursor-pointer transition-all duration-200"
							>
								{/* Icon */}
								<div className="w-10 h-10 rounded bg-gray-800 flex flex-shrink-0 items-center justify-center text-blue group-hover:bg-blue group-hover:text-light transition-colors mr-4">
									<MessageSquare className="w-5 h-5" />
								</div>

								{/* Info */}
								<div className="flex-1 flex items-center justify-between overflow-hidden">
									<h3 className="font-semibold text-lg text-light group-hover:text-blue transition-colors truncate mr-4">
										{workspace.title}
									</h3>

									<div className="flex items-center gap-6 flex-shrink-0">
										<span className="text-sm text-gray-500">
											{new Date(
												workspace.created_at
											).toLocaleDateString()}
										</span>

										<span
											className={`text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider w-20 text-center ${getRoleBadgeStyles(
												workspace.role
											)}`}
										>
											{workspace.role === 'owner'
												? 'Admin'
												: 'Member'}
										</span>

										{/* Action Buttons */}
										<div className="flex items-center gap-2 w-16 justify-end">
											<button
												onClick={(e) =>
													handleOpenSettings(
														e,
														workspace
													)
												}
												className="p-1.5 text-gray-400 hover:text-light hover:bg-gray-700 rounded-full transition-colors opacity-0 group-hover:opacity-100"
												title="Settings"
											>
												<Settings className="w-5 h-5" />
											</button>
											<button
												onClick={(e) =>
													handleDeleteWorkspace(
														e,
														workspace
													)
												}
												className="p-1.5 text-gray-400 hover:text-uiError hover:bg-uiError/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
												title={
													workspace.role === 'owner'
														? 'Delete'
														: 'Leave'
												}
											>
												<Trash2 className="w-5 h-5" />
											</button>
										</div>
									</div>
								</div>
							</div>
						))}

						{filteredWorkspaces.length === 0 &&
							workspaces.length > 0 && (
								<div className="text-center text-gray-500 mt-10">
									No workspaces found in this category.
								</div>
							)}
					</div>
				</>
			)}

			{/* --- MODALS --- */}

			{selectedWorkspace && (
				<WorkspaceSettingsModal
					isOpen={settingsModalOpen}
					onClose={() => setSettingsModalOpen(false)}
					workspaceId={selectedWorkspace.id}
					currentRole={selectedWorkspace.role}
					workspaceTitle={selectedWorkspace.title}
					onUpdate={(newTitle) => {
						setWorkspaces((prev) =>
							prev.map((w) =>
								w.id === selectedWorkspace.id
									? { ...w, title: newTitle }
									: w
							)
						);
					}}
				/>
			)}

			<CreateWorkspaceModal
				isOpen={createModalOpen}
				onClose={() => setCreateModalOpen(false)}
				onSubmit={handleCreateSubmit}
			/>
		</div>
	);
};

export default Dashboard;
