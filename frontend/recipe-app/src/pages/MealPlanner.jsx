import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];

const MealPlanner = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if guest
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading]);

  const fetchMealPlan = async () => {
    try {
      const res = await axios.get('/api/recipes/meal-plan');
      setMealPlan(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch meal plan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMealPlan();
    }
  }, [isAuthenticated]);

  const handleRemoveMeal = async (entryId) => {
    if (!window.confirm('Remove this recipe from your meal plan?')) return;
    try {
      await axios.delete(`/api/recipes/meal-plan/${entryId}`);
      setMealPlan(prev => prev.filter(m => m._id !== entryId));
    } catch (err) {
      console.error('Delete meal error:', err);
    }
  };

  // Group meals by Day and MealType
  const getMealForSlot = (day, mealType) => {
    return mealPlan.filter(m => m.day === day && m.mealType === mealType);
  };

  // Calculate daily nutrition totals
  const getDailyNutrition = (day) => {
    const dayMeals = mealPlan.filter(m => m.day === day && m.recipe);
    return dayMeals.reduce((acc, m) => {
      acc.calories += m.recipe.calories || 0;
      acc.protein += m.recipe.protein || 0;
      acc.carbs += m.recipe.carbs || 0;
      acc.fat += m.recipe.fat || 0;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted mt-2">Loading your weekly meal planner...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="font-weight-bold text-gradient mb-1">Weekly Meal Planner</h1>
          <p className="text-muted mb-0">Plan your meals for the week and track daily nutrition facts</p>
        </div>
        <Link to="/" className="btn btn-premium-primary">
          <i className="fa-solid fa-plus mr-2"></i> Browse Recipes to Add
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger border-0 text-white" style={{ background: 'rgba(220, 53, 69, 0.2)' }}>
          {error}
        </div>
      )}

      {/* Responsive Grid View */}
      <div className="row">
        {DAYS.map(day => {
          const nutrition = getDailyNutrition(day);
          return (
            <div key={day} className="col-lg-4 col-md-6 mb-4">
              <div className="card glass-panel h-100 flex-column justify-content-between">
                <div className="card-header border-bottom border-secondary bg-transparent d-flex justify-content-between align-items-center py-3">
                  <h4 className="mb-0 text-gradient font-weight-bold">{day}</h4>
                  <span className="badge badge-info" style={{ fontSize: '0.8rem' }}>
                    {nutrition.calories} kcal
                  </span>
                </div>
                
                <div className="card-body p-3">
                  {MEALS.map(mealType => {
                    const slots = getMealForSlot(day, mealType);
                    return (
                      <div key={mealType} className="mb-3">
                        <small className="text-muted font-weight-bold text-uppercase d-block mb-1">{mealType}</small>
                        {slots.length === 0 ? (
                          <div className="p-2 border border-dashed rounded text-center small text-muted" style={{ borderStyle: 'dashed', borderWidth: '1px', borderColor: 'var(--glass-border)' }}>
                            No recipe scheduled
                          </div>
                        ) : (
                          slots.map(slot => (
                            <div key={slot._id} className="p-2 rounded border border-secondary mb-2 d-flex justify-content-between align-items-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                              <div className="d-flex align-items-center">
                                {slot.recipe?.image && (
                                  <img 
                                    src={slot.recipe.image} 
                                    alt={slot.recipe.title} 
                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                                    className="mr-2"
                                  />
                                )}
                                <div>
                                  <Link to={`/recipes/${slot.recipe?._id}`} className="text-white font-weight-bold text-sm hover-text-info text-truncate d-block" style={{ maxWidth: '140px' }}>
                                    {slot.recipe?.title}
                                  </Link>
                                  <small className="text-muted">{slot.recipe?.calories || 0} kcal</small>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleRemoveMeal(slot._id)} 
                                className="btn btn-link text-danger p-0 ml-2"
                              >
                                <i className="fa-solid fa-xmark"></i>
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Nutrition Summary */}
                <div className="card-footer border-top border-secondary bg-transparent p-3 text-muted" style={{ fontSize: '0.8rem' }}>
                  <div className="row text-center">
                    <div className="col-4">
                      <strong>P:</strong> {nutrition.protein}g
                    </div>
                    <div className="col-4">
                      <strong>C:</strong> {nutrition.carbs}g
                    </div>
                    <div className="col-4">
                      <strong>F:</strong> {nutrition.fat}g
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MealPlanner;
