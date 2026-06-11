import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Likes & Ratings States
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // Meal Planner State
  const [showMealModal, setShowMealModal] = useState(false);
  const [mealDay, setMealDay] = useState('Monday');
  const [mealType, setMealType] = useState('Breakfast');
  const [mealSuccess, setMealSuccess] = useState('');

  // Comments State
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState(null);

  // AI Assistant Drawer State
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiHistory, setAiHistory] = useState([
    { role: 'assistant', text: 'Hi! I am your AI kitchen helper. Ask me about ingredient swaps, scaling directions, or baking alternatives for this recipe!' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch recipe details
  const fetchRecipe = async () => {
    try {
      const res = await axios.get(`/api/recipes/${id}`);
      setRecipe(res.data);
      setLikesCount(res.data.likes?.length || 0);
      setComments(res.data.comments || []);
      
      // Determine if current visitor/user has liked this recipe
      let visitorId = user?.id || ''; 
      if (res.data.likes?.includes(visitorId)) {
        setLiked(true);
      }
      
      // Determine if user has rated this recipe
      if (user) {
        const ratingObj = res.data.ratings?.find(r => r.user === user.id);
        if (ratingObj) {
          setUserRating(ratingObj.value);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Recipe not found or server error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipe();
  }, [id, user]);

  // Toggle Like
  const handleLike = async () => {
    try {
      const res = await axios.post(`/api/recipes/${id}/like`);
      setLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  // Submit Rating
  const handleRate = async (val) => {
    try {
      const res = await axios.post(`/api/recipes/${id}/rate`, { value: val });
      setUserRating(val);
      // Reload recipe to reflect updated average
      fetchRecipe();
    } catch (err) {
      console.error('Rating error:', err);
    }
  };

  // Add Comment
  const handleAddComment = async (e, parentId = null) => {
    e.preventDefault();
    const text = parentId ? replyText : commentText;
    if (!text.trim()) return;

    try {
      const res = await axios.post(`/api/recipes/${id}/comment`, { text, parentId });
      setComments(prev => [...prev, res.data.comment]);
      if (parentId) {
        setReplyText('');
        setActiveReplyId(null);
      } else {
        setCommentText('');
      }
      // Re-fetch to guarantee sync
      fetchRecipe();
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await axios.delete(`/api/recipes/${id}/comment/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
      fetchRecipe();
    } catch (err) {
      console.error('Delete comment error:', err);
    }
  };

  // Meal Plan submission
  const handleAddToMealPlan = async () => {
    setMealSuccess('');
    try {
      await axios.post('/api/recipes/meal-plan', {
        recipeId: id,
        day: mealDay,
        mealType
      });
      setMealSuccess(`Successfully added to ${mealDay}'s ${mealType}!`);
      setTimeout(() => {
        setShowMealModal(false);
        setMealSuccess('');
      }, 2000);
    } catch (err) {
      console.error('Meal plan error:', err);
      setError(err.response?.data?.message || 'Error adding to meal plan.');
    }
  };

  // AI Query Submit
  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim() || aiLoading) return;

    const userText = aiPrompt;
    setAiHistory(prev => [...prev, { role: 'user', text: userText }]);
    setAiPrompt('');
    setAiLoading(true);

    try {
      const res = await axios.post('/api/ai/assist', {
        recipeId: id,
        prompt: userText
      });
      setAiHistory(prev => [...prev, { role: 'assistant', text: res.data.answer }]);
    } catch (err) {
      console.error(err);
      setAiHistory(prev => [...prev, { role: 'assistant', text: 'Sorry, I hit an error connecting to the AI helper. Please try again later.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted mt-2">Plating your recipe details...</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="card glass-panel p-5 text-center mt-4">
        <i className="fa-solid fa-triangle-exclamation text-danger mb-3" style={{ fontSize: '3rem' }}></i>
        <h3>Error Loading Recipe</h3>
        <p className="text-muted">{error || 'Recipe does not exist.'}</p>
        <Link to="/" className="btn btn-premium-primary mt-3">Back to Home</Link>
      </div>
    );
  }

  // Nested comments rendering helpers
  const parentComments = comments.filter(c => !c.parentId);
  const getReplies = (parentId) => comments.filter(c => c.parentId === parentId);

  return (
    <div className="position-relative animate-fade-in">
      <div className="row">
        {/* Main Recipe Info */}
        <div className="col-lg-8 mb-4">
          <div className="card glass-panel p-4 mb-4">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h1 className="font-weight-bold text-gradient mb-1">{recipe.title}</h1>
                <p className="text-muted mb-0">{recipe.category} &bull; {recipe.difficulty}</p>
              </div>

              {/* Likes & Ratings actions */}
              <div className="d-flex align-items-center" style={{ gap: '10px' }}>
                <button 
                  onClick={handleLike} 
                  className={`btn rounded-circle d-flex align-items-center justify-content-center ${liked ? 'btn-danger' : 'btn-outline-secondary'}`}
                  style={{ width: '45px', height: '45px', transition: 'all 0.3s' }}
                >
                  <i className={`fa-${liked ? 'solid' : 'regular'} fa-heart`} style={{ fontSize: '1.2rem' }}></i>
                </button>
                {isAuthenticated && (
                  <button 
                    onClick={() => setShowMealModal(true)} 
                    className="btn btn-premium-secondary d-flex align-items-center"
                  >
                    <i className="fa-regular fa-calendar-plus mr-2"></i> Add to Plan
                  </button>
                )}
              </div>
            </div>

            {/* Recipe Banner Image */}
            <div className="rounded overflow-hidden mb-4" style={{ height: '350px' }}>
              <img 
                src={recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=1200'} 
                alt={recipe.title} 
                className="w-100 h-100" 
                style={{ objectFit: 'cover' }}
              />
            </div>

            {/* Details Stats bar */}
            <div className="row text-center mb-4 py-3 border-top border-bottom border-secondary" style={{ background: 'rgba(0,0,0,0.1)' }}>
              <div className="col-4">
                <small className="text-muted font-weight-bold">PREP TIME</small>
                <h4 className="mb-0 text-white">{recipe.prepTimeMinutes || 0}m</h4>
              </div>
              <div className="col-4">
                <small className="text-muted font-weight-bold">COOK TIME</small>
                <h4 className="mb-0 text-white">{recipe.cookTime || 0}m</h4>
              </div>
              <div className="col-4">
                <small className="text-muted font-weight-bold">LIKES</small>
                <h4 className="mb-0 text-white">{likesCount}</h4>
              </div>
            </div>

            {/* Description */}
            <h5 className="font-weight-bold mb-2">Description</h5>
            <p className="text-muted lead" style={{ fontSize: '1.05rem' }}>{recipe.description}</p>

            {/* Ingredients & Instructions Grid */}
            <div className="row mt-4">
              <div className="col-md-5 mb-4">
                <h5 className="font-weight-bold mb-3"><i className="fa-solid fa-list-check text-info mr-2"></i>Ingredients</h5>
                <ul className="pl-3 text-muted">
                  {recipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="mb-2">{ing}</li>
                  ))}
                </ul>
              </div>
              <div className="col-md-7 mb-4">
                <h5 className="font-weight-bold mb-3"><i className="fa-solid fa-kitchen-set text-gradient mr-2"></i>Instructions</h5>
                <ol className="pl-3 text-muted">
                  {recipe.instructions.map((inst, idx) => (
                    <li key={idx} className="mb-3 pl-1">{inst}</li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Nutrition Facts */}
            <h5 className="font-weight-bold mb-3"><i className="fa-solid fa-nutritionix text-success mr-2"></i>Nutrition Facts (per serving)</h5>
            <div className="row text-center mb-4">
              <div className="col-3">
                <div className="p-2 border border-secondary rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h5 className="mb-0 text-success">{recipe.calories || 0}</h5>
                  <small className="text-muted">Calories</small>
                </div>
              </div>
              <div className="col-3">
                <div className="p-2 border border-secondary rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h5 className="mb-0 text-info">{recipe.protein || 0}g</h5>
                  <small className="text-muted">Protein</small>
                </div>
              </div>
              <div className="col-3">
                <div className="p-2 border border-secondary rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h5 className="mb-0 text-warning">{recipe.carbs || 0}g</h5>
                  <small className="text-muted">Carbs</small>
                </div>
              </div>
              <div className="col-3">
                <div className="p-2 border border-secondary rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h5 className="mb-0 text-danger">{recipe.fat || 0}g</h5>
                  <small className="text-muted">Fat</small>
                </div>
              </div>
            </div>

            {/* Recipe Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="d-flex flex-wrap align-items-center mt-3" style={{ gap: '8px' }}>
                <span className="text-muted mr-1 font-weight-bold small">TAGS:</span>
                {recipe.tags.map(tag => (
                  <span key={tag} className="badge badge-secondary py-1 px-2">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Rating & Comments */}
          <div className="card glass-panel p-4 mb-4">
            <h4 className="font-weight-bold mb-3">Community Ratings & Feedback</h4>
            
            {/* Star selector */}
            <div className="d-flex align-items-center mb-4 p-3 rounded" style={{ background: 'rgba(0,0,0,0.15)' }}>
              <span className="mr-3 font-weight-bold">Rate this Recipe:</span>
              <div className="d-flex text-warning" style={{ fontSize: '1.5rem', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <i 
                    key={star}
                    className={`fa-star ${hoverRating >= star || userRating >= star ? 'fa-solid' : 'fa-regular'} mr-1`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleRate(star)}
                  ></i>
                ))}
              </div>
              <span className="ml-3 text-muted">
                (Current Average: {recipe.averageRating ? recipe.averageRating.toFixed(1) : '0.0'} stars)
              </span>
            </div>

            {/* Comment Post */}
            <form onSubmit={(e) => handleAddComment(e, null)} className="mb-4">
              <div className="form-group">
                <textarea 
                  className="form-control form-control-glass" 
                  rows="3" 
                  placeholder={isAuthenticated ? "Leave your feedback, culinary tips, or notes..." : "Sign in to join the conversation!"}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={!isAuthenticated}
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="btn btn-premium-primary"
                disabled={!isAuthenticated || !commentText.trim()}
              >
                Post Feedback
              </button>
            </form>

            {/* Comments List */}
            <div className="comments-section mt-4">
              <h5>Feedback ({comments.length})</h5>
              <hr className="border-secondary mt-1 mb-3" />
              
              {parentComments.length === 0 ? (
                <p className="text-muted small">No comments posted yet. Be the first to share your thoughts!</p>
              ) : (
                parentComments.map(c => {
                  const replies = getReplies(c._id);
                  return (
                    <div key={c._id} className="mb-4 animate-fade-in">
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong className="text-info">{c.userId?.username || 'Anonymous Chef'}</strong>
                          <span className="text-muted small ml-2">{new Date(c.date).toLocaleDateString()}</span>
                        </div>
                        {isAuthenticated && user && c.userId?._id === user.id && (
                          <button 
                            className="btn btn-link text-danger p-0 small"
                            onClick={() => handleDeleteComment(c._id)}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        )}
                      </div>
                      <p className="text-white mt-1 mb-2" style={{ whiteSpace: 'pre-line' }}>{c.text}</p>
                      
                      {/* Nested replies list */}
                      {replies.map(reply => (
                        <div key={reply._id} className="comment-node ml-4 mb-3">
                          <div className="d-flex justify-content-between">
                            <div>
                              <strong className="text-gradient">{reply.userId?.username || 'Anonymous Chef'}</strong>
                              <span className="text-muted small ml-2">{new Date(reply.date).toLocaleDateString()}</span>
                            </div>
                            {isAuthenticated && user && reply.userId?._id === user.id && (
                              <button 
                                className="btn btn-link text-danger p-0 small"
                                onClick={() => handleDeleteComment(reply._id)}
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            )}
                          </div>
                          <p className="text-white mt-1 mb-0" style={{ whiteSpace: 'pre-line' }}>{reply.text}</p>
                        </div>
                      ))}

                      {/* Reply form toggle */}
                      {isAuthenticated && (
                        <div className="ml-4 mt-2">
                          {activeReplyId === c._id ? (
                            <form onSubmit={(e) => handleAddComment(e, c._id)}>
                              <div className="form-group mb-2">
                                <input 
                                  type="text" 
                                  className="form-control form-control-glass py-1 px-2 text-sm" 
                                  style={{ fontSize: '0.85rem' }}
                                  placeholder={`Reply to ${c.userId?.username || 'Anonymous Chef'}...`}
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                />
                              </div>
                              <button type="submit" className="btn btn-premium-primary btn-sm py-1 px-3 mr-2" disabled={!replyText.trim()}>Reply</button>
                              <button type="button" className="btn btn-premium-secondary btn-sm py-1 px-3" onClick={() => setActiveReplyId(null)}>Cancel</button>
                            </form>
                          ) : (
                            <button 
                              className="btn btn-link text-info p-0 small" 
                              onClick={() => {
                                setActiveReplyId(c._id);
                                setReplyText('');
                              }}
                            >
                              <i className="fa-solid fa-reply mr-1"></i> Reply
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info/AI Assistant Trigger */}
        <div className="col-lg-4">
          <div className="card glass-panel p-3 text-center mb-4">
            <h5 className="font-weight-bold mb-2">Cooking Assistant</h5>
            <p className="text-muted small mb-3">Stuck in the kitchen? Get ingredient swap suggestions or step clarifications directly from our AI helper.</p>
            <button 
              onClick={() => setAiOpen(!aiOpen)}
              className="btn btn-premium-primary btn-block py-2"
            >
              <i className="fa-solid fa-robot mr-2"></i> {aiOpen ? 'Close AI Panel' : 'Ask AI Assistant'}
            </button>
          </div>

          {/* Collapsible/Drawer AI Assistant panel */}
          {aiOpen && (
            <div className="card glass-panel p-3 animate-fade-in" style={{ maxHeight: '600px', display: 'flex', flexDirection: 'column' }}>
              <div className="border-bottom border-secondary pb-2 mb-2 d-flex justify-content-between align-items-center">
                <h6 className="mb-0 font-weight-bold text-gradient"><i className="fa-solid fa-robot mr-2"></i>AI Cooking Helper</h6>
                <button className="close text-white" onClick={() => setAiOpen(false)}>&times;</button>
              </div>

              {/* Chat Body */}
              <div className="chat-messages flex-grow-1 overflow-y-auto pr-1" style={{ height: '350px', overflowY: 'auto' }}>
                {aiHistory.map((chat, idx) => (
                  <div key={idx} className={`mb-3 p-2 rounded ${chat.role === 'user' ? 'bg-secondary text-right ml-5' : 'bg-dark text-left mr-5'}`} style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                    <small className="text-muted d-block mb-1">{chat.role === 'user' ? 'You' : 'GourmetAI'}</small>
                    <span className="text-white text-sm" style={{ whiteSpace: 'pre-line', fontSize: '0.85rem' }}>{chat.text}</span>
                  </div>
                ))}
                {aiLoading && (
                  <div className="bg-dark text-left mr-5 p-2 rounded" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                    <small className="text-muted d-block mb-1">GourmetAI</small>
                    <span className="text-white"><i className="fa-solid fa-ellipsis fa-bounce"></i> Simmering ideas...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleAiSubmit} className="mt-3">
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control form-control-glass py-2" 
                    placeholder="Ask AI something..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    disabled={aiLoading}
                  />
                  <div className="input-group-append">
                    <button type="submit" className="btn btn-premium-primary px-3" disabled={aiLoading || !aiPrompt.trim()}>
                      <i className="fa-solid fa-paper-plane"></i>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Meal Plan Modal */}
      {showMealModal && (
        <div className="modal-backdrop fade show">
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ top: '15%' }}>
            <div className="modal-dialog" role="document">
              <div className="modal-content glass-panel border-secondary p-4 text-white">
                <div className="modal-header border-0 p-0 justify-content-between">
                  <h5 className="modal-title font-weight-bold text-gradient">Schedule Meal Plan</h5>
                  <button type="button" className="close text-white" onClick={() => setShowMealModal(false)}>&times;</button>
                </div>
                <div className="modal-body p-0 py-3">
                  {mealSuccess && (
                    <div className="alert alert-success border-0 text-white" style={{ background: 'rgba(40, 167, 69, 0.2)' }}>
                      <i className="fa-solid fa-circle-check mr-2"></i> {mealSuccess}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="text-muted small font-weight-bold">DAY OF THE WEEK</label>
                    <select 
                      className="form-control form-control-glass" 
                      value={mealDay} 
                      onChange={(e) => setMealDay(e.target.value)}
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group mb-4">
                    <label className="text-muted small font-weight-bold">MEAL TYPE</label>
                    <select 
                      className="form-control form-control-glass" 
                      value={mealType} 
                      onChange={(e) => setMealType(e.target.value)}
                    >
                      {['Breakfast', 'Lunch', 'Dinner'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-0 p-0" style={{ gap: '10px' }}>
                  <button type="button" className="btn btn-premium-secondary" onClick={() => setShowMealModal(false)}>Cancel</button>
                  <button type="button" className="btn btn-premium-primary" onClick={handleAddToMealPlan}>Add Entry</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetail;
