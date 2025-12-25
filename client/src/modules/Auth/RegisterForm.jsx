import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

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
			console.error(error);
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
			} else {
				toast.error(msg || 'Registration failed');
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
				{/* Nickname Input */}
				<div>
					<div
						className={`relative border rounded px-4 py-2.5 focus-within:border-blue transition-colors ${
							errors.nickname
								? 'border-uiError'
								: 'border-uiDisabled/30'
						}`}
					>
						<label className="block text-[10px] font-bold text-uiDisabled uppercase tracking-wider mb-0.5">
							Nickname
						</label>
						<input
							type="text"
							name="nickname"
							value={formData.nickname}
							onChange={handleChange}
							className="w-full outline-none text-dark font-medium placeholder-uiDisabled/50 bg-transparent"
							placeholder="unique_username"
						/>
					</div>
					{errors.nickname && (
						<p className="text-uiError text-xs mt-1 flex items-center gap-1">
							<AlertCircle className="w-3 h-3" />{' '}
							{errors.nickname}
						</p>
					)}
				</div>

				{/* Email Input */}
				<div>
					<div
						className={`relative border rounded px-4 py-2.5 focus-within:border-blue transition-colors ${
							errors.email
								? 'border-uiError'
								: 'border-uiDisabled/30'
						}`}
					>
						<label className="block text-[10px] font-bold text-uiDisabled uppercase tracking-wider mb-0.5">
							Email Address
						</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							className="w-full outline-none text-dark font-medium placeholder-uiDisabled/50 bg-transparent"
							placeholder="you@example.com"
						/>
					</div>
					{errors.email && (
						<div className="flex flex-col mt-1">
							<p className="text-uiError text-xs flex items-center gap-1">
								<AlertCircle className="w-3 h-3" />{' '}
								{errors.email}
							</p>
							{errors.email === 'Email already exists' && (
								<Link
									to="/login"
									className="text-blue text-xs mt-1 hover:underline font-bold"
								>
									Already have an account? Log in.
								</Link>
							)}
						</div>
					)}
				</div>

				{/* Password Input */}
				<div>
					<div
						className={`relative border rounded px-4 py-2.5 focus-within:border-blue transition-colors ${
							errors.password
								? 'border-uiError'
								: 'border-uiDisabled/30'
						}`}
					>
						<label className="block text-[10px] font-bold text-uiDisabled uppercase tracking-wider mb-0.5">
							Password
						</label>
						<div className="flex items-center">
							<input
								type={showPassword ? 'text' : 'password'}
								name="password"
								value={formData.password}
								onChange={handleChange}
								className="w-full outline-none text-dark font-medium placeholder-uiDisabled/50 bg-transparent"
								placeholder="**********"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="text-uiDisabled hover:text-dark transition-colors"
							>
								{showPassword ? (
									<EyeOff size={20} />
								) : (
									<Eye size={20} />
								)}
							</button>
						</div>
					</div>
					{errors.password ? (
						<p className="text-uiError text-xs mt-1 flex items-center gap-1">
							<AlertCircle className="w-3 h-3" />{' '}
							{errors.password}
						</p>
					) : (
						<p className="text-uiDisabled text-[10px] mt-1 ml-1">
							Min 8 chars, 1 letter, 1 number, no spaces.
						</p>
					)}
				</div>

				{/* Gradient Button */}
				<button
					type="submit"
					disabled={isLoading}
					className="w-full py-4 rounded text-light font-bold text-lg uppercase tracking-wider bg-gradient-btn hover:bg-gradient-btn-hover transition-all duration-300 shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2 mt-6"
				>
					{isLoading ? (
						<Loader2 className="w-5 h-5 animate-spin" />
					) : (
						'Sign Up'
					)}
				</button>
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
