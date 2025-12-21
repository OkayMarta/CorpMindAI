import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';

const LoginForm = () => {
	const { loginUser } = useAuth();
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		email: '',
		password: '',
		rememberMe: false, // Значення за замовчуванням
	});

	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			// formData тепер містить email, password і rememberMe
			const data = await authService.login(formData);
			loginUser(data.token);
			toast.success('Welcome back!');
			navigate('/dashboard');
		} catch (err) {
			toast.error(err.response?.data || 'Invalid credentials');
		}
	};

	return (
		<div className="bg-light p-10 md:p-14 rounded shadow-2xl w-full max-w-[550px] text-center">
			{/* Title */}
			<h2 className="text-3xl font-bold text-dark mb-2">
				Log In to CorpMind<span className="text-gold">AI</span>
			</h2>
			<p className="text-uiDisabled text-sm mb-10">
				Enter your credentials to access your workspace
			</p>

			<form onSubmit={handleSubmit} className="space-y-8 text-left">
				{/* Email Input */}
				<div className="relative border border-uiDisabled/30 rounded px-4 py-3 focus-within:border-blue transition-colors">
					<label className="block text-[10px] font-bold text-uiDisabled uppercase tracking-wider mb-1">
						Email Address
					</label>
					<input
						type="email"
						value={formData.email}
						onChange={(e) =>
							setFormData({ ...formData, email: e.target.value })
						}
						placeholder="johndoe@example.com"
						className="w-full outline-none text-dark font-medium placeholder-uiDisabled/50 bg-transparent"
						required
					/>
				</div>

				{/* Password Input */}
				<div className="relative border border-uiDisabled/30 rounded px-4 py-3 focus-within:border-blue transition-colors">
					<label className="block text-[10px] font-bold text-uiDisabled uppercase tracking-wider mb-1">
						Password
					</label>
					<div className="flex items-center">
						<input
							type={showPassword ? 'text' : 'password'}
							value={formData.password}
							onChange={(e) =>
								setFormData({
									...formData,
									password: e.target.value,
								})
							}
							placeholder="**********"
							className="w-full outline-none text-dark font-medium placeholder-uiDisabled/50 bg-transparent"
							required
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

				{/* Remember & Forgot */}
				<div className="flex items-center justify-between text-sm pt-2">
					<label className="flex items-center cursor-pointer">
						<input
							type="checkbox"
							className="w-4 h-4 text-purple border-uiDisabled/30 rounded focus:ring-purple"
							// 2. Прив'язуємо чекбокс до стейту
							checked={formData.rememberMe}
							onChange={(e) =>
								setFormData({
									...formData,
									rememberMe: e.target.checked,
								})
							}
						/>
						<span className="ml-2 text-uiDisabled underline hover:text-purple transition-colors">
							Remember Me
						</span>
					</label>
					<a
						href="#"
						className="text-uiDisabled underline hover:text-purple transition-colors"
					>
						Forgot Password?
					</a>
				</div>

				{/* Gradient Button */}
				<button className="w-full py-4 rounded text-light font-bold text-lg uppercase tracking-wider bg-gradient-btn hover:bg-gradient-btn-hover transition-all duration-300 shadow-lg transform hover:scale-[1.02]">
					Log In
				</button>
			</form>
		</div>
	);
};

export default LoginForm;
