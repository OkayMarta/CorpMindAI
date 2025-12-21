require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// Підключаємо файл з роутами
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/workspaces', require('./routes/workspace.routes'));

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
