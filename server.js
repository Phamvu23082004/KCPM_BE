require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const responseHandler = require('./src/middlewares/responseHandler');
const errorHandler = require('./src/middlewares/errorHandler');
const routes = require('./src/routes');

const app = express();

// Middleware: Parse body
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware: Response handler (phải trước routes để res.success() có sẵn)
app.use(responseHandler);

// Connect to MongoDB
connectDB();

// Routes
app.use('/api', routes);

// Health check root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Backend API' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server is running on http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV}`);
});
