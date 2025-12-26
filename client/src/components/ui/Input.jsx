import React from 'react';

const Input = ({
	label,
	error,
	icon: Icon,
	rightIcon: RightIcon,
	onRightIconClick,
	className = '',
	type = 'text',
	variant = 'light',
	...props
}) => {
	const styles = {
		light: 'bg-transparent border-gray-300 text-dark placeholder-gray-400 focus:border-blue',
		dark: 'bg-dark border-gray-700 text-light placeholder-gray-500 focus:border-blue',
	};

	const currentStyle = error ? 'border-uiError' : styles[variant];

	return (
		<div className={`w-full ${className}`}>
			{label && (
				<label className="block text-gray-400 text-sm font-medium mb-2">
					{label}
				</label>
			)}

			<div className="relative">
				{Icon && (
					<div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
						<Icon className="w-5 h-5" />
					</div>
				)}

				<input
					type={type}
					className={`w-full border rounded-lg py-3 focus:outline-none transition-all 
                        ${Icon ? 'pl-10' : 'px-4'} 
                        ${RightIcon ? 'pr-10' : 'pr-4'}
                        ${error ? 'border-uiError' : ''}
                        ${
							!error
								? styles[variant]
								: 'bg-transparent text-inherit'
						}
                    `}
					{...props}
				/>

				{RightIcon && (
					<button
						type="button"
						onClick={onRightIconClick}
						className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 transition-colors ${
							onRightIconClick
								? 'hover:text-current cursor-pointer'
								: 'pointer-events-none'
						}`}
					>
						<RightIcon className="w-5 h-5" />
					</button>
				)}
			</div>

			{error && (
				<p className="text-uiError text-xs mt-1 font-medium">{error}</p>
			)}
		</div>
	);
};

export default Input;
