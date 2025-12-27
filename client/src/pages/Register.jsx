import { useNavigate } from 'react-router-dom';
import RegisterForm from '../features/auth/components/RegisterForm';
import logo from '/logoCropped.svg';

const Register = () => {
	const navigate = useNavigate();

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

					{/* 2. ЦЕНТРАЛЬНА ЧАСТИНА: Картка реєстрації */}
					<main className="w-full md:w-auto flex justify-center z-10">
						<RegisterForm />
					</main>

					{/* 3. ПРАВА ЧАСТИНА: Кнопка Log In */}
					<div className="w-full md:w-auto md:flex-1 flex justify-center md:justify-end mt-8 md:mt-0 md:order-last">
						<button
							onClick={() => navigate('/login')}
							className="btn-outlined"
						>
							Log In
						</button>
					</div>
				</div>
			</div>

			{/* Footer */}
			<footer className="w-full text-center text-light text-xs py-4 md:py-6 bg-dark z-20">
				&copy; 2025 All Rights Reserved. CorpMindAI
			</footer>
		</div>
	);
};

export default Register;
