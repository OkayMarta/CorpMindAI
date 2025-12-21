import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './pages/DashboardLayout';
import WorkspaceView from './pages/WorkspaceView';

const PrivateRoute = ({ children }) => {
	const { isAuthenticated, loading } = useAuth();
	if (loading)
		return <div className="text-white text-center mt-20">Loading...</div>;
	return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
	const { isAuthenticated, loading } = useAuth();
	if (loading) return null;
	return isAuthenticated ? <Navigate to="/" /> : children;
};

function App() {
	return (
		<AuthProvider>
			<Router>
				<ToastContainer theme="dark" position="top-right" />
				<Routes>
					<Route
						path="/login"
						element={
							<PublicRoute>
								<Login />
							</PublicRoute>
						}
					/>
					<Route
						path="/register"
						element={
							<PublicRoute>
								<Register />
							</PublicRoute>
						}
					/>

					<Route
						path="/"
						element={
							<PrivateRoute>
								<DashboardLayout />
							</PrivateRoute>
						}
					/>

					{/* Dashboard */}
					<Route
						path="/"
						element={
							<PrivateRoute>
								<DashboardLayout />
							</PrivateRoute>
						}
					/>

					{/* Чат (динамічний ID) */}
					<Route
						path="/workspace/:id"
						element={
							<PrivateRoute>
								<WorkspaceView />
							</PrivateRoute>
						}
					/>
				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;
