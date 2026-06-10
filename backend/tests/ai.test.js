const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

// Mock auth middleware to bypass token verification in testing
jest.mock('../middleware/auth', () => (req, res, next) => {
  req.user = { id: 'mockUserId123' };
  next();
});

// Mock OpenAI helper to avoid external API calls
jest.mock('../utils/openai', () => ({
  getAIResponse: jest.fn().mockResolvedValue('Mocked AI cooking advice'),
}));

// Mock Recipe model
const Recipe = require('../models/recipeschema');
jest.mock('../models/recipeschema');

const aiRouter = require('../routes/ai');

const app = express();
app.use(express.json());
app.use('/api/ai', aiRouter);

describe('AI Assistant Route', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return AI response when recipeId and prompt are valid', async () => {
    const mockRecipe = {
      _id: 'recipe123',
      title: 'Mock Recipe',
      description: 'Mock Description',
      ingredients: ['Ing 1'],
      instructions: ['Step 1'],
    };
    Recipe.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockRecipe),
    });

    const res = await request(app)
      .post('/api/ai/assist')
      .send({ recipeId: 'recipe123', prompt: 'How do I cook this?' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.answer).toBe('Mocked AI cooking advice');
  });

  it('should return 400 if recipeId or prompt is missing', async () => {
    const res = await request(app)
      .post('/api/ai/assist')
      .send({ prompt: 'How do I cook this?' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('recipeId and prompt are required');
  });

  it('should return 404 if recipe is not found', async () => {
    Recipe.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app)
      .post('/api/ai/assist')
      .send({ recipeId: 'recipe999', prompt: 'How do I cook this?' });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Recipe not found');
  });
});
