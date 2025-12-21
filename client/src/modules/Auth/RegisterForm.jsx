import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';

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
		<div className="bg-light p-10 md:p-12 rounded shadow-2xl w-full max-w-[550px] text-center">
			{/* Title */}
			<h2 className="text-2xl md:text-3xl font-bold text-dark mb-2">
				Create Account
			</h2>
			<p className="text-uiDisabled text-sm mb-8">
				Join CorpMind<span className="text-gold font-bold">AI</span> and
				start collaborating
			</p>

			<form onSubmit={handleSubmit} className="space-y-5 text-left">
				<div className="relative border border-uiDisabled/30 rounded px-3 py-2.5 focus-within:border-blue transition-colors">
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

				<div className="relative border border-uiDisabled/30 rounded px-3 py-2.5 focus-within:border-blue transition-colors">
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

				<div className="relative border border-uiDisabled/30 rounded px-3 py-2.5 focus-within:border-blue transition-colors">
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
				<div className="flex items-start text-xs md:text-sm py-2">
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

				<button className="w-full py-3.5 rounded text-light font-bold text-lg uppercase tracking-wider bg-gradient-btn hover:bg-gradient-btn-hover transition-all duration-300 shadow-lg transform hover:scale-[1.02]">
					Sign Up
				</button>
			</form>
		</div>
	);
};

export default RegisterForm;
