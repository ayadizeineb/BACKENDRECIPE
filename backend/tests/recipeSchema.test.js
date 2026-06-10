const mongoose = require('mongoose');
const Recipe = require('../models/recipeschema');

describe('Recipe Schema Validation', () => {
  it('should validate correctly with valid fields', () => {
    const recipeData = {
      title: 'Valid Title',
      description: 'Valid Description',
      ingredients: ['Ingredient 1'],
      instructions: ['Step 1'],
      category: 'Breakfast',
      difficulty: 'Easy',
      prepTimeMinutes: 45,
      cookTime: 15,
      tags: ['Vegetarian', 'Vegan'],
    };

    const recipe = new Recipe(recipeData);
    const error = recipe.validateSync();
    expect(error).toBeUndefined();
  });

  it('should fail validation if tag is not predefined', () => {
    const recipeData = {
      title: 'Valid Title',
      description: 'Valid Description',
      ingredients: ['Ingredient 1'],
      instructions: ['Step 1'],
      tags: ['NotARealTag'],
    };

    const recipe = new Recipe(recipeData);
    const error = recipe.validateSync();
    expect(error).toBeDefined();
    const hasTagError = Object.keys(error.errors).some(key => key.startsWith('tags'));
    expect(hasTagError).toBe(true);
  });

  it('should fail validation if required fields are missing', () => {
    const recipe = new Recipe({
      title: undefined,
      description: undefined,
      ingredients: null,
      instructions: null,
    });
    const error = recipe.validateSync();
    expect(error).toBeDefined();
    expect(error.errors['title']).toBeDefined();
    expect(error.errors['description']).toBeDefined();
    expect(error.errors['ingredients']).toBeDefined();
    expect(error.errors['instructions']).toBeDefined();
  });
});
