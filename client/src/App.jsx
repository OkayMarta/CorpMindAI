import { useEffect, useState } from 'react';

function App() {
	const [status, setStatus] = useState('Loading...');

	useEffect(() => {
		// Пробуємо достукатись до сервера
		fetch('http://localhost:5000/api/health')
			.then((res) => res.json())
			.then((data) =>
				setStatus(data.message + ' | DB Time: ' + data.db_time)
			)
			.catch((err) => setStatus('Error connecting to server'));
	}, []);

	return (
		<div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
			<div className="text-center">
				<h1 className="text-4xl font-bold mb-4 text-blue-500">
					CorpMind Setup
				</h1>
				<p className="text-xl">Status: {status}</p>
			</div>
		</div>
	);
}

export default App;
