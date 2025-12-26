import React from 'react';

const Avatar = ({ url, name, size = 'w-10 h-10', textSize = 'text-sm' }) => {
	if (url) {
		return (
			<img
				src={url}
				alt={name || 'User'}
				className={`${size} rounded-full object-cover border border-gray-700`}
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
