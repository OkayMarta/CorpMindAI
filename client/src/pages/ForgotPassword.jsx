import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { toast } from 'react-toastify';
import logo from '/logoCropped.svg';

// UI
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ForgotPassword = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			await authService.forgotPassword(email);
			toast.success('Check your email for the reset link!');
		} catch (err) {
			toast.error(err.response?.data || 'Error sending email');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-dark font-sans flex flex-col">
			<div className="flex-grow w-full py-6 md:pt-10">
				<div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
					{/* 1. ЛІВА ЧАСТИНА: Логотип */}
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

					{/* 2. ЦЕНТРАЛЬНА ЧАСТИНА: Картка */}
					<main className="w-full md:w-auto flex justify-center z-10">
						<div className="bg-light p-6 md:p-12 rounded shadow-2xl w-full max-w-[550px] text-center">
							<h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">
								Reset Password
							</h2>
							<p className="text-uiDisabled text-sm mb-6 md:mb-8">
								Enter your email and we'll send you a link to
								reset your password.
							</p>

							<form
								onSubmit={handleSubmit}
								className="space-y-5 md:space-y-6 text-left"
							>
								<Input
									label="EMAIL ADDRESS"
									type="email"
									placeholder="johndoe@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>

								<Button
									type="submit"
									isLoading={loading}
									className="w-full py-3 md:py-4 text-lg uppercase tracking-wider"
								>
									Send Reset Link
								</Button>
							</form>

							<button
								onClick={() => navigate('/login')}
								className="mt-6 text-sm text-uiDisabled underline hover:text-purple transition-colors"
							>
								Back to Login
							</button>
						</div>
					</main>

					{/* 3. ПРАВА ЧАСТИНА */}
					<div className="hidden md:block w-full md:w-auto md:flex-1"></div>
				</div>
			</div>

			<footer className="w-full text-center text-light text-xs py-4 md:py-6 bg-dark z-20">
				&copy; 2025 All Rights Reserved. CorpMindAI
			</footer>
		</div>
	);
};

export default ForgotPassword;
