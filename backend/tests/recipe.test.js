const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

// Mock auth middleware to bypass token verification in testing
jest.mock('../middleware/auth', () => (req, res, next) => {
  req.user = { id: 'mockUserId123' };
  next();
});

// Mock Recipe model
const Recipe = require('../models/recipeschema');
jest.mock('../models/recipeschema');

const recipeRouter = require('../routes/recipe');

const app = express();
app.use(express.json());
app.use('/api/recipes', recipeRouter);

describe('Recipe Controller Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/recipes/:id', () => {
    it('should return 200 and the recipe with populated comments if found', async () => {
      const mockRecipe = {
        _id: 'recipe123',
        title: 'Delicious Tacos',
        description: 'Amazing street tacos',
        ingredients: ['Beef', 'Tortilla'],
        instructions: ['Cook beef', 'Assemble'],
        comments: [
          {
            _id: 'comment123',
            userId: { _id: 'mockUserId123', username: 'testuser' },
            text: 'So tasty!',
            date: new Date()
          }
        ]
      };

      // Mock findById chain with populate
      Recipe.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockRecipe)
      });

      const res = await request(app).get('/api/recipes/recipe123');

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Delicious Tacos');
      expect(res.body.comments[0].text).toBe('So tasty!');
      expect(res.body.comments[0].userId.username).toBe('testuser');
    });

    it('should return 404 if recipe not found', async () => {
      Recipe.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      const res = await request(app).get('/api/recipes/missing123');
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Recipe not found');
    });
  });

  describe('POST /api/recipes/:id/comment', () => {
    it('should add comment and return populated new comment', async () => {
      const mockRecipe = {
        _id: 'recipe123',
        comments: [],
        save: jest.fn().mockResolvedValue(true)
      };

      const mockPopulatedRecipe = {
        comments: [
          {
            _id: 'comment999',
            userId: { _id: 'mockUserId123', username: 'chefjohn' },
            text: 'First comment!',
            date: new Date()
          }
        ]
      };

      Recipe.findById
        .mockReturnValueOnce(mockRecipe) // For first findById before save
        .mockReturnValueOnce({
          populate: jest.fn().mockResolvedValue(mockPopulatedRecipe) // For second findById with populate
        });

      const res = await request(app)
        .post('/api/recipes/recipe123/comment')
        .send({ text: 'First comment!' });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Comment added');
      expect(res.body.comment.text).toBe('First comment!');
      expect(res.body.comment.userId.username).toBe('chefjohn');
    });
  });

  describe('DELETE /api/recipes/:id/comment/:commentId', () => {
    it('should delete own comment successfully', async () => {
      const mockComment = {
        _id: 'comment123',
        userId: 'mockUserId123', // Matches auth mockUserId123
        text: 'My comment'
      };

      const mockRecipe = {
        _id: 'recipe123',
        comments: {
          id: jest.fn().mockReturnValue(mockComment),
          pull: jest.fn()
        },
        save: jest.fn().mockResolvedValue(true)
      };

      Recipe.findById.mockResolvedValue(mockRecipe);

      const res = await request(app).delete('/api/recipes/recipe123/comment/comment123');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Comment deleted');
      expect(mockRecipe.comments.pull).toHaveBeenCalledWith('comment123');
      expect(mockRecipe.save).toHaveBeenCalled();
    });

    it('should forbid deleting another user\'s comment', async () => {
      const mockComment = {
        _id: 'comment123',
        userId: 'otherUser456', // Does not match auth mockUserId123
        text: 'Other comment'
      };

      const mockRecipe = {
        _id: 'recipe123',
        comments: {
          id: jest.fn().mockReturnValue(mockComment)
        }
      };

      Recipe.findById.mockResolvedValue(mockRecipe);

      const res = await request(app).delete('/api/recipes/recipe123/comment/comment123');

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Not authorized to delete this comment');
    });
  });
});
