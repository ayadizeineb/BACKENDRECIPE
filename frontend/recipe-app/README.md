# Recipe App – MERN Stack

## Overview
This is a **full‑stack MERN (MongoDB, Express, React, Node.js) recipe application** that lets users:
- View all recipes (with images)
- Add a new recipe (including photo upload)
- Edit an existing recipe
- Delete recipes
- Share a recipe (via the "Share" button which redirects to the Add page)

The project is split into two parts:
- **backend** – Node/Express server (`backend/`) handling API routes, MongoDB connection, and image upload via **multer**.
- **frontend** – Vite‑powered React app (`frontend/recipe-app/`) with page‑based navigation.

## Tech Stack
- **Frontend**: React 18, Vite, React Router v6, CSS (custom styling, glass‑morphism effects)
- **Backend**: Node.js, Express, Mongoose, Multer (for image handling)
- **Database**: MongoDB (local or Atlas)
- **Styling**: Vanilla CSS with HSL color palette, subtle hover animations, responsive grid.

## Repository Layout
```
MERN/
├─ backend/                # Express server
│   ├─ controllers/        # recipe controller (CRUD)
│   ├─ middleware/        # upload.js (multer config)
│   ├─ models/            # Mongoose schema (recipeschema.js)
│   ├─ routes/            # User routes (UserRoute.js)
│   ├─ server.js          # entry point
│   └─ .env               # DB connection string, JWT secret
│
└─ frontend/recipe-app/   # React client (Vite)
    ├─ src/
    │   ├─ components/    # Navbar, Footer, AllRecipes, IputForm, etc.
    │   ├─ pages/         # Home, AllRecipesPage, AddRecipePage, EditRecipePage
    │   ├─ App.jsx        # Routing & auth handling
    │   ├─ main.jsx       # React entry point
    │   └─ index.css      # Global styles
    └─ vite.config.js
```

## Backend API Endpoints
| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/recipes` | Get all recipes |
| `GET` | `/api/recipes/:id` | Get a single recipe |
| `POST` | `/api/recipes` | Create a recipe (multipart/form‑data, image optional) |
| `PUT` | `/api/recipes/:id` | Update a recipe (multipart/form‑data) |
| `DELETE` | `/api/recipes/:id` | Delete a recipe |

Authentication is done via a JWT stored in `localStorage` (header `Authorization: Bearer <token>`).  The login modal (handled in `Modal.jsx`) sets this token.

## Frontend Routing (React Router)
```tsx
<Route path="/" index element={<Home onShareClick={handleShareClick} />} />
<Route path="/myRecipes" element={<AllRecipesPage />} />
<Route path="/add-recipe" element={<AddRecipePage />} />
<Route path="/edit-recipe/:id" element={<EditRecipePage />} />
```
- **Home** – landing page with a hero section and a preview of all recipes.
- **AllRecipesPage** – displays `AllRecipes` component (grid of recipe cards with Edit/Delete buttons).
- **AddRecipePage** – renders `IputForm` with no `initialValues`; used for creating a new recipe.
- **EditRecipePage** – fetches recipe data by `id`, passes it to `IputForm` for editing.

## Core Components
| Component | Purpose |
|-----------|---------|
| **Navbar** | Shows navigation, login/logout, and Share button. |
| **Footer** | Simple footer text. |
| **AllRecipes** | Fetches and displays the list of recipes; handles delete & navigation to edit page. |
| **IputForm** | Unified form for **Add** and **Edit**. Uses `initialValues` prop to pre‑fill fields when editing. Handles image upload via `FormData`. |
| **Modal** | Login modal that sets the JWT token. |
| **Home** | Hero layout and embeds `AllRecipes` for a quick preview. |

## Image Upload
- Frontend sends a `FormData` object with fields `title`, `description`, `ingredients`, `instructions`, and optionally `image`.
- Backend `middleware/upload.js` configures Multer to store images in `uploads/` and makes them accessible via `http://localhost:3000/<filePath>`.
- The `recipe.image` field stores the relative path, which is used in `<img src={...}>`.

## Running the Project
1️⃣ **Clone & install dependencies**
```bash
# backend
git clone <repo-url>
cd MERN/backend
npm install

# frontend
git clone <repo-url>
cd ../frontend/recipe-app
npm install
```

2️⃣ **Set up environment**
- Create a `.env` file in `backend/`:
```
MONGO_URI=mongodb://localhost:27017/recipeapp   # or your Atlas URI
JWT_SECRET=yourSecretKey
PORT=3000
```
- Ensure the `uploads/` folder exists (Multer will create it on first upload).

3️⃣ **Start servers**
```bash
# Backend (in MERN/backend)
npm run dev   # runs server.js on http://localhost:3000

# Frontend (in MERN/frontend/recipe-app)
npm run dev   # Vite dev server on https://backendrecipe-1.onrender.com
```
Open the Vite URL in a browser. You should see the Home page, can log in, add recipes, edit, delete, and see images.

## Code‑Clean‑Up Highlights (Implemented)
- Restored the **Edit** route (`/edit-recipe/:id`).
- Consolidated the form logic into a single `IputForm` component for both add & edit.
- Removed duplicate/unused imports and dead code.
- Added consistent indentation, comments, and JSDoc blocks.
- Refactored CSS for card hover effects, glass‑morphism style, and dark‑mode support.
- Updated routing order and added clear comment sections in `App.jsx`.
- Ensured the login modal works with the navigation flow.

## Future Improvements (optional)
- Add pagination or infinite scroll for the recipe list.
- Implement user‑specific recipes and role‑based access.
- Use a UI library (e.g., Tailwind or Chakra) for faster styling while preserving the premium look.
- Deploy backend to a cloud provider and configure CORS for production.

---
*Generated by Antigravity – your AI coding assistant.*
