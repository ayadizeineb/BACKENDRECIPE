import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import RecipeDetailPage from './pages/RecipeDetailPage';
import ProfilePage from './pages/ProfilePage';
import AllRecipesPage from './pages/AllRecipesPage';
import MealPlanPage from './pages/MealPlanPage';
import AiAssistantPage from './pages/AiAssistantPage';

import EditRecipePage from './pages/EditRecipePage';
import AddRecipePage from './pages/AddRecipePage';
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Footer from './components/Footer';
import Modal from './components/Modal';
import './App.css';
import Home from './pages/Home.jsx';
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("token"));
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();

  const handleShareClick = () => {
    if (isAuthenticated) {
      navigate("/add-recipe");
    } else {
      setIsLoginOpen(true);
    }
  };

  const handleLoginSuccess = (token) => {
    if (token) {
      localStorage.setItem("token", token);
    }
    setIsAuthenticated(true);
    setIsLoginOpen(false);
    navigate("/myRecipes");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <div className="app-container">
      <Navbar
        isAuthenticated={isAuthenticated}
        onShareClick={handleShareClick}
        onLoginClick={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
      />
      <main className="main-content">
        <Routes>
          <Route path="/" index element={<Home onShareClick={handleShareClick} />} />
          <Route
            path="/myRecipes"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} onUnauthenticated={() => setIsLoginOpen(true)}>
                <AllRecipesPage userOnly={true} />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-recipe"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} onUnauthenticated={() => setIsLoginOpen(true)}>
                <AddRecipePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-recipe/:id"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} onUnauthenticated={() => setIsLoginOpen(true)}>
                <EditRecipePage />
              </PrivateRoute>
            }
          />
          <Route path="/recipe/:id" element={<RecipeDetailPage />} />
          <Route path="/recipes" element={<AllRecipesPage />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} onUnauthenticated={() => setIsLoginOpen(true)}>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/meal-plan"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} onUnauthenticated={() => setIsLoginOpen(true)}>
                <MealPlanPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/ai-assistant"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} onUnauthenticated={() => setIsLoginOpen(true)}>
                <AiAssistantPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
      <Footer />

      {/* Login Modal */}
      <Modal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;