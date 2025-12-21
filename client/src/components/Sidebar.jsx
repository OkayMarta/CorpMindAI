import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Sidebar = () => {
	const { user, logoutUser } = useAuth();

	return (
		<aside className="w-64 bg-gray-900 text-white flex flex-col h-screen fixed left-0 top-0 border-r border-gray-800">
			{/* Logo */}
			<div className="p-6 border-b border-gray-800">
				<Link
					to="/"
					className="text-2xl font-bold text-blue-500 flex items-center gap-2"
				>
					<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
						CM
					</div>
					CorpMind
				</Link>
			</div>

			{/* Menu Items (Тут потім будуть сповіщення) */}
			<div className="flex-1 p-4">
				<div className="text-gray-400 text-sm uppercase mb-2">Menu</div>
				<Link
					to="/"
					className="block p-3 rounded hover:bg-gray-800 transition text-gray-300 hover:text-white"
				>
					My Workspaces
				</Link>
			</div>

			{/* User Profile & Logout */}
			<div className="p-4 border-t border-gray-800">
				<div className="flex items-center gap-3 mb-4">
					<div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-xl">
						{user?.nickname?.charAt(0).toUpperCase()}
					</div>
					<div>
						<p className="font-bold text-sm">{user?.nickname}</p>
						<p className="text-xs text-gray-500 truncate w-32">
							{user?.email}
						</p>
					</div>
				</div>
				<button
					onClick={logoutUser}
					className="w-full py-2 px-4 bg-gray-800 hover:bg-red-600 rounded text-sm transition"
				>
					Log Out
				</button>
			</div>
		</aside>
	);
};

export default Sidebar;
