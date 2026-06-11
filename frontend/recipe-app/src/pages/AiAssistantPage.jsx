import React, { useState } from 'react';
import axios from 'axios';
import './AiAssistantPage.css';

const RECOMMENDED_INGREDIENTS = [
  'Tomato', 'Potato', 'Onion', 'Garlic', 'Chicken', 'Beef', 'Eggs', 'Rice',
  'Cheese', 'Broccoli', 'Carrot', 'Mushroom', 'Butter', 'Pasta', 'Spinach', 'Milk'
];

function AiAssistantPage() {
  const [ingredients, setIngredients] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState('');
  const [savedRecipes, setSavedRecipes] = useState({}); // recipeIndex -> boolean or database ID
  const [expandedRecipe, setExpandedRecipe] = useState(null); // index of expanded recipe details

  // Input handlers
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addIngredient(inputValue);
    }
  };

  const addIngredient = (name) => {
    const cleanName = name.trim().replace(/,$/, '');
    if (cleanName && !ingredients.includes(cleanName)) {
      setIngredients([...ingredients, cleanName]);
    }
    setInputValue('');
  };

  const removeIngredient = (indexToRemove) => {
    setIngredients(ingredients.filter((_, idx) => idx !== indexToRemove));
  };

  const toggleRecommendedIngredient = (ing) => {
    if (ingredients.includes(ing)) {
      setIngredients(ingredients.filter(i => i !== ing));
    } else {
      setIngredients([...ingredients, ing]);
    }
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) {
      setError('Please add at least one ingredient.');
      return;
    }

    setLoading(true);
    setError('');
    setRecipes([]);
    setSavedRecipes({});
    setExpandedRecipe(null);

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.post(
        '/api/ai/suggest-recipes',
        { ingredients: ingredients.join(', ') },
        { headers }
      );

      if (response.data?.success && Array.isArray(response.data?.recipes)) {
        setRecipes(response.data.recipes);
      } else {
        throw new Error('Invalid response structure from server.');
      }
    } catch (err) {
      console.error('Failed to get suggestions:', err);
      setError(err.response?.data?.message || 'Could not fetch suggestions. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async (recipe, index) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Prepare request body, mapping to fields backend expects
      const payload = {
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        category: recipe.category,
        difficulty: recipe.difficulty,
        prepTimeMinutes: recipe.prepTimeMinutes,
        cookTime: recipe.cookTime,
        tags: recipe.tags,
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat
      };

      const response = await axios.post('/api/recipes', payload, { headers });
      
      setSavedRecipes(prev => ({
        ...prev,
        [index]: response.data?._id || true
      }));
    } catch (err) {
      console.error('Failed to save recipe:', err);
      alert(err.response?.data?.message || 'Error occurred while saving recipe.');
    }
  };

  return (
    <div className="ai-assistant-container">
      {/* Hero Header */}
      <header className="ai-assistant-hero">
        <div className="ai-hero-overlay"></div>
        <div className="ai-hero-content">
          <span className="ai-badge">🤖 AI KITCHEN COMPANION</span>
          <h1>AI Recipe Assistant</h1>
          <p>Tell us what ingredients you have, and OpenAI will cook up perfect recipes including nutrition macros and prep times.</p>
        </div>
      </header>

      {/* Input Section */}
      <section className="ai-input-card">
        <h2>What's in your pantry or fridge?</h2>
        
        {/* Tag input block */}
        <div className="tag-input-wrapper">
          <div className="ingredients-tags-container">
            {ingredients.map((ing, idx) => (
              <span key={idx} className="ingredient-tag">
                {ing}
                <button type="button" onClick={() => removeIngredient(idx)} className="tag-remove-btn">&times;</button>
              </span>
            ))}
            <input
              type="text"
              placeholder={ingredients.length === 0 ? "e.g., Chicken, tomato, rice..." : "Add more..."}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onBlur={() => {
                if (inputValue.trim()) addIngredient(inputValue);
              }}
              className="tag-input-field"
            />
          </div>
        </div>

        {/* Recommended list */}
        <div className="recommended-container">
          <p className="recommended-title">Quick Add Popular Ingredients:</p>
          <div className="recommended-pills">
            {RECOMMENDED_INGREDIENTS.map((ing) => {
              const active = ingredients.includes(ing);
              return (
                <button
                  key={ing}
                  type="button"
                  onClick={() => toggleRecommendedIngredient(ing)}
                  className={`recommended-pill ${active ? 'active' : ''}`}
                >
                  {active ? '✓ ' : '+ '}
                  {ing}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="action-row">
          {error && <p className="ai-error-message">{error}</p>}
          <button
            onClick={handleGenerate}
            disabled={loading || ingredients.length === 0}
            className="ai-generate-btn"
          >
            {loading ? (
              <>
                <span className="spinner"></span> Consulting the Chef...
              </>
            ) : (
              <>
                🪄 Suggest Chef Recipes
              </>
            )}
          </button>
        </div>
      </section>

      {/* Loading state visual overlay/animation */}
      {loading && (
        <div className="ai-loading-placeholder">
          <div className="loading-animation-icon">🍳</div>
          <h3>Curating Custom Recipes</h3>
          <p>Analyzing ingredients, matching flavor profiles, and calculating nutritional macros...</p>
        </div>
      )}

      {/* Suggestions Results */}
      {recipes.length > 0 && (
        <section className="ai-results-section">
          <div className="section-header">
            <h2>Chef's AI Recommendations</h2>
            <p>Based on your selected ingredients: {ingredients.join(', ')}</p>
          </div>

          <div className="ai-recipes-grid">
            {recipes.map((recipe, idx) => {
              const isSaved = savedRecipes[idx];
              const isExpanded = expandedRecipe === idx;

              return (
                <div key={idx} className="ai-recipe-card">
                  {/* Top Header Card */}
                  <div className="card-top-header">
                    <span className={`difficulty-badge ${recipe.difficulty.toLowerCase()}`}>
                      {recipe.difficulty}
                    </span>
                    <span className="category-badge">{recipe.category}</span>
                  </div>

                  <h3 className="recipe-card-title">{recipe.title}</h3>
                  <p className="recipe-card-desc">{recipe.description}</p>

                  {/* Timing Meta */}
                  <div className="recipe-card-times">
                    <span>🕒 Prep: {recipe.prepTimeMinutes}m</span>
                    <span>🔥 Cook: {recipe.cookTime}m</span>
                  </div>

                  {/* Nutrition Dashboard */}
                  <div className="nutrition-progress-panel">
                    <div className="nutri-item calories">
                      <span className="nutri-val">{recipe.calories}</span>
                      <span className="nutri-label">kcal</span>
                    </div>
                    <div className="nutri-item protein">
                      <span className="nutri-val">{recipe.protein}g</span>
                      <span className="nutri-label">protein</span>
                    </div>
                    <div className="nutri-item carbs">
                      <span className="nutri-val">{recipe.carbs}g</span>
                      <span className="nutri-label">carbs</span>
                    </div>
                    <div className="nutri-item fat">
                      <span className="nutri-val">{recipe.fat}g</span>
                      <span className="nutri-label">fat</span>
                    </div>
                  </div>

                  {/* Predefined Tags display */}
                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="recipe-card-tags">
                      {recipe.tags.map((tag, tagIdx) => (
                        <span key={tagIdx} className="recipe-card-tag">#{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="card-action-buttons">
                    <button
                      onClick={() => setExpandedRecipe(isExpanded ? null : idx)}
                      className="details-toggle-btn"
                    >
                      {isExpanded ? 'Hide Details ▲' : 'View Full Recipe ▼'}
                    </button>

                    <button
                      onClick={() => handleSaveRecipe(recipe, idx)}
                      disabled={!!isSaved}
                      className={`save-recipe-btn ${isSaved ? 'saved' : ''}`}
                    >
                      {isSaved ? '✓ Saved to collection' : '💾 Save to My Recipes'}
                    </button>
                  </div>

                  {/* Collapsible details (Ingredients & Instructions) */}
                  {isExpanded && (
                    <div className="expanded-details-drawer">
                      <div className="drawer-section">
                        <h4>Ingredients</h4>
                        <ul className="drawer-list ingredients-list">
                          {recipe.ingredients.map((ing, iIdx) => (
                            <li key={iIdx}>{ing}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="drawer-section">
                        <h4>Step-by-step Instructions</h4>
                        <ol className="drawer-list instructions-list">
                          {recipe.instructions.map((inst, instIdx) => (
                            <li key={instIdx}>{inst}</li>
                          ))}
                        </ol>
                      </div>
                      
                      {isSaved && (
                        <div className="saved-success-notice">
                          💡 Recipe saved! Go to the <a href="/meal-plan" className="notice-link">Meal Planner</a> to schedule this meal in your weekly calendar grid.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default AiAssistantPage;
