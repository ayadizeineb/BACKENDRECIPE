import React from 'react';
import { Link } from 'react-router-dom';

const RecipeCard = ({ recipe }) => {
  const { _id, title, description, category, difficulty, image, averageRating, likes } = recipe;

  // Select difficulty class
  const getDifficultyBadge = (level) => {
    switch (level) {
      case 'Easy': return 'badge-easy';
      case 'Medium': return 'badge-medium';
      case 'Hard': return 'badge-hard';
      default: return 'badge-easy';
    }
  };

  // Image source fallback
  const getRecipeImage = (imgUrl) => {
    if (!imgUrl) return 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=600';
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) return imgUrl;
    // Serve from static upload server route
    return imgUrl;
  };

  return (
    <div className="card glass-card h-100 animate-fade-in">
      <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
        <img 
          src={getRecipeImage(image)} 
          alt={title} 
          className="card-img-top w-100 h-100" 
          style={{ objectFit: 'cover', transition: 'transform 0.5s' }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
        {category && (
          <span className="position-absolute bg-dark text-white px-2 py-1 rounded" style={{ top: '10px', left: '10px', fontSize: '0.75rem', opacity: 0.85, fontWeight: 'bold' }}>
            {category}
          </span>
        )}
        {difficulty && (
          <span className={`position-absolute badge-custom ${getDifficultyBadge(difficulty)}`} style={{ top: '10px', right: '10px' }}>
            {difficulty}
          </span>
        )}
      </div>
      <div className="card-body d-flex flex-column justify-content-between p-3">
        <div>
          <h5 className="card-title text-truncate mb-1" title={title}>{title}</h5>
          <p className="card-text text-muted small text-clamp mb-2" style={{
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '38px'
          }}>
            {description}
          </p>
        </div>
        
        <div className="d-flex align-items-center justify-content-between pt-2 border-top border-secondary mt-2">
          <div className="d-flex align-items-center text-warning" style={{ fontSize: '0.85rem' }}>
            <i className="fa-solid fa-star mr-1"></i>
            <span className="font-weight-bold text-white">
              {averageRating ? averageRating.toFixed(1) : '0.0'}
            </span>
            <span className="text-muted ml-1">({recipe.ratings?.length || 0})</span>
          </div>

          <div className="d-flex align-items-center text-danger" style={{ fontSize: '0.85rem' }}>
            <i className="fa-solid fa-heart mr-1"></i>
            <span className="font-weight-bold text-white">{likes?.length || 0}</span>
          </div>

          <Link to={`/recipes/${_id}`} className="btn btn-premium-primary py-1 px-3" style={{ fontSize: '0.8rem' }}>
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
