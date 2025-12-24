import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workspaceService } from '../services/workspaces';
import Sidebar from '../components/Sidebar';
import WorkspaceSettingsModal from '../components/WorkspaceSettingsModal';
import { Search, MessageSquare, Trash2, Settings, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

const DashboardLayout = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [workspaces, setWorkspaces] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState('all');
	const [settingsModalOpen, setSettingsModalOpen] = useState(false);
	const [selectedWorkspace, setSelectedWorkspace] = useState(null);

	useEffect(() => {
		fetchWorkspaces();
	}, []);

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

	const handleDeleteWorkspace = async (e, workspace) => {
		e.stopPropagation();

		const isOwner = workspace.role === 'owner';
		const confirmMessage = isOwner
			? `Are you sure you want to delete "${workspace.title}"? This cannot be undone.`
			: `Are you sure you want to leave "${workspace.title}"?`;

		if (!window.confirm(confirmMessage)) return;

		try {
			if (isOwner) {
				await workspaceService.delete(workspace.id);
				toast.success('Workspace deleted successfully');
			} else {
				await workspaceService.leave(workspace.id);
				toast.success('You have left the workspace');
			}

			// Оновлюємо список локально, щоб чат зник миттєво
			setWorkspaces((prev) => prev.filter((w) => w.id !== workspace.id));
		} catch (error) {
			console.error(error);
			// Обробка помилки, якщо щось пішло не так на сервері
			const errorMsg = error.response?.data || 'Operation failed';
			toast.error(errorMsg);
		}
	};

	const handleOpenSettings = (e, workspace) => {
		e.stopPropagation();
		setSelectedWorkspace(workspace);
		setSettingsModalOpen(true);
	};

	const handleCreateClick = () => {
		toast.info('Open Create Modal');
	};

	const filteredWorkspaces = workspaces.filter((w) => {
		const matchesSearch = w.title
			.toLowerCase()
			.includes(searchQuery.toLowerCase());

		let matchesFilter = true;
		if (filter === 'owner') {
			matchesFilter = w.role === 'owner';
		} else if (filter === 'member') {
			matchesFilter = w.role === 'member';
		}

		return matchesSearch && matchesFilter;
	});

	return (
		<div className="min-h-screen bg-dark text-light font-sans flex flex-col">
			{/* --- HEADER --- */}
			<header className="h-16 border-b border-gray-700 bg-dark flex items-center flex-shrink-0 z-20 fixed top-0 w-full">
				{/* Ліва частина */}
				<div className="w-72 flex items-center px-6 border-r border-gray-700 h-full">
					<img
						src="/logoCropped.svg"
						alt="CorpMind AI"
						className="h-12 mr-3"
					/>
					<span className="font-bold text-2xl tracking-wide">
						CorpMind<span className="text-gold">AI</span>
					</span>
				</div>

				{/* Права частина: Пошук */}
				<div className="flex-1 flex justify-center items-center px-4">
					<div className="relative w-full max-w-xl">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
						<input
							type="text"
							placeholder="Search workspaces..."
							className="w-full bg-dark2 border border-gray-700 text-light rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-blue transition-colors"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>
			</header>

			{/* --- MAIN LAYOUT --- */}
			<div className="flex flex-1 pt-16 h-screen">
				<Sidebar onOpenCreate={handleCreateClick} />

				<main className="flex-1 overflow-y-auto p-8 bg-[#0F1113] ml-72">
					{loading ? (
						<div className="flex justify-center items-center h-full text-gray-400">
							Loading...
						</div>
					) : workspaces.length === 0 ? (
						/* EMPTY STATE */
						<div className="flex flex-col items-center justify-center h-full text-center">
							<div className="bg-gray-800 p-6 rounded-full mb-6">
								<MessageSquare className="w-12 h-12 text-blue" />
							</div>
							<h2 className="text-2xl font-bold mb-2">
								Welcome to CorpMind
								<span className="text-gold">AI</span>
							</h2>
							<p className="text-gray-400 mb-8 max-w-md">
								It looks like you don't have any workspaces yet.
								Create your first workspace to start managing
								documents and chatting with AI.
							</p>
							<button
								onClick={handleCreateClick}
								className="bg-gradient-btn hover:bg-gradient-btn-hover text-light font-semibold py-3 px-8 rounded-lg transition-all shadow-lg transform hover:scale-105 flex items-center gap-2"
							>
								<Plus className="w-5 h-5" />
								Create New Workspace
							</button>
						</div>
					) : (
						/* LIST VIEW */
						<div className="max-w-5xl mx-auto">
							{/* Filter Controls (All | Admin | Member) */}
							<div className="flex items-center justify-between mb-6 select-none">
								{/* Left Side: Filters */}
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

								{/* Right Side: Counter */}
								<div className="text-gray-500 text-sm font-medium">
									Total:{' '}
									<span className="text-gray ml-1">
										{filteredWorkspaces.length}
									</span>
								</div>
							</div>

							{/* Workspace List */}
							<div className="space-y-3">
								{filteredWorkspaces.map((workspace) => (
									<div
										key={workspace.id}
										onClick={() =>
											navigate(
												`/workspace/${workspace.id}`
											)
										}
										className="group bg-[#1A1D21] border border-gray-800 hover:border-blue rounded-lg px-4 py-3 flex items-center cursor-pointer transition-all duration-200"
									>
										{/* Icon */}
										<div className="w-10 h-10 rounded bg-gray-800 flex flex-shrink-0 items-center justify-center text-blue group-hover:bg-blue group-hover:text-light transition-colors mr-4">
											<MessageSquare className="w-5 h-5" />
										</div>

										{/* Content Row: Title --Spacer-- Date Role Actions */}
										<div className="flex-1 flex items-center justify-between overflow-hidden">
											{/* Title */}
											<h3 className="font-semibold text-lg text-light group-hover:text-blue transition-colors truncate mr-4">
												{workspace.title}
											</h3>

											{/* Meta Info & Actions */}
											<div className="flex items-center gap-6 flex-shrink-0">
												{/* Date */}
												<span className="text-sm text-gray-500">
													{new Date(
														workspace.created_at
													).toLocaleDateString()}
												</span>

												{/* Role Badge */}
												<span
													className={`text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider w-20 text-center ${
														workspace.role ===
														'owner'
															? 'bg-gold/20 text-gold'
															: 'bg-purple/20 text-purple'
													}`}
												>
													{workspace.role === 'owner'
														? 'Admin'
														: 'Member'}
												</span>

												{/* Actions Buttons */}
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
															workspace.role ===
															'owner'
																? 'Delete Workspace'
																: 'Leave Workspace'
														}
													>
														<Trash2 className="w-5 h-5" />
													</button>
												</div>
											</div>
										</div>
									</div>
								))}

								{/* Empty Search Result Message */}
								{filteredWorkspaces.length === 0 &&
									workspaces.length > 0 && (
										<div className="text-center text-gray-500 mt-10">
											No workspaces found in this
											category.
										</div>
									)}
							</div>
						</div>
					)}
				</main>
			</div>

			{selectedWorkspace && (
				<WorkspaceSettingsModal
					isOpen={settingsModalOpen}
					onClose={() => setSettingsModalOpen(false)}
					workspaceId={selectedWorkspace.id}
					currentRole={selectedWorkspace.role}
				/>
			)}
		</div>
	);
};

export default DashboardLayout;
