import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { workspaceService } from '../services/workspaces';

const WorkspaceView = () => {
	const { id } = useParams(); // Беремо ID з URL
	const [workspace, setWorkspace] = useState(null);
	const [loading, setLoading] = useState(true);

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
			<div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">
				Loading...
			</div>
		);

	return (
		<div className="flex min-h-screen bg-gray-900 text-white">
			<Sidebar />

			<main className="flex-1 ml-64 flex flex-col h-screen">
				{/* Header */}
				<header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900">
					<div className="flex items-center gap-4">
						<Link
							to="/"
							className="text-gray-400 hover:text-white text-xl"
						>
							←
						</Link>
						<h2 className="font-bold text-lg">
							{workspace?.title}
						</h2>
					</div>
					<button className="text-gray-400 hover:text-white text-2xl">
						⚙️
					</button>
				</header>

				{/* Chat Area (Empty for now) */}
				<div className="flex-1 overflow-y-auto p-6 bg-gray-900 flex flex-col items-center justify-center text-gray-500">
					<p className="text-2xl mb-2">👋</p>
					<p>
						This is the start of your chat in{' '}
						<b>{workspace?.title}</b>.
					</p>
					<p className="text-sm mt-2">
						Upload documents in Settings to start.
					</p>
				</div>

				{/* Input Area */}
				<div className="p-4 border-t border-gray-800 bg-gray-900">
					<div className="max-w-4xl mx-auto relative">
						<input
							type="text"
							placeholder="Ask a question about your documents..."
							className="w-full bg-gray-800 text-white rounded-lg pl-4 pr-12 py-4 focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
						<button className="absolute right-3 top-3 p-1 bg-blue-600 rounded text-white hover:bg-blue-500">
							➤
						</button>
					</div>
				</div>
			</main>
		</div>
	);
};

export default WorkspaceView;
