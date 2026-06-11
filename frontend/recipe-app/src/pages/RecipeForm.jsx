import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const PREDEFINED_TAGS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Quick', 'Healthy', 'Comfort', 'Holiday', 'Kids', 'Low-Carb'
];

const RecipeForm = ({ mode = 'create' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [instructionsText, setInstructionsText] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Nutrition States
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if guest
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading]);

  // Fetch recipe data in edit mode
  useEffect(() => {
    if (mode === 'edit' && id) {
      const fetchEditData = async () => {
        try {
          const res = await axios.get(`/api/recipes/${id}`);
          const recipe = res.data;

          setTitle(recipe.title || '');
          setDescription(recipe.description || '');
          setIngredientsText(recipe.ingredients?.join('\n') || '');
          setInstructionsText(recipe.instructions?.join('\n') || '');
          setCategory(recipe.category || '');
          setDifficulty(recipe.difficulty || 'Easy');
          setPrepTimeMinutes(recipe.prepTimeMinutes || '');
          setCookTime(recipe.cookTime || '');
          setSelectedTags(recipe.tags || []);
          setCalories(recipe.calories || '');
          setProtein(recipe.protein || '');
          setCarbs(recipe.carbs || '');
          setFat(recipe.fat || '');
          if (recipe.image) {
            setImagePreview(recipe.image);
          }
        } catch (err) {
          console.error(err);
          setError('Failed to fetch recipe for editing.');
        }
      };
      fetchEditData();
    }
  }, [id, mode]);

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Parse ingredients & instructions from text area by line
    const ingredientsArray = ingredientsText.split('\n').map(i => i.trim()).filter(Boolean);
    const instructionsArray = instructionsText.split('\n').map(i => i.trim()).filter(Boolean);

    if (ingredientsArray.length === 0 || instructionsArray.length === 0) {
      setError('Please provide at least one ingredient and one instruction step.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('ingredients', JSON.stringify(ingredientsArray));
    formData.append('instructions', JSON.stringify(instructionsArray));
    formData.append('category', category);
    formData.append('difficulty', difficulty);
    formData.append('prepTimeMinutes', prepTimeMinutes ? Number(prepTimeMinutes) : 0);
    formData.append('cookTime', cookTime ? Number(cookTime) : 0);
    formData.append('tags', JSON.stringify(selectedTags));
    formData.append('calories', calories ? Number(calories) : 0);
    formData.append('protein', protein ? Number(protein) : 0);
    formData.append('carbs', carbs ? Number(carbs) : 0);
    formData.append('fat', fat ? Number(fat) : 0);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (mode === 'edit') {
        await axios.put(`/api/recipes/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        navigate(`/recipes/${id}`);
      } else {
        await axios.post('/api/recipes', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        navigate('/my-recipes');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error saving recipe. Make sure tags are valid predefined values.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card glass-panel p-4 animate-fade-in">
      <div className="text-center mb-4">
        <i className={`fa-solid ${mode === 'edit' ? 'fa-pen-to-square' : 'fa-pizza-slice'} text-gradient`} style={{ fontSize: '2.5rem' }}></i>
        <h2 className="mt-2 text-gradient">{mode === 'edit' ? 'Modify Your Recipe' : 'Add Gourmet Recipe'}</h2>
        <p className="text-muted">Share your cooking experience and details with the community</p>
      </div>

      {error && (
        <div className="alert alert-danger border-0 text-white" style={{ background: 'rgba(220, 53, 69, 0.2)' }}>
          <i className="fa-solid fa-triangle-exclamation mr-2"></i> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Left Column: Details */}
          <div className="col-md-6">
            <div className="form-group">
              <label className="text-muted small font-weight-bold">RECIPE TITLE *</label>
              <input 
                type="text" 
                className="form-control form-control-glass" 
                placeholder="e.g. Creamy Tuscan Salmon" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="text-muted small font-weight-bold">DESCRIPTION *</label>
              <textarea 
                className="form-control form-control-glass" 
                rows="3" 
                placeholder="Give a short backstory or taste summary..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="row">
              <div className="col-6">
                <div className="form-group">
                  <label className="text-muted small font-weight-bold">CATEGORY</label>
                  <input 
                    type="text" 
                    className="form-control form-control-glass" 
                    placeholder="e.g. Seafood, Salad" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <label className="text-muted small font-weight-bold">DIFFICULTY</label>
                  <select 
                    className="form-control form-control-glass" 
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-6">
                <div className="form-group">
                  <label className="text-muted small font-weight-bold">PREP TIME (MINS)</label>
                  <input 
                    type="number" 
                    className="form-control form-control-glass" 
                    placeholder="15" 
                    value={prepTimeMinutes}
                    onChange={(e) => setPrepTimeMinutes(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <label className="text-muted small font-weight-bold">COOK TIME (MINS)</label>
                  <input 
                    type="number" 
                    className="form-control form-control-glass" 
                    placeholder="25" 
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Nutrition Facts */}
            <label className="text-muted small font-weight-bold d-block mt-3 mb-1">NUTRITION STATS (PER SERVING)</label>
            <div className="row mb-3">
              <div className="col-3">
                <input type="number" className="form-control form-control-glass py-2" placeholder="Cals" value={calories} onChange={(e) => setCalories(e.target.value)} />
              </div>
              <div className="col-3">
                <input type="number" className="form-control form-control-glass py-2" placeholder="Protein (g)" value={protein} onChange={(e) => setProtein(e.target.value)} />
              </div>
              <div className="col-3">
                <input type="number" className="form-control form-control-glass py-2" placeholder="Carbs (g)" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
              </div>
              <div className="col-3">
                <input type="number" className="form-control form-control-glass py-2" placeholder="Fat (g)" value={fat} onChange={(e) => setFat(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Right Column: Ingredients, Instructions & Image */}
          <div className="col-md-6">
            <div className="form-group">
              <label className="text-muted small font-weight-bold">INGREDIENTS * (ONE PER LINE)</label>
              <textarea 
                className="form-control form-control-glass" 
                rows="4" 
                placeholder="2 fillets of fresh salmon&#10;1 tbsp olive oil&#10;2 cloves garlic, minced" 
                value={ingredientsText}
                onChange={(e) => setIngredientsText(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label className="text-muted small font-weight-bold">INSTRUCTIONS * (ONE STEP PER LINE)</label>
              <textarea 
                className="form-control form-control-glass" 
                rows="4" 
                placeholder="Pat salmon dry and season with salt.&#10;Heat oil in pan and sear salmon.&#10;Add minced garlic and baste." 
                value={instructionsText}
                onChange={(e) => setInstructionsText(e.target.value)}
                required
              ></textarea>
            </div>

            {/* Image Preview Upload */}
            <div className="form-group mb-4">
              <label className="text-muted small font-weight-bold">RECIPE PHOTO</label>
              <div className="custom-file mb-3">
                <input type="file" className="custom-file-input" id="recipeImage" accept="image/*" onChange={handleImageChange} />
                <label className="custom-file-label form-control-glass text-white bg-transparent" htmlFor="recipeImage">
                  {imageFile ? imageFile.name : 'Choose file'}
                </label>
              </div>
              {imagePreview && (
                <div className="rounded overflow-hidden border border-secondary" style={{ height: '150px' }}>
                  <img src={imagePreview} alt="Preview" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tags list checkboxes */}
        <div className="form-group mb-4">
          <label className="text-muted small font-weight-bold d-block mb-2">DIETARY TAGS</label>
          <div className="d-flex flex-wrap" style={{ gap: '8px' }}>
            {PREDEFINED_TAGS.map(tag => {
              const active = selectedTags.includes(tag);
              return (
                <button 
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`btn btn-sm ${active ? 'btn-success' : 'btn-outline-secondary'}`}
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="d-flex justify-content-end" style={{ gap: '15px' }}>
          <button 
            type="button" 
            className="btn btn-premium-secondary px-4 py-2"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-premium-primary px-5 py-2"
            disabled={loading}
          >
            {loading ? (
              <span><i className="fa-solid fa-spinner fa-spin mr-2"></i> Saving...</span>
            ) : (
              mode === 'edit' ? 'Update Recipe' : 'Add Recipe'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm;
