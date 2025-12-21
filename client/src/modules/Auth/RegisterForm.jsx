import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaGithub } from 'react-icons/fa';

const RegisterForm = () => {
	const { loginUser } = useAuth();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		email: '',
		nickname: '',
		password: '',
	});
	const [showPassword, setShowPassword] = useState(false);

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
		// ЗМІНА 1: Зменшив padding з p-12 до p-6 md:p-8
		<div className="bg-light p-6 md:p-8 rounded shadow-2xl w-full max-w-[550px] text-center">
			{/* Title */}
			<h2 className="text-2xl md:text-3xl font-bold text-dark mb-1">
				Create Account
			</h2>
			{/* ЗМІНА 2: Зменшив mb-8 до mb-5 */}
			<p className="text-uiDisabled text-sm mb-5">
				Join CorpMind<span className="text-gold font-bold">AI</span> and
				start collaborating
			</p>

			{/* ЗМІНА 3: Зменшив space-y-5 до space-y-3 (відстань між полями) */}
			<form onSubmit={handleSubmit} className="space-y-3 text-left">
				{/* Email Input */}
				<div className="relative border border-uiDisabled/30 rounded px-3 py-1.5 focus-within:border-blue transition-colors">
					<label className="block text-[10px] font-bold text-uiDisabled uppercase tracking-wider mb-0.5">
						Email Address
					</label>
					<input
						type="email"
						placeholder="johndoe@example.com"
						className="w-full outline-none text-dark font-medium placeholder-uiDisabled/50 bg-transparent text-sm"
						required
						onChange={(e) =>
							setFormData({ ...formData, email: e.target.value })
						}
					/>
				</div>

				{/* Nickname Input */}
				<div className="relative border border-uiDisabled/30 rounded px-3 py-1.5 focus-within:border-blue transition-colors">
					<label className="block text-[10px] font-bold text-uiDisabled uppercase tracking-wider mb-0.5">
						Nickname
					</label>
					<input
						type="text"
						placeholder="SuperUser123"
						className="w-full outline-none text-dark font-medium placeholder-uiDisabled/50 bg-transparent text-sm"
						required
						onChange={(e) =>
							setFormData({
								...formData,
								nickname: e.target.value,
							})
						}
					/>
				</div>

				{/* Password Input */}
				<div className="relative border border-uiDisabled/30 rounded px-3 py-1.5 focus-within:border-blue transition-colors">
					<label className="block text-[10px] font-bold text-uiDisabled uppercase tracking-wider mb-0.5">
						Password
					</label>
					<div className="flex items-center">
						<input
							type={showPassword ? 'text' : 'password'}
							placeholder="**********"
							className="w-full outline-none text-dark font-medium placeholder-uiDisabled/50 bg-transparent text-sm"
							required
							onChange={(e) =>
								setFormData({
									...formData,
									password: e.target.value,
								})
							}
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="text-uiDisabled hover:text-dark transition-colors"
						>
							{showPassword ? (
								<EyeOff size={18} />
							) : (
								<Eye size={18} />
							)}
						</button>
					</div>
				</div>

				{/* Terms Checkbox */}
				<div className="flex items-start text-xs md:text-sm py-1">
					<label className="flex items-center cursor-pointer mt-0.5">
						<input
							type="checkbox"
							className="w-4 h-4 text-purple border-uiDisabled/30 rounded focus:ring-purple"
							required
						/>
					</label>
					<span className="ml-2 text-uiDisabled leading-tight">
						I agree to the{' '}
						<a href="#" className="underline hover:text-purple">
							Terms of Service
						</a>{' '}
						and{' '}
						<a href="#" className="underline hover:text-purple">
							Privacy Policy
						</a>
					</span>
				</div>

				{/* Gradient Button */}
				<button className="w-full py-3 rounded text-light font-bold text-lg uppercase tracking-wider bg-gradient-btn hover:bg-gradient-btn-hover transition-all duration-300 shadow-lg transform hover:scale-[1.02]">
					Sign Up
				</button>
			</form>

			{/* Social Section */}
			{/* ЗМІНА 4: Зменшив відступи mt-5 до mt-4 */}
			<div className="mt-4">
				<div className="relative flex py-2 items-center">
					<div className="flex-grow border-t border-uiDisabled/20"></div>
					<span className="flex-shrink-0 mx-3 text-uiDisabled text-[10px] uppercase tracking-widest">
						OR SIGN UP WITH
					</span>
					<div className="flex-grow border-t border-uiDisabled/20"></div>
				</div>

				<div className="flex justify-center gap-4 mt-2">
					<SocialButton>
						<FcGoogle size={22} />
					</SocialButton>
					<SocialButton>
						<FaGithub size={22} className="text-dark" />
					</SocialButton>
					<SocialButton>
						<FaFacebook size={22} className="text-[#1877F2]" />
					</SocialButton>
				</div>
			</div>
		</div>
	);
};

const SocialButton = ({ children }) => (
	<button className="w-10 h-10 flex items-center justify-center border border-uiDisabled/30 rounded hover:bg-uiDisabled/10 transition shadow-sm transform hover:scale-105">
		{children}
	</button>
);

export default RegisterForm;
