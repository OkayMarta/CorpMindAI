import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { authService } from '../../../services/auth';
import { toast } from 'react-toastify';
import { Eye, EyeOff, User, Mail } from 'lucide-react';
import { handleError } from '../../../utils/errorHandler';

import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const RegisterForm = () => {
	const { login } = useAuth();
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		nickname: '',
		email: '',
		password: '',
	});

	const [errors, setErrors] = useState({});
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// --- ЛОГІКА ВАЛІДАЦІЇ ---
	const validate = () => {
		const newErrors = {};

		if (!formData.nickname.trim()) {
			newErrors.nickname = 'Nickname is required';
		} else if (formData.nickname.length < 3) {
			newErrors.nickname = 'Nickname must be at least 3 characters';
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!formData.email) {
			newErrors.email = 'Email is required';
		} else if (!emailRegex.test(formData.email)) {
			newErrors.email = 'Invalid email format';
		}

		const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[^\s]{8,}$/;
		if (!formData.password) {
			newErrors.password = 'Password is required';
		} else if (!passwordRegex.test(formData.password)) {
			newErrors.password = 'Min 8 chars, 1 letter, 1 number, no spaces';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
		if (errors[e.target.name]) {
			setErrors({ ...errors, [e.target.name]: null });
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validate()) return;

		setIsLoading(true);
		try {
			const data = await authService.register(formData);
			if (data.token) {
				login(data.token);
				toast.success('Registration successful!');
				navigate('/dashboard');
			}
		} catch (error) {
			const msg = error.response?.data;

			if (msg === 'Email already registered') {
				setErrors((prev) => ({
					...prev,
					email: 'Email already exists',
				}));
				toast.error(
					<div>
						Email already registered. <br />
						<Link to="/login" className="underline font-bold">
							Log in here?
						</Link>
					</div>,
					{ autoClose: 5000 }
				);
			} else if (msg === 'Nickname is taken') {
				setErrors((prev) => ({
					...prev,
					nickname: 'Nickname is already taken',
				}));
				handleError(error, 'Nickname is taken');
			} else {
				handleError(error, 'Registration failed');
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="bg-light px-10 py-8 md:px-14 md:py-10 rounded shadow-2xl w-full max-w-[550px] text-center">
			<h2 className="text-3xl font-bold text-dark mb-2">
				Join CorpMind<span className="text-gold">AI</span>
			</h2>
			<p className="text-uiDisabled text-sm mb-6">
				Create an account to start your journey
			</p>

			<form onSubmit={handleSubmit} className="space-y-4 text-left">
				<Input
					label="NICKNAME"
					name="nickname"
					value={formData.nickname}
					onChange={handleChange}
					error={errors.nickname}
					placeholder="unique_username"
					icon={User}
				/>

				<Input
					label="EMAIL ADDRESS"
					name="email"
					value={formData.email}
					onChange={handleChange}
					error={errors.email}
					placeholder="you@example.com"
					icon={Mail}
				/>

				<Input
					label="PASSWORD"
					name="password"
					type={showPassword ? 'text' : 'password'}
					value={formData.password}
					onChange={handleChange}
					error={errors.password}
					placeholder="**********"
					rightIcon={showPassword ? EyeOff : Eye}
					onRightIconClick={() => setShowPassword(!showPassword)}
				/>

				<Button
					type="submit"
					className="w-full py-4 mt-6 text-lg uppercase tracking-wider"
					isLoading={isLoading}
				>
					Sign Up
				</Button>
			</form>

			<div className="mt-6 text-center text-sm text-uiDisabled">
				Already have an account?{' '}
				<Link
					to="/login"
					className="text-dark hover:text-purple font-medium underline transition-colors"
				>
					Log In
				</Link>
			</div>
		</div>
	);
};

export default RegisterForm;
