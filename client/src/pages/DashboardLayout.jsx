import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
	const { user, logoutUser } = useAuth();

	return (
		<div className="min-h-screen bg-gray-900 text-white p-10">
			<h1 className="text-3xl font-bold">Dashboard</h1>
			<p className="mt-4 text-xl">
				Hello, <span className="text-blue-500">{user?.nickname}</span>
			</p>
			<button
				onClick={logoutUser}
				className="mt-4 bg-red-600 px-4 py-2 rounded"
			>
				Logout
			</button>
		</div>
	);
};

export default DashboardLayout;
