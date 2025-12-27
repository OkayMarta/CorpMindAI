import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../../services/auth';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';
import { handleError } from '../../../utils/errorHandler';

// Імпорт UI
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const LoginForm = () => {
	const { login } = useAuth();
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		email: '',
		password: '',
		rememberMe: false,
	});
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			const data = await authService.login(formData);
			login(data.token);
			toast.success('Welcome back!');
			navigate('/dashboard');
		} catch (err) {
			handleError(err, 'Invalid credentials');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="bg-light p-6 md:p-12 rounded shadow-2xl w-full max-w-[550px] text-center">
			<h2 className="text-2xl md:text-3xl font-bold text-dark mb-2">
				Log In to CorpMind<span className="text-gold">AI</span>
			</h2>
			<p className="text-uiDisabled text-sm mb-6">
				Enter your credentials to access your workspace
			</p>

			<form onSubmit={handleSubmit} className="space-y-5 text-left">
				<Input
					type="email"
					label="EMAIL ADDRESS"
					placeholder="johndoe@example.com"
					value={formData.email}
					onChange={(e) =>
						setFormData({ ...formData, email: e.target.value })
					}
					required
					className="bg-transparent"
				/>

				<Input
					type={showPassword ? 'text' : 'password'}
					label="PASSWORD"
					placeholder="**********"
					value={formData.password}
					onChange={(e) =>
						setFormData({ ...formData, password: e.target.value })
					}
					required
					rightIcon={showPassword ? EyeOff : Eye}
					onRightIconClick={() => setShowPassword(!showPassword)}
				/>

				<div className="flex items-center justify-between text-sm pt-1">
					<label className="flex items-center cursor-pointer">
						<input
							type="checkbox"
							className="w-4 h-4 text-purple border-gray-300 rounded focus:ring-purple"
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
					<Link
						to="/forgot-password"
						className="text-uiDisabled underline hover:text-purple transition-colors"
					>
						Forgot Password?
					</Link>
				</div>

				<Button
					type="submit"
					className="w-full py-4 text-lg uppercase tracking-wider"
					isLoading={isLoading}
				>
					Log In
				</Button>
			</form>
		</div>
	);
};

export default LoginForm;
