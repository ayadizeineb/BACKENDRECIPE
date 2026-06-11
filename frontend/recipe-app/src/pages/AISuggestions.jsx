import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AISuggestions = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [ingredients, setIngredients] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState('');
  const [savedIds, setSavedIds] = useState([]); // track which generated indices were saved

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ingredients.trim()) return;

    setError('');
    setRecipes([]);
    setSavedIds([]);
    setLoading(true);

    try {
      const res = await axios.post('/api/ai/suggest-recipes', {
        ingredients: ingredients
      });
      setRecipes(res.data.recipes || []);
    } catch (err) {
      console.error(err);
      setError('Failed to generate recipes. Make sure your server is online.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async (recipe, idx) => {
    try {
      const payload = {
        title: recipe.title,
        description: recipe.description,
        ingredients: JSON.stringify(recipe.ingredients),
        instructions: JSON.stringify(recipe.instructions),
        category: recipe.category,
        difficulty: recipe.difficulty,
        prepTimeMinutes: recipe.prepTimeMinutes,
        cookTime: recipe.cookTime,
        tags: JSON.stringify(recipe.tags),
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat
      };

      await axios.post('/api/recipes', payload);
      setSavedIds(prev => [...prev, idx]);
    } catch (err) {
      console.error('Save recipe error:', err);
      alert(err.response?.data?.message || 'Error saving AI recipe. Ensure all tag values are valid.');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="card glass-panel p-4 mb-4">
        <div className="text-center mb-4">
          <i className="fa-solid fa-wand-magic-sparkles text-gradient" style={{ fontSize: '3rem' }}></i>
          <h2 className="mt-2 text-gradient">AI Recipe Generator</h2>
          <p className="text-muted">Enter the ingredients you have on hand, and our AI Chef will suggest recipes you can cook!</p>
        </div>

        <form onSubmit={handleSubmit} className="row justify-content-center">
          <div className="col-md-8">
            <div className="input-group">
              <input 
                type="text" 
                className="form-control form-control-glass py-3" 
                placeholder="e.g. chicken, spinach, heavy cream, garlic"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                disabled={loading}
                required
              />
              <div className="input-group-append">
                <button type="submit" className="btn btn-premium-primary px-4" disabled={loading || !ingredients.trim()}>
                  {loading ? (
                    <span><i className="fa-solid fa-spinner fa-spin mr-2"></i> Generating...</span>
                  ) : (
                    'Suggest Recipes'
                  )}
                </button>
              </div>
            </div>
            <small className="form-text text-muted text-center mt-2">Separate ingredients with commas.</small>
          </div>
        </form>
      </div>

      {error && (
        <div className="alert alert-danger border-0 text-white text-center glass-panel" style={{ background: 'rgba(220, 53, 69, 0.2)' }}>
          <i className="fa-solid fa-circle-exclamation mr-2"></i> {error}
        </div>
      )}

      {/* Suggested Recipes Results */}
      <div className="row">
        {recipes.map((recipe, idx) => {
          const isSaved = savedIds.includes(idx);
          return (
            <div key={idx} className="col-md-6 col-lg-4 mb-4">
              <div className="card glass-card h-100 d-flex flex-column justify-content-between">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge badge-info">{recipe.category}</span>
                    <span className={`badge-custom px-2 py-1 rounded small ${
                      recipe.difficulty === 'Easy' ? 'badge-easy' : 
                      recipe.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'
                    }`}>
                      {recipe.difficulty}
                    </span>
                  </div>

                  <h4 className="card-title text-white font-weight-bold mb-2">{recipe.title}</h4>
                  <p className="text-muted small mb-3">{recipe.description}</p>
                  
                  {/* Ingredients section */}
                  <h6 className="font-weight-bold text-gradient mt-3 mb-2">Ingredients Needed:</h6>
                  <ul className="pl-3 text-muted small">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>

                  {/* Instructions section */}
                  <h6 className="font-weight-bold text-gradient mt-3 mb-2">Cooking Directions:</h6>
                  <ol className="pl-3 text-muted small">
                    {recipe.instructions.map((inst, i) => (
                      <li key={i} className="mb-1">{inst}</li>
                    ))}
                  </ol>

                  {/* Nutrition Summary */}
                  <div className="mt-4 p-2 rounded bg-dark border border-secondary" style={{ fontSize: '0.8rem' }}>
                    <div className="row text-center text-muted">
                      <div className="col-3">
                        <strong className="text-white d-block">{recipe.calories}</strong> Cal
                      </div>
                      <div className="col-3">
                        <strong className="text-white d-block">{recipe.protein}g</strong> Prot
                      </div>
                      <div className="col-3">
                        <strong className="text-white d-block">{recipe.carbs}g</strong> Carb
                      </div>
                      <div className="col-3">
                        <strong className="text-white d-block">{recipe.fat}g</strong> Fat
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-footer border-top border-secondary bg-transparent p-3 d-flex justify-content-between align-items-center">
                  <span className="text-muted small">
                    <i className="fa-solid fa-clock mr-1"></i> {recipe.prepTimeMinutes + recipe.cookTime} mins total
                  </span>
                  {isAuthenticated ? (
                    <button 
                      onClick={() => handleSaveRecipe(recipe, idx)} 
                      className={`btn btn-sm ${isSaved ? 'btn-success' : 'btn-premium-primary'} py-1 px-3`}
                      disabled={isSaved}
                    >
                      {isSaved ? (
                        <span><i className="fa-solid fa-circle-check mr-1"></i> Saved</span>
                      ) : (
                        <span><i className="fa-solid fa-floppy-disk mr-1"></i> Save to DB</span>
                      )}
                    </button>
                  ) : (
                    <button 
                      onClick={() => navigate('/login')} 
                      className="btn btn-sm btn-premium-secondary py-1 px-3"
                    >
                      Login to Save
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AISuggestions;
