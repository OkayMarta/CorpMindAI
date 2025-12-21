import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const RegisterForm = () => {
	const { loginUser } = useAuth();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		email: '',
		nickname: '',
		password: '',
	});

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const data = await authService.register(formData);
			loginUser(data.token);
			toast.success('Registration successful!');
			navigate('/dashboard');
		} catch (err) {
			toast.error(err.response?.data || 'Error registering');
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-4 w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg"
		>
			<h2 className="text-2xl font-bold text-center text-blue-500 mb-6">
				Create Account
			</h2>

			<input
				type="email"
				placeholder="Email"
				required
				className="w-full p-3 bg-gray-700 rounded text-white focus:ring-2 focus:ring-blue-500 outline-none"
				onChange={(e) =>
					setFormData({ ...formData, email: e.target.value })
				}
			/>
			<input
				type="text"
				placeholder="Nickname"
				required
				className="w-full p-3 bg-gray-700 rounded text-white focus:ring-2 focus:ring-blue-500 outline-none"
				onChange={(e) =>
					setFormData({ ...formData, nickname: e.target.value })
				}
			/>
			<input
				type="password"
				placeholder="Password"
				required
				className="w-full p-3 bg-gray-700 rounded text-white focus:ring-2 focus:ring-blue-500 outline-none"
				onChange={(e) =>
					setFormData({ ...formData, password: e.target.value })
				}
			/>

			<button className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-bold text-white transition">
				Sign Up
			</button>

			<p className="text-center text-gray-400 mt-4">
				Already have an account?{' '}
				<Link to="/login" className="text-blue-400 hover:underline">
					Login
				</Link>
			</p>
		</form>
	);
};

export default RegisterForm;
