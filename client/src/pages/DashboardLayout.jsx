import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { workspaceService } from '../services/workspaces';
import { toast } from 'react-toastify';

const DashboardLayout = () => {
	const [workspaces, setWorkspaces] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [newTitle, setNewTitle] = useState('');

	// Завантаження списку
	const fetchWorkspaces = async () => {
		try {
			const data = await workspaceService.getAll();
			setWorkspaces(data);
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		fetchWorkspaces();
	}, []);

	// Створення нового
	const handleCreate = async (e) => {
		e.preventDefault();
		try {
			await workspaceService.create(newTitle);
			toast.success('Workspace created!');
			setNewTitle('');
			setIsModalOpen(false);
			fetchWorkspaces(); // Оновити список
		} catch (err) {
			toast.error('Failed to create workspace');
		}
	};

	return (
		<div className="flex min-h-screen bg-gray-900">
			<Sidebar />

			{/* Main Content */}
			<main className="flex-1 ml-64 p-10 text-white">
				<header className="flex justify-between items-center mb-10">
					<h1 className="text-3xl font-bold">My Workspaces</h1>
					<button
						onClick={() => setIsModalOpen(true)}
						className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded font-bold transition"
					>
						+ Create New
					</button>
				</header>

				{/* List of Cards */}
				{workspaces.length === 0 ? (
					<div className="text-center text-gray-500 mt-20">
						<p className="text-xl">
							You don't have any workspaces yet.
						</p>
						<p>Create one to start chatting with your docs.</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{workspaces.map((ws) => (
							<Link
								key={ws.id}
								to={`/workspace/${ws.id}`}
								className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition border border-gray-700 hover:border-blue-500"
							>
								<h3 className="text-xl font-bold mb-2">
									{ws.title}
								</h3>
								<div className="flex justify-between text-sm text-gray-400">
									<span>
										{new Date(
											ws.created_at
										).toLocaleDateString()}
									</span>
									<span className="uppercase text-xs bg-gray-900 px-2 py-1 rounded">
										{ws.role}
									</span>
								</div>
							</Link>
						))}
					</div>
				)}
			</main>

			{/* Simple Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-gray-800 p-8 rounded-lg w-96 border border-gray-700">
						<h2 className="text-xl font-bold text-white mb-4">
							New Workspace
						</h2>
						<form onSubmit={handleCreate}>
							<input
								autoFocus
								type="text"
								placeholder="Project Name (e.g. Marketing Q3)"
								className="w-full p-3 bg-gray-900 text-white rounded mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
								value={newTitle}
								onChange={(e) => setNewTitle(e.target.value)}
								required
							/>
							<div className="flex justify-end gap-3">
								<button
									type="button"
									onClick={() => setIsModalOpen(false)}
									className="px-4 py-2 text-gray-300 hover:text-white"
								>
									Cancel
								</button>
								<button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 text-white">
									Create
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default DashboardLayout;
