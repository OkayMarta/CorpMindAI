import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 5, className = '' }) => {
	return (
		<Loader2 className={`animate-spin w-${size} h-${size} ${className}`} />
	);
};

export default Spinner;
