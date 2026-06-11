import React from 'react';
import AllRecipes from '../components/AllRecipes';

// Page showing recipes created by the logged‑in user
const MyRecipesPage = () => {
  return <AllRecipes userOnly={true} />;
};

export default MyRecipesPage;
