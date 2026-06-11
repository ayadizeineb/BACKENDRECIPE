import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar({ isAuthenticated, onShareClick, onLoginClick, onLogout }) {
    return (
        <nav className="navbar">
            <div className="logo">
                <Link to="/" className="logo-link">
                    <span className="logo-icon">🍳</span>
                    <span className="logo-text">cook<span className="logo-accent">pad</span></span>
                </Link>
            </div>
            <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                <li><a href="/ ">About</a></li>
                <li><a href="/">Contact</a></li>
                {isAuthenticated && (
                    <>
                        <li><Link to="/myRecipes">My Recipes</Link></li>
                        <li><Link to="/meal-plan">Meal Plan</Link></li>
                        <li><Link to="/ai-assistant">AI Assistant</Link></li>
                    </>
                )}
                <li className="nav-btn" onClick={onShareClick}>Share your recipe</li>
                {isAuthenticated ? (
                    <li className="nav-btn nav-btn-cta" onClick={onLogout}>Logout</li>
                ) : (
                    <li className="nav-btn nav-btn-cta" onClick={onLoginClick}>Login</li>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;