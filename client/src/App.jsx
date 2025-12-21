import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './pages/DashboardLayout';
import WorkspaceView from './pages/WorkspaceView';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const PrivateRoute = ({ children }) => {
	const { isAuthenticated, loading } = useAuth();
	if (loading) return null;
	return isAuthenticated ? children : <Navigate to="/" />;
};

const PublicRoute = ({ children }) => {
	const { isAuthenticated, loading } = useAuth();
	if (loading) return null;
	return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

function App() {
	return (
		<AuthProvider>
			<Router>
				<ToastContainer theme="dark" position="top-right" />
				<Routes>
					<Route
						path="/"
						element={
							<PublicRoute>
								<Landing />
							</PublicRoute>
						}
					/>

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
						path="/dashboard"
						element={
							<PrivateRoute>
								<DashboardLayout />
							</PrivateRoute>
						}
					/>

					<Route
						path="/workspace/:id"
						element={
							<PrivateRoute>
								<WorkspaceView />
							</PrivateRoute>
						}
					/>

					<Route
						path="/forgot-password"
						element={
							<PublicRoute>
								<ForgotPassword />
							</PublicRoute>
						}
					/>

					<Route
						path="/reset-password/:token"
						element={
							<PublicRoute>
								<ResetPassword />
							</PublicRoute>
						}
					/>
				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;
