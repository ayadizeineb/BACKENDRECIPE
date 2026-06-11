import React from 'react';
import './FilterBar.css';

const categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack'];
const difficulties = ['Easy', 'Medium', 'Hard'];

function FilterBar({ onChange }) {
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState('');

  const handleCategoryClick = (cat) => {
    const newCat = cat === selectedCategory ? '' : cat;
    setSelectedCategory(newCat);
    onChange({ category: newCat, difficulty: selectedDifficulty });
  };

  const handleDifficultyClick = (diff) => {
    const newDiff = diff === selectedDifficulty ? '' : diff;
    setSelectedDifficulty(newDiff);
    onChange({ category: selectedCategory, difficulty: newDiff });
  };

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <span className="filter-label">Category:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="filter-group">
        <span className="filter-label">Difficulty:</span>
        {difficulties.map((diff) => (
          <button
            key={diff}
            className={`filter-chip ${selectedDifficulty === diff ? 'active' : ''}`}
            onClick={() => handleDifficultyClick(diff)}
          >
            {diff}
          </button>
        ))}
      </div>
    </div>
  );
}

export default FilterBar;
