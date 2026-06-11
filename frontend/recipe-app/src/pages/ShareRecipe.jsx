import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import IputForm from "../components/IputForm";
import "./ShareRecipe.css";

function ShareRecipe({ isAuthenticated, onLoginClick }) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/");
            onLoginClick();
        }
    }, [isAuthenticated, navigate, onLoginClick]);

    if (!isAuthenticated) return null;

    return (
        <div className="share-recipe-container">
            <div className="share-recipe-card">
                <button className="back-btn" onClick={() => navigate("/")}>
                    ← Back to Home
                </button>
                <IputForm onAdd={() => navigate("/")} />
            </div>
        </div>
    );
}

export default ShareRecipe;
