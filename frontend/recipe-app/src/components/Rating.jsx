import { useState } from 'react';
import axios from 'axios';
import './Rating.css';

const Rating = ({ recipeId, initialRatings = [], initialAverage = 0, onRateChange }) => {
  const [average, setAverage] = useState(initialAverage);
  const [ratings, setRatings] = useState(initialRatings);
  const [hoverValue, setHoverValue] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  const handleRate = async (val) => {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(`/api/recipes/${recipeId}/rate`, { value: val }, { headers });
      setAverage(res.data.averageRating);
      setRatings(res.data.ratings);
      if (onRateChange) {
        onRateChange(res.data.averageRating, res.data.ratings);
      }
    } catch (err) {
      console.error('Failed to submit rating:', err);
      alert(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const rounded = Math.round(average);

  return (
    <div className="rating-component">
      <div className="stars-wrapper">
        {[1, 2, 3, 4, 5].map((starVal) => {
          // If hovering, show up to hoverValue. Otherwise, show average rating
          const isFilled = hoverValue !== null ? starVal <= hoverValue : starVal <= rounded;
          
          return (
            <span
              key={starVal}
              className={`star-symbol ${isFilled ? 'filled' : ''} interactive ${loading ? 'disabled' : ''}`}
              onMouseEnter={() => !loading && setHoverValue(starVal)}
              onMouseLeave={() => !loading && setHoverValue(null)}
              onClick={() => !loading && handleRate(starVal)}
              title={`Rate ${starVal} Star${starVal > 1 ? 's' : ''}`}
            >
              ★
            </span>
          );
        })}
      </div>
      <span className="rating-stats-text">
        {average > 0 ? (
          <>
            <span className="rating-value-badge">{average.toFixed(1)}</span>
            <span className="rating-count">({ratings.length} {ratings.length === 1 ? 'rating' : 'ratings'})</span>
          </>
        ) : (
          <span className="no-ratings-text">No ratings yet</span>
        )}
      </span>
    </div>
  );
};

export default Rating;
