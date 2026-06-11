import React, { useState } from 'react';
import './FilterBar.css';

const categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack'];
const difficulties = ['Easy', 'Medium', 'Hard'];
const diets = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Healthy', 'Low-Carb', 'Quick', 'Comfort'];

function FilterBar({ onChange }) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [difficultyOpen, setDifficultyOpen] = useState(true);
  const [dietOpen, setDietOpen] = useState(true);

  const emit = (cat, diff, diet) => {
    onChange({ category: cat, difficulty: diff, tags: diet });
  };

  const handleCategoryClick = (cat) => {
    const newCat = cat === selectedCategory ? '' : cat;
    setSelectedCategory(newCat);
    emit(newCat, selectedDifficulty, selectedDiet);
  };

  const handleDifficultyClick = (diff) => {
    const newDiff = diff === selectedDifficulty ? '' : diff;
    setSelectedDifficulty(newDiff);
    emit(selectedCategory, newDiff, selectedDiet);
  };

  const handleDietClick = (diet) => {
    const newDiet = diet === selectedDiet ? '' : diet;
    setSelectedDiet(newDiet);
    emit(selectedCategory, selectedDifficulty, newDiet);
  };

  const handleReset = () => {
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSelectedDiet('');
    onChange({ category: '', difficulty: '', tags: '' });
  };

  const hasFilter = selectedCategory || selectedDifficulty || selectedDiet;

  return (
    <div className="filter-sidebar">
      <div className="filter-sidebar-header">
        <span>Filter Recipes</span>
        {hasFilter && (
          <button className="filter-reset-btn" onClick={handleReset}>Reset</button>
        )}
      </div>

      {/* Category Section */}
      <div className="filter-sidebar-section">
        <button className="filter-sidebar-toggle" onClick={() => setCategoryOpen(o => !o)}>
          <span>Category</span>
          <span className="filter-toggle-icon">{categoryOpen ? '−' : '+'}</span>
        </button>
        {categoryOpen && (
          <ul className="filter-checkbox-list">
            {categories.map((cat) => (
              <li key={cat} className="filter-checkbox-item" onClick={() => handleCategoryClick(cat)}>
                <span className={`filter-checkbox ${selectedCategory === cat ? 'checked' : ''}`}>
                  {selectedCategory === cat ? '✓' : ''}
                </span>
                <span className="filter-checkbox-label">{cat}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Difficulty Section */}
      <div className="filter-sidebar-section">
        <button className="filter-sidebar-toggle" onClick={() => setDifficultyOpen(o => !o)}>
          <span>Difficulty</span>
          <span className="filter-toggle-icon">{difficultyOpen ? '−' : '+'}</span>
        </button>
        {difficultyOpen && (
          <ul className="filter-checkbox-list">
            {difficulties.map((diff) => (
              <li key={diff} className="filter-checkbox-item" onClick={() => handleDifficultyClick(diff)}>
                <span className={`filter-checkbox ${selectedDifficulty === diff ? 'checked' : ''}`}>
                  {selectedDifficulty === diff ? '✓' : ''}
                </span>
                <span className="filter-checkbox-label">{diff}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Diet Section */}
      <div className="filter-sidebar-section">
        <button className="filter-sidebar-toggle" onClick={() => setDietOpen(o => !o)}>
          <span>Diet</span>
          <span className="filter-toggle-icon">{dietOpen ? '−' : '+'}</span>
        </button>
        {dietOpen && (
          <ul className="filter-checkbox-list">
            {diets.map((diet) => (
              <li key={diet} className="filter-checkbox-item" onClick={() => handleDietClick(diet)}>
                <span className={`filter-checkbox ${selectedDiet === diet ? 'checked' : ''}`}>
                  {selectedDiet === diet ? '✓' : ''}
                </span>
                <span className="filter-checkbox-label">{diet}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}

export default FilterBar;
