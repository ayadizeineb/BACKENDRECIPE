import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AllRecipes.css';

const AllRecipes = ({ userOnly = false, filters = {} }) => {
  const { category = '', difficulty = '', tags = '' } = filters;

  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [startsWith, setStartsWith] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [limit] = useState(9);
  const [totalPages, setTotalPages] = useState(0);
  const [likeState, setLikeState] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const basePath = userOnly ? '/api/recipes/my-recipes' : '/api/recipes';
        const urlObj = new URL(basePath, window.location.origin);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(startsWith && { startsWith }),
          ...(searchTerm && { search: searchTerm }),
          ...(category && { category }),
          ...(difficulty && { difficulty }),
          ...(tags && { tags }),
        });

        urlObj.search = params.toString();

        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await axios.get(urlObj.toString(), { headers });
        const { data, totalPages: tp } = res.data;

        setRecipes(data);
        setTotalPages(tp);

        // Init like counts from server — liked always false (IP not resolvable client-side)
        const initialLikeState = {};
        data.forEach((recipe) => {
          initialLikeState[recipe._id] = {
            liked: false,
            count: recipe.likesCount ?? recipe.likes?.length ?? 0,
          };
        });
        setLikeState(initialLikeState);

      } catch (err) {
        console.error('Failed to load recipes:', err);
      }
    };

    fetchRecipes();
  }, [page, startsWith, searchTerm, userOnly, category, difficulty, tags, limit]);

  // ---------------------------------------------------------------------------
  // Like — NO optimistic update: server is single source of truth.
  // Optimistic update caused double-count because:
  //   1. Local state added +1 immediately
  //   2. Server sync also set count to +1
  // Since IP isn't readable client-side, we can't predict the toggle → just wait.
  // ---------------------------------------------------------------------------
  const handleLike = async (e, recipeId) => {
    e.stopPropagation();
    try {
      const res = await axios.post(`/api/recipes/${recipeId}/like`);
      // Trust only what the server returns
      setLikeState(prev => ({
        ...prev,
        [recipeId]: {
          liked: res.data.liked,
          count: res.data.likesCount,
        },
      }));
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };



  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchQuery);
    setPage(1);
  };

  return (
    <>
      <section className="recipes">
        <div className="search-header-container">
          <div className="search-logo-wrapper">
            <div className="search-logo-icon">🍳</div>
            <h1 className="search-logo-text">cook<span>pad</span></h1>
          </div>

          <form onSubmit={handleSearchSubmit} className="search-bar-form">
            <div className="search-input-wrapper">
              <span className="search-input-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by recipe or ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-field"
              />
            </div>
            <button type="submit" className="search-submit-btn">Search</button>
          </form>
        </div>

        <div className="alphabet-filter-wrapper">
          <button
            onClick={() => { setStartsWith(''); setPage(1); }}
            className={`alphabet-btn ${startsWith === '' ? 'active' : ''}`}
          >All</button>

          {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map((letter) => (
            <button
              key={letter}
              onClick={() => { setStartsWith(letter); setPage(1); }}
              className={`alphabet-btn ${startsWith === letter ? 'active' : ''}`}
            >{letter}</button>
          ))}
        </div>

        <div className="recipes-grid">
          {recipes.length === 0 ? (
            <p className="recipes-status">No recipes found. Try another search or create one!</p>
          ) : (
            recipes.map((recipe) => {
              const ls = likeState[recipe._id] || { liked: false, count: 0 };


              return (
                <div
                  key={recipe._id}
                  className="recipe-card-overlay"
                  onClick={() => navigate(`/recipe/${recipe._id}`)}
                >
                  <img
                    src={recipe.image || 'https://via.placeholder.com/300x180?text=No+Image'}
                    alt={recipe.title}
                    className="recipe-card-overlay-image"
                  />
                  <div className="recipe-card-overlay-gradient" />
                  <h3 className="recipe-card-overlay-title">{recipe.title}</h3>
                  {recipe.category && (
                    <span className="recipe-card-overlay-category">{recipe.category}</span>
                  )}



                  {/* ── Bottom-right: Like button ── */}
                  <button
                    className={`recipe-like-btn ${ls.liked ? 'liked' : ''}`}
                    onClick={(e) => handleLike(e, recipe._id)}
                    aria-label={ls.liked ? 'Unlike recipe' : 'Like recipe'}
                  >
                    {ls.liked ? '❤️' : '🤍'}
                    <span className="recipe-like-count">{ls.count}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      <div className="pagination">
        <button className="pagination-btn" onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>← Prev</button>
        <span className="pagination-info">Page {page} of {totalPages}</span>
        <button className="pagination-btn" onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages || totalPages === 0}>Next →</button>
      </div>
    </>
  );
};

export default AllRecipes;