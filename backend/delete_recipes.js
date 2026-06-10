const mongoose = require('mongoose');
require('dotenv').config();
const Recipe = require('./models/recipeschema');
const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/recipe-app';

mongoose.connect(uri)
  .then(async () => {
    console.log('✅ Connected to DB');
    const result = await Recipe.deleteMany({});
    console.log('🗑️ Deleted recipes count:', result.deletedCount);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection error:', err);
    process.exit(1);
  });
