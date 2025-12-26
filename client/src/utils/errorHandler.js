import { toast } from 'react-toastify';

export const handleError = (error, defaultMessage = 'Something went wrong') => {
	console.error(error);

	const message = error.response?.data || defaultMessage;

	if (typeof message === 'object') {
		toast.error(message.message || JSON.stringify(message));
	} else {
		toast.error(message);
	}
};
