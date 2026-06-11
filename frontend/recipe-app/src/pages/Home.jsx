// Force redeploy timestamp: 2026-06-11T23:28Z
import React, { useState } from "react";
import "./Home.css";
import AllRecipes from "../components/AllRecipes";
import FilterBar from "../components/FilterBar";

function Home({ onShareClick }) {
    const [filters, setFilters] = useState({ category: '', difficulty: '', tags: '' });

    return (
        <div className="home-page">

            {/* ── Hero Banner ── */}
            <div className="home-banner">
                <img src="/img1.png" alt="Delicious food" className="home-banner-img" />
                <div className="home-banner-overlay">
                    <div className="home-banner-content">
                        <p className="home-banner-tag">🍴 Welcome to CookPad</p>
                        <h1 className="home-banner-title">
                            Discover & Share <br />
                            <span>Amazing Recipes</span>
                        </h1>
                        <p className="home-banner-subtitle">
                            Join our cooking community. Explore thousands of recipes<br />
                            from around the world — all in one place.
                        </p>
                        <button className="home-banner-btn" onClick={onShareClick}>
                            + Share Your Recipe
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Main: Sidebar + Recipes ── */}
            <div className="home-content-row">
                <aside className="home-sidebar">
                    <FilterBar onChange={setFilters} currentFilters={filters} />
                </aside>
                <div className="home-recipes-area">
                    <AllRecipes filters={filters} />
                </div>
            </div>

        </div>
    );
}

export default Home;
