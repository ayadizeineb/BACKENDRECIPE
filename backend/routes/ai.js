const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth'); // optional auth
const Recipe = require('../models/recipeschema');
const { getAIResponse, generateRecipesFromIngredients } = require('../utils/openai');

/**
 * POST /assist
 * Body: { recipeId, prompt }
 * Returns AI generated text.
 */
router.post('/assist', async (req, res) => {
  const { recipeId, prompt } = req.body;
  if (!recipeId || !prompt) {
    return res.status(400).json({ message: 'recipeId and prompt are required' });
  }
  try {
    const recipe = await Recipe.findById(recipeId).lean();
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    const fullPrompt = `You are an AI cooking assistant. The user provided the following recipe data:\n\nTitle: ${recipe.title}\nDescription: ${recipe.description}\nIngredients: ${recipe.ingredients.join(', ')}\nInstructions: ${recipe.instructions.join('\n')}\n\nUser question: ${prompt}\n\nProvide a helpful, concise answer.`;
    const aiResult = await getAIResponse(fullPrompt);
    res.json({ success: true, answer: aiResult });
  } catch (err) {
    console.error('AI assist error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * POST /suggest-recipes
 * Body: { ingredients }
 * Returns OpenAI generated recipe suggestions.
 */
router.post('/suggest-recipes', async (req, res) => {
  const { ingredients } = req.body;
  if (!ingredients) {
    return res.status(400).json({ message: 'Ingredients are required' });
  }
  try {
    const suggestions = await generateRecipesFromIngredients(ingredients);
    res.json({ success: true, recipes: suggestions });
  } catch (err) {
    console.error('AI suggest error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
