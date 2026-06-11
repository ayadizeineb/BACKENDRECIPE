import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MyRecipes = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect to login if guest
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading]);

  const fetchMyRecipes = async () => {
    try {
      const res = await axios.get('/api/recipes/my-recipes');
      setRecipes(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch your recipes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyRecipes();
    }
  }, [isAuthenticated]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this recipe?')) return;
    try {
      await axios.delete(`/api/recipes/${id}`);
      setRecipes(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete recipe. Make sure you are authorized.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted mt-2">Loading your recipes dashboard...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="font-weight-bold text-gradient mb-1">My Recipes</h1>
          <p className="text-muted mb-0">Manage and edit your submitted recipes</p>
        </div>
        <Link to="/create-recipe" className="btn btn-premium-primary">
          <i className="fa-solid fa-plus mr-2"></i> Create Recipe
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger border-0 text-white" style={{ background: 'rgba(220, 53, 69, 0.2)' }}>
          {error}
        </div>
      )}

      {recipes.length === 0 ? (
        <div className="card glass-panel p-5 text-center">
          <i className="fa-solid fa-utensils text-muted mb-3" style={{ fontSize: '3.5rem' }}></i>
          <h3>No Recipes Yet</h3>
          <p className="text-muted">You haven't added any culinary creations to the platform yet.</p>
          <Link to="/create-recipe" className="btn btn-premium-primary mt-2 px-4">Add First Recipe</Link>
        </div>
      ) : (
        <div className="table-responsive glass-panel p-3">
          <table className="table table-dark table-striped table-hover mb-0 text-white" style={{ background: 'transparent' }}>
            <thead>
              <tr className="border-bottom border-secondary text-muted">
                <th>Recipe Name</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th className="text-center">Likes</th>
                <th className="text-center">Rating</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map(recipe => (
                <tr key={recipe._id} className="border-bottom border-secondary" style={{ background: 'transparent' }}>
                  <td className="align-middle font-weight-bold">
                    <Link to={`/recipes/${recipe._id}`} className="text-white hover-text-info">{recipe.title}</Link>
                  </td>
                  <td className="align-middle">{recipe.category || 'N/A'}</td>
                  <td className="align-middle">
                    <span className={`badge-custom px-2 py-1 rounded small ${
                      recipe.difficulty === 'Easy' ? 'badge-easy' : 
                      recipe.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'
                    }`}>
                      {recipe.difficulty}
                    </span>
                  </td>
                  <td className="align-middle text-center text-danger">
                    <i className="fa-solid fa-heart mr-1"></i> {recipe.likes?.length || 0}
                  </td>
                  <td className="align-middle text-center text-warning">
                    <i className="fa-solid fa-star mr-1"></i> {recipe.averageRating ? recipe.averageRating.toFixed(1) : '0.0'}
                  </td>
                  <td className="align-middle text-right">
                    <Link to={`/edit-recipe/${recipe._id}`} className="btn btn-sm btn-premium-secondary mr-2 py-1 px-3">
                      <i className="fa-solid fa-pen-to-square"></i> Edit
                    </Link>
                    <button onClick={() => handleDelete(recipe._id)} className="btn btn-sm btn-premium-danger py-1 px-3">
                      <i className="fa-solid fa-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyRecipes;
