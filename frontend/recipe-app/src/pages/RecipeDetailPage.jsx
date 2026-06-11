import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RecipeDetailPage.css';
import Rating from '../components/Rating';
import Comments from '../components/Comments';
import AIAssistant from '../components/AIAssistant';

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loggedInUserId = (() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.id;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`/api/recipes/${id}`, { headers });
        setRecipe(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load recipe:', err);
        setError('Unable to load recipe details.');
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleEdit = () => {
    navigate(`/edit-recipe/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this recipe?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/myRecipes');
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete recipe');
    }
  };

  const handleRatingChange = (newAverage, newRatings) => {
    setRecipe(prev => ({
      ...prev,
      averageRating: newAverage,
      ratings: newRatings
    }));
  };

  if (loading) return <div className="detail-loading">Loading delicious details...</div>;
  if (error) return <div className="detail-error">{error}</div>;
  if (!recipe) return null;

  return (
    <div className="detail-page">
      <main className="detail-content animate-fade-in">
        <button className="back-btn" onClick={() => navigate(-1)}>&larr; Back</button>
        
        <div className="detail-header-section">
          <h1 className="detail-title">{recipe.title}</h1>
          <div className="detail-rating-wrapper">
            <Rating
              recipeId={recipe._id}
              initialRatings={recipe.ratings}
              initialAverage={recipe.averageRating}
              onRateChange={handleRatingChange}
            />
          </div>
        </div>

        {recipe.image && (
          <div className="detail-image-container">
            <img src={recipe.image} alt={recipe.title} className="detail-image" />
            {recipe.category && (
              <span className="detail-floating-category">{recipe.category}</span>
            )}
          </div>
        )}

        <div className="detail-main-layout">
          <div className="detail-left-column">
            <p className="detail-description">{recipe.description}</p>
            
            <section className="detail-section">
              <h3>Ingredients</h3>
              <ul className="detail-ingredients-list">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="detail-ingredient-item">{ing}</li>
                ))}
              </ul>
            </section>

            <section className="detail-section">
              <h3>Instructions</h3>
              <ol className="detail-instructions-list">
                {recipe.instructions.map((ins, i) => (
                  <li key={i} className="detail-instruction-item">{ins}</li>
                ))}
              </ol>
            </section>
          </div>

          <div className="detail-right-column">
            <div className="detail-meta-card">
              <h3>Recipe Details</h3>
              <div className="detail-meta-item">
                <span className="meta-label">Difficulty:</span>
                <span className={`meta-value difficulty-${recipe.difficulty?.toLowerCase()}`}>
                  {recipe.difficulty}
                </span>
              </div>
              <div className="detail-meta-item">
                <span className="meta-label">Prep Time:</span>
                <span className="meta-value">{recipe.prepTimeMinutes || 0} mins</span>
              </div>
              <div className="detail-meta-item">
                <span className="meta-label">Cook Time:</span>
                <span className="meta-value">{recipe.cookTime || 0} mins</span>
              </div>
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="detail-tags-section">
                  <span className="meta-label">Tags:</span>
                  <div className="detail-tags">
                    {recipe.tags.map((tag, i) => (
                      <span key={i} className="badge badge--tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Assistant container */}
            <div className="detail-ai-assistant-card">
              <AIAssistant recipeId={recipe._id} />
            </div>
          </div>
        </div>

        {loggedInUserId && recipe.createdBy && recipe.createdBy.toString() === loggedInUserId.toString() && (
          <div className="detail-actions">
            <button className="btn btn-edit" onClick={handleEdit}>Edit Recipe</button>
            <button className="btn btn-delete" onClick={handleDelete}>Delete Recipe</button>
          </div>
        )}

        {/* Comments Section at the bottom */}
        <div className="detail-comments-container">
          <Comments recipeId={recipe._id} userId={loggedInUserId} />
        </div>
      </main>
    </div>
  );
};

export default RecipeDetailPage;
