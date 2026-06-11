import React from 'react';
import IputForm from '../components/IputForm';
import { useNavigate } from 'react-router-dom';

export default function AddRecipePage() {
  const navigate = useNavigate();

  const handleAdd = () => {
    // After a successful add, redirect to the recipe list page
    navigate('/myRecipes');
  };

  return <IputForm onAdd={handleAdd} />;
}
