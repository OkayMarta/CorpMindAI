import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services/auth';
import { toast } from 'react-toastify';
import logo from '/logoCropped.svg';
import { Eye, EyeOff } from 'lucide-react';

// UI
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ResetPassword = () => {
	const { token } = useParams();
	const navigate = useNavigate();
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			await authService.resetPassword(token, password);
			toast.success('Password updated! Please login.');
			navigate('/login');
		} catch (err) {
			toast.error(err.response?.data || 'Invalid or expired token');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-dark font-sans flex flex-col">
			<div className="flex-grow w-full py-6 md:pt-10">
				<div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
					{/* 1. Логотип */}
					<div className="w-full md:w-auto md:flex-1 flex justify-center md:justify-start">
						<div
							onClick={() => navigate('/')}
							className="cursor-pointer hover:opacity-80 transition"
						>
							<img
								src={logo}
								alt="CorpMind AI"
								className="w-24 md:w-32"
							/>
						</div>
					</div>

					{/* 2. Картка */}
					<main className="w-full md:w-auto flex justify-center z-10">
						<div className="bg-light p-6 md:p-12 rounded shadow-2xl w-full max-w-[550px] text-center">
							<h2 className="text-2xl md:text-3xl font-bold text-dark mb-6 md:mb-8">
								Set New Password
							</h2>

							<form
								onSubmit={handleSubmit}
								className="space-y-5 md:space-y-6 text-left"
							>
								<Input
									label="NEW PASSWORD"
									type={showPassword ? 'text' : 'password'}
									placeholder="**********"
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									required
									rightIcon={showPassword ? EyeOff : Eye}
									onRightIconClick={() =>
										setShowPassword(!showPassword)
									}
								/>

								<Button
									type="submit"
									isLoading={loading}
									className="w-full py-3 md:py-4 text-lg uppercase tracking-wider"
								>
									Update Password
								</Button>
							</form>
						</div>
					</main>

					{/* 3. Пустий блок */}
					<div className="hidden md:block w-full md:w-auto md:flex-1"></div>
				</div>
			</div>

			<footer className="w-full text-center text-light text-xs py-4 md:py-6 bg-dark z-20">
				&copy; 2025 All Rights Reserved. CorpMindAI
			</footer>
		</div>
	);
};

export default ResetPassword;
