import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { workspaceService } from '../services/workspaces';
import { Settings } from 'lucide-react'; // Іконка
import Modal from '../components/Modal'; // Наша модалка
import DocumentsManager from '../modules/Documents/DocumentsManager'; // Наш менеджер

const WorkspaceView = () => {
	const { id } = useParams();
	const [workspace, setWorkspace] = useState(null);
	const [loading, setLoading] = useState(true);

	// Стан для модалки
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	useEffect(() => {
		const fetchDetails = async () => {
			try {
				const data = await workspaceService.getOne(id);
				setWorkspace(data);
			} catch (err) {
				console.error('Failed to load workspace');
			} finally {
				setLoading(false);
			}
		};
		fetchDetails();
	}, [id]);

	if (loading)
		return (
			<div className="bg-dark min-h-screen text-white flex items-center justify-center">
				Loading...
			</div>
		);

	return (
		<div className="flex min-h-screen bg-dark text-white font-sans">
			<Sidebar />

			<main className="flex-1 ml-64 flex flex-col h-screen">
				{/* Header */}
				<header className="h-16 border-b border-uiDisabled/20 flex items-center justify-between px-6 bg-dark">
					<div className="flex items-center gap-4">
						<Link
							to="/dashboard"
							className="text-uiDisabled hover:text-white text-xl transition"
						>
							←
						</Link>
						<h2 className="font-bold text-lg text-white">
							{workspace?.title}
						</h2>
					</div>

					{/* Кнопка налаштувань */}
					<button
						onClick={() => setIsSettingsOpen(true)}
						className="text-uiDisabled hover:text-blue transition p-2 rounded hover:bg-white/5"
					>
						<Settings size={24} />
					</button>
				</header>

				{/* Chat Area */}
				<div className="flex-1 overflow-y-auto p-6 bg-dark flex flex-col items-center justify-center text-uiDisabled">
					<p className="text-4xl mb-4">🧠</p>
					<p className="text-lg">
						This is the start of your chat in{' '}
						<b className="text-white">{workspace?.title}</b>.
					</p>
					<p className="text-sm mt-2">
						Open <b>Settings</b> (top right) to upload documents.
					</p>
				</div>

				{/* Input Area */}
				<div className="p-6 border-t border-uiDisabled/20 bg-dark">
					<div className="max-w-4xl mx-auto relative">
						<input
							type="text"
							placeholder="Ask a question about your documents..."
							className="w-full bg-[#1A1D21] text-white rounded-xl pl-6 pr-14 py-4 focus:outline-none focus:ring-1 focus:ring-blue placeholder-uiDisabled/50 shadow-lg"
						/>
						<button className="absolute right-3 top-3 p-2 bg-gradient-btn hover:bg-gradient-btn-hover rounded-lg text-white transition shadow-md">
							➤
						</button>
					</div>
				</div>
			</main>

			{/* --- MODAL --- */}
			<Modal
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
				title={`Manage: ${workspace?.title}`}
			>
				<DocumentsManager workspaceId={id} />
			</Modal>
		</div>
	);
};

export default WorkspaceView;
