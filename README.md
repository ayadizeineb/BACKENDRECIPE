# 🍳 Cookpad MERN Recipe Application

A premium, modern recipe sharing and discovery application built on the MERN stack (MongoDB, Express, React, Node.js). 

This application features a card-based visual overlay recipe grid, interactive star ratings, full commenting functionality with user ownership, and an AI-powered culinary assistant to suggest variations, ingredients, and pairings.

---

## 🚀 Key Features

- **Visual Recipe Gallery**: Grid design featuring overlay recipe titles over high-quality images.
- **Dynamic Routing**: Fast page transitions using React Router to show full recipe details.
- **Interactive Ratings**: Standardized, responsive hover-enabled 5-star rating system.
- **Robust Comment System**: Users can comment on recipes and delete their own comments with pop-up confirmations.
- **AI Sous Chef**: ChatGPT-integrated AI assistant suggesting healthy substitutes, prep timing tips, wine pairings, and variations.
- **User Authentication**: Secure JWT-based registration and login system with persistent sessions.

---

## 📁 Repository Structure

```text
MERN/
├── backend/
│   ├── config/             # Database connection setup
│   ├── controllers/        # Express route handlers (Recipe, User)
│   ├── middleware/         # Auth verify, Multer image upload, Rate limiter, Error handler
│   ├── models/             # Mongoose schemas (Recipe, User)
│   ├── routes/             # Route declarations forwarding to controllers (AI, Recipe, User)
│   ├── tests/              # Jest and Supertest integration test suite
│   ├── uploads/            # Local directory for user-uploaded recipe images
│   ├── utils/              # Constants and helper modules (OpenAI wrapper)
│   └── server.js           # Server startup script
└── frontend/recipe-app/
    ├── public/             # Static public assets
    ├── src/
    │   ├── components/     # Reusable UI components (Rating, Comments, AIAssistant, Navbar, etc.)
    │   ├── pages/          # Page components (Home, RecipeDetailPage, Add/Edit pages)
    │   ├── utils/          # Helpers (Category icons, etc.)
    │   ├── App.jsx         # App router and modal bindings
    │   └── main.jsx        # App entry point
    └── package.json        # Frontend dependencies (Vite, React 19)
```

---

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js**: `v20.x` or higher
- **MongoDB**: A running local instance or a MongoDB Atlas URI connection string
- **OpenAI API Key**: Required for the AI Sous Chef assistant

### Step 1: Clone and Configure the Backend

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install server dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Update the environment variables in `.env`:
   - `PORT`: Server port (default: 3000)
   - `MONGO_URI`: MongoDB connection string
   - `SECRET_KEY`: Random string for signing JWT tokens
   - `FRONTEND_URL`: URL of the frontend (default: `https://backendrecipe-1.onrender.com`)
   - `OPENAI_API_KEY`: Your OpenAI Secret Key

### Step 2: Configure the Frontend

1. Navigate to the `frontend/recipe-app/` directory:
   ```bash
   cd frontend/recipe-app
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```

---

## 🏃 Running the Application

### 1. Start the Backend Server
From the `backend/` folder, run:
```bash
npm run dev
```
*Note: The backend automatically seeds initial test recipes (Chocolate Chip Cookies, Tuscan Chicken, Blueberry Pancakes) if the database is empty.*

### 2. Start the Frontend Server
From the `frontend/recipe-app/` folder, run:
```bash
npm run dev
```
Open [https://backendrecipe-1.onrender.com](https://backendrecipe-1.onrender.com) in your browser to view the application.

---

## 🧪 Testing

### Backend Unit & Integration Tests
We use **Jest** and **Supertest** to test the API routes without making real network requests or requiring a database connection (models are mocked).

From the `backend/` directory, run:
```bash
npm test
```

This tests:
- Recipe Schema validation (valid fields, tags constraint).
- Recipe details endpoint (`GET /api/recipes/:id`) with populated commenter names.
- Comment posting and validation (`POST /api/recipes/:id/comment`).
- Comment deletion ownership verification (`DELETE /api/recipes/:id/comment/:commentId`).
- AI Assistant responses.

---

## 🔌 API Documentation

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/recipes` | Fetch paginated list of all recipes | No |
| **POST** | `/api/recipes` | Create a new recipe (multipart/form-data) | Yes |
| **GET** | `/api/recipes/:id` | Fetch specific recipe with populated comments | No |
| **PUT** | `/api/recipes/:id` | Update a recipe | Yes |
| **DELETE** | `/api/recipes/:id` | Delete a recipe | Yes |
| **GET** | `/api/recipes/:id/comments` | Retrieve comments for a recipe with user profiles | No |
| **POST** | `/api/recipes/:id/comment` | Add a comment to a recipe | Yes |
| **DELETE** | `/api/recipes/:id/comment/:commentId` | Delete a comment (owner only) | Yes |
| **POST** | `/api/recipes/:id/rate` | Submit or update star rating (1-5) | Yes |
| **POST** | `/api/ai/assist` | Ask the AI Sous Chef about a recipe | Yes |
| **POST** | `/api/users/` | Register a new user | No |
| **POST** | `/api/users/signin` | Sign in / Authenticate | No |
