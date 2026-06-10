# Recipe App Extension Plan

## Goal Description
Extend the current MERN recipe app to include richer recipe metadata (category, difficulty, prep/cook times, tags), user interaction features (ratings, comments, search/filter, infinite scroll), performance improvements (Redis caching), and an AI recipe assistant.

## User Review Required
- **Data model changes**: Adding new fields will require schema migrations. Confirm if existing data can be altered in‑place.
- **Authentication**: Ratings/comments will need user identity. Do you already have auth (JWT) in place? If not, we need to add it.
- **AI integration**: Which provider (OpenAI, Anthropic, local model) should be used? Provide API key?
- **Redis**: Do you have a Redis server available locally or in the cloud?

## Open Questions
- Preferred categories list (e.g., "Breakfast", "Dessert", etc.)?
- Difficulty scale (e.g., 1‑5 or strings like "Easy", "Medium", "Hard")?
- Time units (minutes only?)?
- Tag format (free‑text string array)?
- Rating system (1‑5 stars, average stored in DB)?
- Comment nesting (simple flat list per recipe)?
- Search scope (title, ingredients, tags, category)?
- Desired AI features (suggest ingredients, generate steps, answer queries)?

## Proposed Changes
---
### 1. Backend – Model Updates (`models/Recipe.js`)
- Add fields: `category: String`, `difficulty: String`, `prepTime: Number`, `cookTime: Number`, `tags: [String]`, `ratings: [{ userId: ObjectId, value: Number }]`, `comments: [{ userId: ObjectId, text: String, date: Date }]`.
- Update Mongoose schema accordingly.
- Adjust validation in `controllers/recipe.js` for create/update.

---
### 2. Backend – API Endpoints
- **GET /api/recipes**: support query params `search`, `category`, `tags`, `difficulty`, pagination (`skip`, `limit`).
- **POST /api/recipes/:id/rate**: body `{ value }` – add or update rating for the authenticated user.
- **POST /api/recipes/:id/comment**: body `{ text }` – add comment.
- **GET /api/recipes/:id/comments**: list comments.
- Add Redis caching middleware for GET list and detail routes (cache key based on query string).

---
### 3. Backend – Redis Integration
- Install `redis` npm package.
- Create `utils/cache.js` with `getCache`, `setCache`, `invalidateCache` helpers.
- Wrap list/detail routes with cache lookup.
- Provide config in `.env` for `REDIS_URL`.

---
### 4. Frontend – Form Enhancements (`src/components/IputForm.jsx` & `.css`)
- Add dropdown for **Category** and **Difficulty**.
- Add numeric inputs for **Prep Time** and **Cook Time** (minutes).
- Add tag input (comma‑separated, stored as array).
- Adjust `initialValues` handling to populate new fields.
- Include new fields in `FormData` when submitting.
- Update CSS for new inputs (consistent styling).

---
### 5. Frontend – Rating & Comment UI (`src/components/RecipeDetail.jsx` – new component)
- Star rating component (click to set rating, send POST to `/rate`).
- Comment list with textarea for new comment, submit to `/comment`.
- Display average rating.

---
### 6. Frontend – Search / Filter UI (`src/components/RecipeList.jsx` – enhance)
- Search bar (title / ingredient tokens).
- Filter dropdowns for Category, Difficulty, Tags.
- Pagination controls with “Load More” (infinite scroll) – use `IntersectionObserver` to fetch next page.
- Update API call to include query params.

---
### 7. Frontend – Infinite Scroll Implementation
- Replace static pagination with lazy loading: when user scrolls near bottom, fetch next batch (`skip`/`limit`).
- Show loading spinner.

---
### 8. AI Recipe Assistant (`src/components/AIAssistant.jsx` – new component)
- Simple chat‑style UI.
- On submit, send user prompt + selected recipe data to backend endpoint `/api/ai/assist`.
- Backend routes to call OpenAI (or chosen provider) using `openai` npm package.
- Return generated suggestions (e.g., ingredient swaps, step improvements).

---
### 9. Backend – AI Endpoint
- `POST /api/ai/assist` expects `{ recipeId, prompt }`.
- Retrieve recipe, compose prompt, call OpenAI API, return response.
- Secure with rate limiting.

---
### 10. Testing & Validation
- Add unit tests for new model fields and API routes (using Jest/Supertest).
- Update existing frontend tests (if any) to cover new form fields.
- Manual QA: create, edit, rate, comment, search, infinite scroll, AI assistant.

## Verification Plan
- **Automated**: run `npm test` for backend after changes.
- **Manual**: Open app at `http://localhost:5174`, create a recipe with all new fields, verify list filtering, rating, comments, infinite scroll, and AI suggestions.
- Check Redis cache keys via `redis-cli` (optional).

---
**Next Steps**
1. Confirm answers to the open questions above.
2. Once approved, create a detailed task breakdown (`task.md`).
3. Proceed with incremental implementation, starting with backend schema changes.
