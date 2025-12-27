import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
	children,
	variant = 'primary', // primary | secondary | danger | ghost
	className = '',
	isLoading = false,
	disabled,
	type = 'button',
	...props
}) => {
	// Базові стилі для всіх кнопок
	const baseStyles =
		'px-6 py-2.5 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

	// Варіанти стилізації
	const variants = {
		primary:
			'bg-gradient-btn hover:bg-gradient-btn-hover text-light shadow-lg hover:shadow-blue/20',
		secondary:
			'bg-transparent border border-gray-600 text-gray-300 hover:text-light hover:border-gray-400 hover:bg-gray-800',
		danger: 'bg-transparent border border-uiError text-uiError hover:bg-uiError hover:text-light',
		ghost: 'bg-transparent text-gray-400 hover:text-light hover:bg-gray-800 border border-transparent',
	};

	return (
		<button
			type={type}
			className={`${baseStyles} ${variants[variant]} ${className}`}
			disabled={isLoading || disabled}
			{...props}
		>
			{isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
			{children}
		</button>
	);
};

export default Button;
