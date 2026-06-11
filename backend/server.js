const express = require('express');
const app = express();
const connectDB = require('./config/connectiondb');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();
const errorHandler = require('./middleware/errorHandler');
const apiLimiter = require('./middleware/rateLimiter');
const Recipe = require('./models/recipeschema');
const redis = require('./config/redis');
// Give Redis a moment to connect before pinging
setTimeout(async () => {
  try {
    await redis.ping();
    console.log('[Cache] Redis connected successfully');
  } catch (err) {
    console.warn('[Cache] Redis unavailable, running without cache:', err.message);
  }
}, 1000);
const PORT = process.env.PORT || 3000;
const recipeRoutes = require('./routes/recipe');
const userRoutes = require('./routes/UserRoute');
const aiRoutes = require('./routes/ai');

// Validate essential environment variables
const requiredEnv = ['SECRET_KEY', 'MONGO_URI'];
const missingEnv = requiredEnv.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
  console.error('Missing required environment variables:', missingEnv.join(', '));
  process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY not set — AI features will be disabled.');
}


// Secure CORS
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/', apiLimiter);
app.use('/api/ai', aiRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => res.send('Hello, world!'));
app.get('/api/recipes/ping', (req, res) => res.json({ ping: 'ok' }));

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    // Redis — non-fatal if unavailable
    try {
      await redis.ping();
      console.log('[Cache] Redis connected successfully');
    } catch (err) {
      console.warn('[Cache] Redis unavailable, running without cache:', err.message);
    }

    await Recipe.seedIfEmpty();
    const count = await Recipe.countDocuments();
    console.log('Current recipe count after seeding:', count);

    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();