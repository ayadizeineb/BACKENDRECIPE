// backend/utils/openai.js
// Simple wrapper for OpenAI API calls (openai v6 SDK)
const OpenAI = require('openai');
require('dotenv').config();

// Create openai instance, but we will handle clean key verification safely
const apiKey = (process.env.OPENAI_API_KEY || '').trim();
const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key',
});

/**
 * Sends a prompt to OpenAI and returns the response text.
 * @param {string} prompt - The prompt to send.
 * @returns {Promise<string>} - The generated text.
 */
async function getAIResponse(prompt) {
  const rawApiKey = process.env.OPENAI_API_KEY;
  const cleanKey = rawApiKey ? rawApiKey.trim() : '';

  // Check if it's missing, is the default placeholder, or is invalid
  if (!cleanKey || cleanKey === 'your-openai-key-here' || cleanKey.startsWith('your-')) {
    console.log('Simulating AI Response because no valid API key is set.');
    const titleMatch = prompt.match(/Title:\s*(.+)/i);
    const title = titleMatch ? titleMatch[1].trim() : 'the recipe';
    return `[Simulated AI Assistant] Regarding "${title}": Since there is no valid OPENAI_API_KEY configured in the server's .env file, this is a simulated response. To prepare this recipe successfully, make sure to read the instructions carefully, check if you have all the ingredients ready, and cook with care! Let me know if you have any other questions.`;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    });
    return completion.choices[0].message.content.trim();
  } catch (err) {
    console.error('OpenAI API error:', err);
    console.log('Falling back to simulated response.');

    // Extract title from prompt if possible
    const titleMatch = prompt.match(/Title:\s*(.+)/i);
    const title = titleMatch ? titleMatch[1].trim() : 'the recipe';

    // Simple custom answers depending on the prompt keywords
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('substitute') || lowerPrompt.includes('swap') || lowerPrompt.includes('replace')) {
      return `[Simulated Assistant] For "${title}", you can try these common healthy substitutes:
• Use olive oil, coconut oil, or applesauce instead of butter.
• Swap white sugar with honey, maple syrup, or stevia.
• For a gluten-free option, use almond flour, oat flour, or a 1:1 gluten-free baking blend.
• Swap milk with almond, oat, or soy milk.`;
    }
    if (lowerPrompt.includes('gluten-free') || lowerPrompt.includes('vegan')) {
      return `[Simulated Assistant] To make "${title}" gluten-free/vegan:
• Gluten-Free: Ensure all flour-based ingredients are replaced with a certified gluten-free flour blend, oat flour, or almond flour.
• Vegan: Replace dairy butter with coconut oil or plant-based butter, eggs with flax eggs (1 tbsp ground flaxseed + 3 tbsp water), and dairy milk with oat or almond milk.`;
    }
    if (lowerPrompt.includes('side dish') || lowerPrompt.includes('pairing') || lowerPrompt.includes('wine')) {
      return `[Simulated Assistant] Great pairings for "${title}" include:
• A fresh green salad with a light vinaigrette.
• Roasted vegetables (such as asparagus, broccoli, or carrots).
• A glass of light white wine (like Pinot Grigio) or a smooth red (like Pinot Noir) depending on the main protein.`;
    }
    if (lowerPrompt.includes('fast') || lowerPrompt.includes('prep') || lowerPrompt.includes('ahead')) {
      return `[Simulated Assistant] Tips to prep "${title}" ahead:
• Chop all vegetables and portion out spices the night before.
• Store prepped ingredients in airtight containers in the fridge.
• You can also prepare any sauces or marinades in advance to save cooking time.`;
    }

    return `[Simulated Assistant] Regarding "${title}": I couldn't reach the AI service right now. Please make sure to follow the recipe steps carefully, monitor your cooking times, and adjust seasoning to your taste!`;
  }
}

/**
 * Generates recipe suggestions from a list of ingredients using the OpenAI API.
 * Employs a robust fallback simulation if the API call fails or the API key is invalid.
 * 
 * @param {string} ingredientsInput - Comma-separated ingredients list from user.
 * @returns {Promise<Array>} - Array of recipe objects matching our schema.
 */
