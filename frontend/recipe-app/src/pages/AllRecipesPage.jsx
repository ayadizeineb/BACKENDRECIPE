import React, { useState } from 'react';
import AllRecipes from '../components/AllRecipes';
import FilterBar from '../components/FilterBar';
import './AllRecipesPage.css';

function AllRecipesPage({ userOnly = false }) {
  const [filters, setFilters] = useState({ category: '', difficulty: '' });

  const handleFilterChange = ({ category, difficulty }) => {
    setFilters({ category: category || '', difficulty: difficulty || '' });
  };

  return (
    <>
      <FilterBar onChange={handleFilterChange} />
      <AllRecipes userOnly={userOnly} filters={filters} />
    </>
  );
}

export default AllRecipesPage;
