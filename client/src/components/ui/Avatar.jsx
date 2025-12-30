const Avatar = ({ url, name, size = 'w-10 h-10', textSize = 'text-sm' }) => {
	// 1. Отримуємо токен
	const token = localStorage.getItem('token');

	if (url) {
		// 2. Витягуємо ім'я файлу зі шляху
		const filename = url.split(/[/\\]/).pop();

		// 3. Формуємо новий URL
		const secureUrl = `/api/users/avatar/${filename}?token=${token}`;

		return (
			<img
				src={secureUrl}
				alt={name || 'User'}
				className={`${size} rounded-full object-cover border border-gray-700`}
				onError={(e) => {
					e.target.style.display = 'none';
				}}
			/>
		);
	}

	const initials = name ? name.substring(0, 2).toUpperCase() : 'UR';

	return (
		<div
			className={`${size} rounded-full bg-gradient-btn flex items-center justify-center text-light font-bold ${textSize} shadow-md border border-gray-700`}
		>
			{initials}
		</div>
	);
};

export default Avatar;
