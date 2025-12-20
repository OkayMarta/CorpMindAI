require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Налаштування бази даних
const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
});

// Тестовий роут
app.get('/api/health', async (req, res) => {
	try {
		const result = await pool.query('SELECT NOW()');
		res.json({
			status: 'OK',
			message: 'Server is running',
			db_time: result.rows[0].now,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ status: 'Error', error: err.message });
	}
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
