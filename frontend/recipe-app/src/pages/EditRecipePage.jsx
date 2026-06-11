import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import IputForm from '../components/IputForm';
import axios from 'axios';

export default function EditRecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState({});

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await axios.get(`/api/recipes/${id}`);
        const recipe = res.data;
        setInitialValues({
          _id: recipe._id,
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          category: recipe.category,
          tags: recipe.tags,
          prepTimeMinutes: recipe.prepTimeMinutes,
          image: recipe.image,
        });
      } catch (err) {
        console.error('Failed to load recipe for edit:', err);
        if (err.response && err.response.status === 404) {
          alert('Recipe not found. It may have been deleted.');
          navigate('/myRecipes');
        } else {
          alert('Failed to load recipe');
          navigate('/myRecipes');
        }
      }
    };
    fetchRecipe();
  }, [id, navigate]);

  const handleUpdate = () => {
    // After successful update, navigate back to list
    navigate('/myRecipes');
  };

  // Render form only when initialValues loaded
  return (
    <div className="edit-recipe-page">
      {initialValues.title ? (
        <IputForm onAdd={handleUpdate} initialValues={initialValues} />
      ) : (
        <p>Loading recipe...</p>
      )}
    </div>
  );
}