async function generateRecipesFromIngredients(ingredientsInput) {
  const isKeyMissingOrPlaceholder = !apiKey || apiKey === 'your-openai-key-here' || apiKey.startsWith('your-');
  
  if (isKeyMissingOrPlaceholder) {
    console.log('[OpenAI] Missing or placeholder API key. Generating simulated recipes.');
    return getSimulatedRecipes(ingredientsInput);
  }

  const prompt = `You are an expert chef and nutritionist. The user has these ingredients: "${ingredientsInput}".
Generate a list of 3 creative, delicious, and healthy recipes that can be made using these ingredients. You may assume standard pantry staples (like salt, pepper, cooking oil, water) are available.

Return your response strictly as a JSON object with a single key "recipes" containing the array of recipe objects. Do not include any extra markdown formatting or wrappers outside of the JSON object.
Each object in the "recipes" array must follow this structure exactly:
{
  "title": "Name of the Recipe",
  "description": "A brief, mouth-watering description of the recipe",
  "ingredients": ["1 cup ingredient name", "200g other ingredient"],
  "instructions": ["Step 1 instruction details", "Step 2 instruction details"],
  "category": "Breakfast" or "Lunch" or "Dinner" or "Dessert" or "Snack" or "Beverage",
  "difficulty": "Easy" or "Medium" or "Hard",
  "prepTimeMinutes": 15,
  "cookTime": 25,
  "tags": ["healthy", "quick", "low-carb"],
  "calories": 350,
  "protein": 20,
  "carbs": 40,
  "fat": 12
}

Ensure all numeric fields are standard numbers (not strings). Ensure category is one of: Breakfast, Lunch, Dinner, Dessert, Snack, Beverage. Ensure difficulty is one of: Easy, Medium, Hard.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    });

    const resultText = completion.choices[0].message.content;
    if (!resultText) {
      throw new Error('Empty response from OpenAI API');
    }

    const data = JSON.parse(resultText.trim());
    let recipes = data.recipes;
    if (!Array.isArray(recipes)) {
      throw new Error('Response recipes field is not an array');
    }

    // Validate and clean each recipe to ensure compatibility
    const { PREDEFINED_TAGS } = require('./constants');
    
    return recipes.map((recipe, index) => {
      // Map tags to match predefined ones (case-insensitive match)
      const cleanedTags = Array.isArray(recipe.tags)
        ? recipe.tags
            .map(t => PREDEFINED_TAGS.find(pt => pt.toLowerCase() === String(t).trim().toLowerCase()))
            .filter(Boolean)
        : [];

      return {
        title: recipe.title || `AI Suggestion #${index + 1}`,
        description: recipe.description || 'Delicious AI generated recipe.',
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [recipe.ingredients || 'Main ingredients'],
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [recipe.instructions || 'Cook until done.'],
        category: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Beverage'].includes(recipe.category) ? recipe.category : 'Lunch',
        difficulty: ['Easy', 'Medium', 'Hard'].includes(recipe.difficulty) ? recipe.difficulty : 'Medium',
        prepTimeMinutes: Number(recipe.prepTimeMinutes) || 15,
        cookTime: Number(recipe.cookTime) || 20,
        tags: cleanedTags,
        calories: Number(recipe.calories) || 300,
        protein: Number(recipe.protein) || 15,
        carbs: Number(recipe.carbs) || 35,
        fat: Number(recipe.fat) || 10
      };
    });

  } catch (err) {
    console.error('[OpenAI API Error] Failed to generate or parse recipes. Using simulated fallback:', err.message);
    return getSimulatedRecipes(ingredientsInput);
  }
}

/**
 * Generates simulated recipes based on the user's input ingredients.
 */
