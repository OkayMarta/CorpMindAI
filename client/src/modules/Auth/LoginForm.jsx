import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';

const LoginForm = () => {
	const { loginUser } = useAuth();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({ email: '', password: '' });
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const data = await authService.login(formData);
			loginUser(data.token);
			toast.success('Welcome back!');
			navigate('/dashboard');
		} catch (err) {
			toast.error(err.response?.data || 'Invalid credentials');
		}
	};

	return (
		<div className="bg-light p-10 md:p-12 rounded shadow-2xl w-full max-w-[550px] text-center">
			{/* Title */}
			<h2 className="text-3xl font-bold text-textMain mb-2">
				Log In to CorpMind AI
			</h2>
			<p className="text-uiDisabled-500 text-sm mb-8">
				Enter your credentials to access your workspace
			</p>

			<form onSubmit={handleSubmit} className="space-y-6 text-left">
				{/* Email Input */}
				<div className="relative border border-uiDisabled-300 rounded px-3 py-2 focus-within:border-blue-600 transition-colors">
					<label className="block text-[10px] font-bold text-uiDisabled-500 uppercase tracking-wider mb-1">
						Email Address
					</label>
					<input
						type="email"
						value={formData.email}
						onChange={(e) =>
							setFormData({ ...formData, email: e.target.value })
						}
						placeholder="johndoe@example.com"
						className="w-full outline-none text-textMain font-medium placeholder-uiDisabled-300"
						required
					/>
				</div>

				{/* Password Input */}
				<div className="relative border border-uiDisabled-300 rounded px-3 py-2 focus-within:border-blue-600 transition-colors">
					<label className="block text-[10px] font-bold text-uiDisabled-500 uppercase tracking-wider mb-1">
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
							className="w-full outline-none text-textMain font-medium placeholder-uiDisabled-300"
							required
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="text-uiDisabled-400 hover:text-uiDisabled-600"
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
				<div className="flex items-center justify-between text-sm">
					<label className="flex items-center cursor-pointer">
						<input
							type="checkbox"
							className="w-4 h-4 text-blue-600 border-uiDisabled-300 rounded focus:ring-blue-500"
						/>
						<span className="ml-2 text-uiDisabled-600 underline">
							Remember Me
						</span>
					</label>
					<a
						href="#"
						className="text-uiDisabled-600 underline hover:text-blue-600"
					>
						Forgot Password?
					</a>
				</div>

				{/* Gradient Button */}
				<button className="w-full py-3 rounded text-light font-bold text-lg uppercase tracking-wider bg-gradient-btn hover:bg-gradient-btn-hover transition-all duration-300 shadow-lg transform hover:scale-[1.02]">
					Log In
				</button>
			</form>

			{/* Social Login Section */}
			<div className="mt-5">
				<div className="relative flex py-3 items-center">
					<div className="flex-grow border-t border-uiDisabled-200"></div>
					<span className="flex-shrink-0 mx-4 text-uiDisabled-400 text-sm uppercase tracking-widest">
						OR USE
					</span>
					<div className="flex-grow border-t border-uiDisabled-200"></div>
				</div>

				<div className="flex justify-center gap-4 mt-2">
					<SocialButton icon={<GoogleIcon />} />
					<SocialButton icon={<AppleIcon />} />
					<SocialButton icon={<FacebookIcon />} />
				</div>
			</div>
		</div>
	);
};

// --- Sub-components for Social Icons ---
const SocialButton = ({ icon }) => (
	<button className="w-12 h-12 flex items-center justify-center border border-uiDisabled-200 rounded hover:bg-uiDisabled-50 transition shadow-sm">
		{icon}
	</button>
);

const GoogleIcon = () => (
	<svg className="w-6 h-6" viewBox="0 0 24 24">
		<path
			fill="#EA4335"
			d="M24 12.276c0-.816-.073-1.6-.21-2.364H12v4.473h6.728c-.29 1.545-1.163 2.854-2.48 3.736v3.107h4.018c2.35-2.164 3.704-5.352 3.704-9.952z"
		/>
		<path
			fill="#34A853"
			d="M12 24c3.24 0 5.957-1.074 7.942-2.906l-4.018-3.107c-1.075.72-2.45 1.146-3.924 1.146-3.125 0-5.772-2.112-6.72-4.953H1.238v3.11C3.21 21.196 7.294 24 12 24z"
		/>
		<path
			fill="#FBBC05"
			d="M5.28 14.18c-.24-.72-.377-1.488-.377-2.18s.137-1.46.377-2.18V6.71H1.238C.448 8.28 0 10.07 0 12s.448 3.72 1.238 5.29l4.042-3.11z"
		/>
		<path
			fill="#4285F4"
			d="M12 4.773c1.76 0 3.34.605 4.593 1.8l3.435-3.436C17.954 1.127 15.238 0 12 0 7.294 0 3.21 2.804 1.238 6.71L5.28 9.82c.948-2.84 3.595-4.952 6.72-4.952z"
		/>
	</svg>
);

const FacebookIcon = () => (
	<svg className="w-6 h-6 text-blue-600 fill-current" viewBox="0 0 24 24">
		<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
	</svg>
);

const AppleIcon = () => (
	<svg className="w-6 h-6 text-black fill-current" viewBox="0 0 24 24">
		<path d="M17.05 20.28c-.98.95-2.05.88-3.08.47-1.07-.42-2.0-.48-3.13.0-1.05.49-2.15.55-3.08-.47-2.31-2.5-2.85-7.46.22-10.46 1.48-1.45 4.09-1.39 5.37.07.65.74 1.48.9 2.15.9.72 0 1.95-.45 2.55-.9 1.76-1.35 3.39-.75 4.35.6-3.8 1.9-3.2 6.85.15 8.15-.35 1.1-.95 2.1-1.5 2.6zM13.03 5.4C13.63 2.5 16.53.6 19 .2c.35 2.95-2.55 5.8-5.97 5.2z" />
	</svg>
);

export default LoginForm;
