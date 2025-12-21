const jwt = require('jsonwebtoken');
require('dotenv').config();

function jwtGenerator(user_id) {
	const payload = {
		user: {
			id: user_id,
		},
	};

	// токен живе 1 год
	return jwt.sign(payload, process.env.JWT_SECRET || 'secretkey123', {
		expiresIn: '1h',
	});
}

module.exports = jwtGenerator;
