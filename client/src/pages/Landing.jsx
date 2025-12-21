import { useNavigate } from 'react-router-dom';
import logo from '/logoCropped.svg';

const Landing = () => {
	const navigate = useNavigate();

	return (
		<div className="h-screen bg-dark text-white relative flex flex-col overflow-hidden font-sans">
			{/* HEADER: Логотип */}
			<header className="w-full max-w-[1600px] mx-auto px-6 md:px-10 pt-6 md:pt-10 flex justify-between items-center z-20">
				<div className="cursor-pointer">
					<img
						src={logo}
						alt="CorpMind AI"
						className="w-24 md:w-32 h-auto"
					/>
				</div>
			</header>

			{/* MAIN CONTENT: Центрування по вертикалі та горизонталі */}
			<main className="flex-grow flex flex-col justify-center items-center text-center z-10 px-6">
				{/* Main Title */}
				<h1 className="text-5xl md:text-7xl font-medium mb-6 tracking-tight text-light">
					CorpMind<span className="text-gold">AI</span>
				</h1>

				{/* Subtitle */}
				<p className="text-lg md:text-xl text-light-400 max-w-2xl mb-12 leading-relaxed font-light">
					Stop searching. Just ask. Instant answers from your
					corporate archives via a secure, personalized AI interface.
				</p>

				{/* Gradient Button */}
				<button
					onClick={() => navigate('/login')}
					className="px-10 py-3 rounded-[4px] text-base md:text-lg font-semibold text-white uppercase tracking-wider bg-gradient-btn hover:bg-gradient-btn-hover transform hover:scale-105 transition duration-300 ease-in-out shadow-lg"
				>
					Get Started
				</button>
			</main>

			{/* FOOTER */}
			<footer className="w-full text-center text-light text-xs py-6 z-10 bg-dark">
				&copy; 2025 All Rights Reserved. CorpMindAI
			</footer>
		</div>
	);
};

export default Landing;
