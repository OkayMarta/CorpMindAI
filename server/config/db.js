const Pool = require('pg').Pool;
require('dotenv').config();

console.log('CHECKING DB CREDENTIALS:');
console.log(`User: ${process.env.DB_USER}`);
console.log(`Pass: ${process.env.DB_PASSWORD}`);
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`Port: ${process.env.DB_PORT}`);
console.log(`DB Name: ${process.env.DB_NAME}`);

const pool = new Pool({
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	database: process.env.DB_NAME,
});

module.exports = pool;
