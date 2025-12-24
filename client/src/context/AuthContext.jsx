import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);

	const checkAuth = async () => {
		const token = localStorage.getItem('token');
		if (!token) {
			setLoading(false);
			return;
		}

		try {
			const userData = await authService.getMe();
			setUser(userData);
			setIsAuthenticated(true);
		} catch (err) {
			console.error('Auth check failed', err);
			localStorage.removeItem('token');
			setIsAuthenticated(false);
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		checkAuth();
	}, []);

	const login = (token) => {
		localStorage.setItem('token', token);
		checkAuth();
	};

	const logout = () => {
		localStorage.removeItem('token');
		setIsAuthenticated(false);
		setUser(null);
	};

	return (
		<AuthContext.Provider
			value={{ user, isAuthenticated, loading, login, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
