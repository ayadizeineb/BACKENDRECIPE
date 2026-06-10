const express = require('express');
const router = express.Router();
const { login, logout, refreshAccess, getProfile } = require('../controllers/authController');
const verifyToken = require('../middleware/auth');

// Login endpoint
router.post('/login', login);

// Logout endpoint (requires token)
router.post('/logout', verifyToken, logout);

// Refresh token endpoint
router.post('/refresh', refreshAccess);

// Profile endpoint (protected)
router.get('/profile', verifyToken, getProfile);

module.exports = router;
