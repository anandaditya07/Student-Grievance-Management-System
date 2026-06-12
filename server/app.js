// ===== Grievance Management System — Express Server =====
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const grievanceRoutes = require('./routes/grievanceRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ===========================
// Security Middleware
// ===========================

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for frontend
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ===========================
// Static File Serving
// ===========================

// Serve frontend files from the project root
app.use(express.static(path.join(__dirname, '..')));

// ===========================
// API Routes
// ===========================

app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);

// ===========================
// Health Check
// ===========================

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ===========================
// 404 Handler
// ===========================

app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// ===========================
// Global Error Handler
// ===========================

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// ===========================
// Start Server
// ===========================

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║   Grievance Management System             ║
  ║   Server running on port ${PORT}              ║
  ║   http://localhost:${PORT}                    ║
  ╚═══════════════════════════════════════════╝
  `);
});

module.exports = app;
