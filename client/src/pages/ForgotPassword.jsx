import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { toast } from 'react-toastify';
import logo from '/logoCropped.svg';

const ForgotPassword = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await authService.forgotPassword(email);
			toast.success('Check your email for the reset link!');
		} catch (err) {
			toast.error(err.response?.data || 'Error sending email');
		}
	};

	return (
		<div className="h-screen bg-dark font-sans overflow-hidden flex flex-col">
			{/* Фіксований відступ зверху, як на Login/Register */}
			<div className="flex-grow w-full pt-6 md:pt-10">
				{/* Головний контейнер сітки */}
				<div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-start gap-8">
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
						<div className="bg-light p-10 md:p-12 rounded shadow-2xl w-full max-w-[550px] text-center">
							<h2 className="text-2xl font-bold text-dark mb-4">
								Reset Password
							</h2>
							<p className="text-uiDisabled text-sm mb-8">
								Enter your email and we'll send you a link to
								reset your password.
							</p>

							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="relative border border-uiDisabled/30 rounded px-4 py-3 focus-within:border-blue transition-colors text-left">
									<label className="block text-[10px] font-bold text-uiDisabled uppercase tracking-wider mb-1">
										Email Address
									</label>
									<input
										type="email"
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										placeholder="johndoe@example.com"
										className="w-full outline-none text-dark font-medium placeholder-uiDisabled/50 bg-transparent"
										required
									/>
								</div>

								<button className="w-full py-3.5 rounded text-light font-bold uppercase tracking-wider bg-gradient-btn hover:bg-gradient-btn-hover transition-all shadow-lg transform hover:scale-[1.02]">
									Send Reset Link
								</button>
							</form>

							<button
								onClick={() => navigate('/login')}
								className="mt-6 text-sm text-uiDisabled underline hover:text-purple transition-colors"
							>
								Back to Login
							</button>
						</div>
					</main>

					{/* 3. ПРАВА ЧАСТИНА: Порожній блок для балансу */}
					<div className="w-full md:w-auto md:flex-1"></div>
				</div>
			</div>

			{/* Footer */}
			<footer className="w-full text-center text-light text-xs py-4 md:py-6 bg-dark z-20">
				&copy; 2025 All Rights Reserved. CorpMindAI
			</footer>
		</div>
	);
};

export default ForgotPassword;
