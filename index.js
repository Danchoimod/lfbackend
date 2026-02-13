require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./src/routes');
const errorHandler = require('./src/middlewares/errorHandler');
const AppError = require('./src/exceptions/AppError');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route documentation/welcome
app.get('/', (req, res) => {
    res.json({ message: 'LF Backend Server is running', api_base: '/api' });
});

// Routes
app.use('/api', apiRoutes);

// Handle undefined routes
app.all('*path', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${ENV} mode`);
});
