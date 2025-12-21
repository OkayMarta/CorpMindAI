const jwt = require('jsonwebtoken');
require('dotenv').config();

function jwtGenerator(user_id, expiresIn = '1h') {
	const payload = {
		user: {
			id: user_id,
		},
	};

	// Використовуємо переданий час
	return jwt.sign(payload, process.env.JWT_SECRET || 'secretkey123', {
		expiresIn,
	});
}

module.exports = jwtGenerator;
