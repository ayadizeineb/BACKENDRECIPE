import React, { useState, useEffect } from "react";
import "./IputForm.css";

const PREDEFINED_TAGS = [
    "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free",
    "Quick", "Healthy", "Comfort", "Holiday", "Kids", "Low-Carb",
];

const CATEGORY_OPTIONS = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Other"];

function IputForm({ onAdd, initialValues = {} }) {
    const isEdit = Boolean(initialValues._id);
    const API_BASE = "";

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [ingredients, setIngredients] = useState([""]);
    const [instructions, setInstructions] = useState([""]);
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState([]);
    const [prepHours, setPrepHours] = useState("");
    const [prepMinutes, setPrepMinutes] = useState("");

    // Image state
    const [imageFile, setImageFile] = useState(null);   // new file chosen by user
    const [imagePreview, setImagePreview] = useState("");     // shown in preview
    const [removeImage, setRemoveImage] = useState(false);  // user wants to delete

    // Populate when editing
    useEffect(() => {
        if (!initialValues?.title) return;
        setTitle(initialValues.title || "");
        setDescription(initialValues.description || "");
        setIngredients(Array.isArray(initialValues.ingredients) ? initialValues.ingredients : [""]);
        setInstructions(Array.isArray(initialValues.instructions) ? initialValues.instructions : [""]);
        setCategory(initialValues.category || "");
        setTags(initialValues.tags || []);
        if (initialValues.prepTimeMinutes) {
            setPrepHours(String(Math.floor(initialValues.prepTimeMinutes / 60) || ""));
            setPrepMinutes(String(initialValues.prepTimeMinutes % 60 || ""));
        }
        setImagePreview(initialValues.image || "");
        setRemoveImage(false);
        setImageFile(null);
    }, [initialValues]);

    // Dynamic list handlers
    const handleIngredientChange = (i, v) => { const u = [...ingredients]; u[i] = v; setIngredients(u); };
    const addIngredient = () => setIngredients([...ingredients, ""]);
    const removeIngredient = (i) => setIngredients(ingredients.filter((_, idx) => idx !== i));

    const handleInstructionChange = (i, v) => { const u = [...instructions]; u[i] = v; setInstructions(u); };
    const addInstruction = () => setInstructions([...instructions, ""]);
    const removeInstruction = (i) => setInstructions(instructions.filter((_, idx) => idx !== i));

    const toggleTag = (tag) =>
        setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

    // Image handlers
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setRemoveImage(false);
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview("");
        setRemoveImage(true);
    };

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const headers = { Authorization: "Bearer " + token };

        const parsedIngredients = ingredients.map(i => i.trim()).filter(Boolean);
        const parsedInstructions = instructions.map(i => i.trim()).filter(Boolean);
        const totalPrepMinutes = (Number(prepHours) || 0) * 60 + (Number(prepMinutes) || 0);

        try {
            // STEP 1: save recipe fields (no image)
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("ingredients", JSON.stringify(parsedIngredients));
            formData.append("instructions", JSON.stringify(parsedInstructions));
            if (category) formData.append("category", category);
            if (tags.length) formData.append("tags", JSON.stringify(tags));
            if (totalPrepMinutes) formData.append("prepTimeMinutes", totalPrepMinutes);

            const endpoint = isEdit
                ? `${API_BASE}/api/recipes/${initialValues._id}`
                : `${API_BASE}/api/recipes`;

            const res = await fetch(endpoint, {
                method: isEdit ? "PUT" : "POST",
                headers,
                body: formData,
            });
            if (!res.ok) throw new Error("Failed to save recipe fields");
            const savedRecipe = await res.json();
            const recipeId = savedRecipe._id;

            // STEP 2: handle image separately
            if (imageFile) {
                // New image chosen → PUT /:id/image
                const imgForm = new FormData();
                imgForm.append("image", imageFile);
                const imgRes = await fetch(`${API_BASE}/api/recipes/${recipeId}/image`, {
                    method: "PUT",
                    headers,
                    body: imgForm,
                });
                if (!imgRes.ok) throw new Error("Failed to upload image");
            } else if (isEdit && removeImage) {
                // User deleted image → DELETE /:id/image
                const delRes = await fetch(`${API_BASE}/api/recipes/${recipeId}/image`, {
                    method: "DELETE",
                    headers,
                });
                if (!delRes.ok) throw new Error("Failed to remove image");
            }
            // else: no image change → nothing to do

            if (onAdd) onAdd(savedRecipe);

            if (!isEdit) {
                setTitle(""); setDescription("");
                setIngredients([""]); setInstructions([""]);
                setCategory(""); setTags([]);
                setPrepHours(""); setPrepMinutes("");
                setImageFile(null); setImagePreview("");
                setRemoveImage(false);
            }

        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to save recipe.");
        }
    };

    return (
        <div className="form-wrapper">
            <div className="input-form-card">
                <h2 className="form-title">{isEdit ? "Edit Your Recipe" : "Share Your Favorite Recipe"}</h2>
                <p className="form-subtitle">Fill in the details below to share your culinary masterpiece.</p>

                <form className="input-form" onSubmit={handleSubmit}>

                    {/* Title */}
                    <div className="form-group">
                        <label className="form-label">Recipe Title</label>
                        <input type="text" placeholder="e.g. Classic Italian Lasagna"
                            value={title} onChange={(e) => setTitle(e.target.value)}
                            className="form-input" required />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">Brief Description</label>
                        <textarea placeholder="Describe your dish..."
                            value={description} onChange={(e) => setDescription(e.target.value)}
                            className="form-input" required />
                    </div>

                    {/* Category & Prep Time */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)}
                                className="form-select" required>
                                <option value="" disabled>Select a category</option>
                                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Preparation Time</label>
                            <div className="time-inputs-container">
                                <div className="time-input-wrapper">
                                    <input type="number" min="0" placeholder="0"
                                        value={prepHours} onChange={(e) => setPrepHours(e.target.value)}
                                        className="form-input" />
                                    <span className="time-unit-label">hrs</span>
                                </div>
                                <div className="time-input-wrapper">
                                    <input type="number" min="0" max="59" placeholder="0"
                                        value={prepMinutes} onChange={(e) => setPrepMinutes(e.target.value)}
                                        className="form-input" />
                                    <span className="time-unit-label">mins</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="form-group">
                        <label className="form-label">Recipe Tags</label>
                        <div className="tag-container">
                            {PREDEFINED_TAGS.map(tag => (
                                <label key={tag} className="tag-checkbox-label">
                                    <input type="checkbox" checked={tags.includes(tag)} onChange={() => toggleTag(tag)} />
                                    <span className="tag-pill">{tag}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Ingredients */}
                    <div className="dynamic-section">
                        <div className="section-header">
                            <span className="section-title">Ingredients</span>
                            <button type="button" className="btn-add-item" onClick={addIngredient}>
                                <span>+</span> Add Ingredient
                            </button>
                        </div>
                        <div className="dynamic-list">
                            {ingredients.map((ing, index) => (
                                <div key={index} className="dynamic-row">
                                    <input type="text" value={ing}
                                        placeholder={`Ingredient ${index + 1}`}
                                        onChange={(e) => handleIngredientChange(index, e.target.value)}
                                        className="form-input dynamic-input" required />
                                    {ingredients.length > 1 && (
                                        <button type="button" className="dynamic-remove"
                                            onClick={() => removeIngredient(index)}>✕</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="dynamic-section">
                        <div className="section-header">
                            <span className="section-title">Instructions / Steps</span>
                            <button type="button" className="btn-add-item" onClick={addInstruction}>
                                <span>+</span> Add Step
                            </button>
                        </div>
                        <div className="dynamic-list">
                            {instructions.map((step, index) => (
                                <div key={index} className="dynamic-row">
                                    <textarea value={step}
                                        placeholder={`Step ${index + 1} description...`}
                                        onChange={(e) => handleInstructionChange(index, e.target.value)}
                                        className="form-input dynamic-input" required />
                                    {instructions.length > 1 && (
                                        <button type="button" className="dynamic-remove"
                                            onClick={() => removeInstruction(index)}>✕</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="form-group upload-zone-wrapper">
                        <label className="form-label">Recipe Photo</label>

                        {/* Show preview + action buttons when an image exists */}
                        {imagePreview ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                <img
                                    src={imagePreview}
                                    alt="Recipe Preview"
                                    className="image-preview"
                                    style={{ width: "100%", maxHeight: "220px", objectFit: "cover", borderRadius: "10px" }}
                                />
                                <div style={{ display: "flex", gap: "0.75rem" }}>
                                    {/* Change image — triggers file picker */}
                                    <label style={{
                                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                                        gap: "6px", padding: "0.55rem 1rem", borderRadius: "8px", cursor: "pointer",
                                        background: "#3b82f6", color: "white", fontWeight: 600, fontSize: "0.9rem",
                                        border: "none",
                                    }}>
                                        🔄 Change Photo
                                        <input type="file" accept="image/*" onChange={handleImageChange}
                                            style={{ display: "none" }} />
                                    </label>

                                    {/* Delete image */}
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        style={{
                                            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                                            gap: "6px", padding: "0.55rem 1rem", borderRadius: "8px", cursor: "pointer",
                                            background: "#ef4444", color: "white", fontWeight: 600, fontSize: "0.9rem",
                                            border: "none",
                                        }}
                                    >
                                        🗑️ Delete Photo
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* No image yet — show upload zone */}
                                <label className="upload-zone-label">
                                    <span className="upload-icon">📸</span>
                                    <span className="upload-text-primary">Click to upload image</span>
                                    <span className="upload-text-secondary">PNG, JPG or WEBP (Max 5MB)</span>
                                    <input type="file" accept="image/*" onChange={handleImageChange}
                                        style={{ display: "none" }} />
                                </label>
                                {isEdit && removeImage && (
                                    <p style={{ color: "#e53e3e", fontSize: "0.85rem", marginTop: "0.4rem" }}>
                                        ⚠️ Image will be removed on save.
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="form-submit-container">
                        <button type="submit" className="btn-submit">
                            {isEdit ? "Update Recipe" : "Publish Recipe"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default IputForm;