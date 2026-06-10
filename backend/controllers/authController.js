const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/UserSchema');
const RefreshToken = require('../models/RefreshToken');
const TokenBlacklist = require('../models/TokenBlacklist');
const Recipe = require('../models/recipeschema');
require('dotenv').config();

// Helper to generate JWT access token (1 week)
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.SECRET_KEY, { expiresIn: '1w' });
};

// Helper to generate random refresh token string
const generateRefreshTokenString = () => {
  return crypto.randomBytes(40).toString('hex');
};

// Register endpoint remains in UserController; here we handle login, logout, refresh, profile

// Login - returns access and refresh tokens
const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'All fields are required' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const bcrypt = require('bcrypt');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid password' });

    const accessToken = generateAccessToken(user._id);
    const refreshTokenString = generateRefreshTokenString();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days validity

    const refreshToken = new RefreshToken({ token: refreshTokenString, userId: user._id, expiresAt });
    await refreshToken.save();

    const userData = user.toObject();
    delete userData.password;
    return res.status(200).json({ token: accessToken, refreshToken: refreshTokenString, user: userData });
  } catch (err) {
    console.error('Login error:', err);
    return next(err);
  }
};

// Logout - blacklist access token and delete refresh token
const logout = async (req, res, next) => {
  const token = req.header('Authorization');
  let accessToken = token;
  if (accessToken && accessToken.startsWith('Bearer ')) {
    accessToken = accessToken.slice(7).trim();
  }
  const { refreshToken } = req.body;
  try {
    // Blacklist access token
    if (accessToken) {
      const decoded = jwt.decode(accessToken);
      const exp = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await TokenBlacklist.create({ token: accessToken, expiresAt: exp });
    }
    // Remove refresh token from DB
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return next(err);
  }
};

// Refresh access token using valid refresh token
const refreshAccess = async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });
  try {
    const stored = await RefreshToken.findOne({ token: refreshToken }).populate('userId');
    if (!stored) return res.status(401).json({ message: 'Invalid refresh token' });
    if (stored.expiresAt < new Date()) {
      await stored.remove();
      return res.status(401).json({ message: 'Refresh token expired' });
    }
    const newAccess = generateAccessToken(stored.userId._id);
    return res.status(200).json({ token: newAccess });
  } catch (err) {
    console.error('Refresh token error:', err);
    return next(err);
  }
};

// Profile endpoint – requires auth middleware (verifyToken)
const getProfile = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const recipes = await Recipe.find({ createdBy: userId });
    const recipeCount = recipes.length;
    const avgRating = recipes.reduce((acc, r) => acc + (r.averageRating || 0), 0) / (recipeCount || 1);
    return res.status(200).json({ user, stats: { recipeCount, avgRating } });
  } catch (err) {
    console.error('Profile error:', err);
    return next(err);
  }
};

module.exports = { login, logout, refreshAccess, getProfile };