function getSimulatedRecipes(ingredientsInput) {
  // Parse input ingredients into an array of clean strings
  const items = ingredientsInput
    .split(',')
    .map(i => i.trim().toLowerCase())
    .filter(i => i.length > 0);

  const keyIngredient = items[0] || 'garden vegetables';
  const secondIngredient = items[1] || 'herbs';
  const thirdIngredient = items[2] || 'spices';

  // Capitalize helpers
  const cap = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return [
    {
      title: `Classic ${cap(keyIngredient)} & ${cap(secondIngredient)} Stir-Fry`,
      description: `A quick and nutritious stir-fry bringing out the natural flavors of fresh ${keyIngredient} combined with ${secondIngredient} and seasoned to perfection.`,
      ingredients: [
        `2 cups of fresh ${keyIngredient}, chopped`,
        `1 cup of ${secondIngredient}`,
        `2 tbsp olive oil`,
        `Salt, pepper, and garlic powder to taste`,
        items.includes('rice') ? '2 cups cooked jasmine rice' : '1 cup quinoa or grains of choice'
      ],
      instructions: [
        `Wash and prepare the ${keyIngredient} and ${secondIngredient}.`,
        `Heat olive oil in a pan or wok over medium-high heat.`,
        `Add the ingredients and sauté for 5-7 minutes until tender-crisp.`,
        `Season with garlic, salt, and pepper, and serve hot over rice or grains.`
      ],
      category: 'Lunch',
      difficulty: 'Easy',
      prepTimeMinutes: 10,
      cookTime: 15,
      tags: ['Healthy', 'Quick'],
      calories: 320,
      protein: 12,
      carbs: 45,
      fat: 9
    },
    {
      title: `Hearty ${cap(keyIngredient)} & ${cap(thirdIngredient)} Stew`,
      description: `Comfort food at its finest. This slow-simmered bowl merges the goodness of ${keyIngredient} with aromatic ${thirdIngredient} for a warming meal.`,
      ingredients: [
        `3 cups of ${keyIngredient}, cubed`,
        `1 onion, diced`,
        `2 cloves garlic, minced`,
        `1 tbsp of ${thirdIngredient}`,
        `4 cups vegetable broth`,
        `Fresh ${secondIngredient} for garnish`
      ],
      instructions: [
        `In a large pot, sauté diced onions and minced garlic in a splash of oil.`,
        `Add the ${keyIngredient} and cook for 3 minutes.`,
        `Stir in the ${thirdIngredient} and vegetable broth, then bring to a boil.`,
        `Lower heat, cover, and let simmer for 20-25 minutes until ingredients are soft.`,
        `Garnish with fresh ${secondIngredient} and serve with crusty bread.`
      ],
      category: 'Dinner',
      difficulty: 'Medium',
      prepTimeMinutes: 15,
      cookTime: 30,
      tags: ['Comfort', 'Healthy'],
      calories: 280,
      protein: 8,
      carbs: 38,
      fat: 7
    },
    {
      title: `Savory ${cap(keyIngredient)} Breakfast Bowl`,
      description: `Start your day energized with this wholesome breakfast bowl featuring sauteed ${keyIngredient} and dynamic flavor highlights.`,
      ingredients: [
        `1 cup of ${keyIngredient}, finely sliced`,
        `2 large eggs (or tofu scramble)`,
        `1/2 avocado, sliced`,
        `A pinch of ${thirdIngredient}`,
        `Salt and pepper to taste`
      ],
      instructions: [
        `Heat a skillet with a light coat of oil or butter.`,
        `Sauté the sliced ${keyIngredient} until soft.`,
        `Cook the eggs (scrambled or sunny side up) to your liking.`,
        `Assemble the bowl with the cooked ${keyIngredient}, eggs, and sliced avocado.`,
        `Sprinkle with ${thirdIngredient}, salt, and pepper before digging in.`
      ],
      category: 'Breakfast',
      difficulty: 'Easy',
      prepTimeMinutes: 5,
      cookTime: 10,
      tags: ['Low-Carb', 'Healthy'],
      calories: 380,
      protein: 18,
      carbs: 12,
      fat: 26
    }
  ];
}

module.exports = { getAIResponse, generateRecipesFromIngredients };
