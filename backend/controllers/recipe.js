const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const Recipe = require('../models/recipeschema');
const upload = require('../middleware/upload');
const cache = require('../middleware/cache');
const invalidateCache = require('../utils/invalidcache');

const MealPlan = require('../models/MealPlan');

// GET / - List recipes (cached 60s)
router.get('/', cache(60), async (req, res) => {
    try {
        const { search, category, difficulty, tags, skip, limit } = req.query;
        const limitNum = Math.max(parseInt(limit) || 20, 1);
        const skipNum = Math.max(parseInt(skip) || 0, 0);

        let filter = {};
        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [{ title: regex }, { description: regex }];
        }
        if (category) filter.category = category;
        if (difficulty) filter.difficulty = difficulty;
        if (tags) {
            const tagsArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean);
            filter.tags = { $in: tagsArray };
        }

        const [total, recipes] = await Promise.all([
            Recipe.countDocuments(filter),
            Recipe.find(filter).skip(skipNum).limit(limitNum).sort({ createdAt: -1 }).lean()
        ]);

        res.status(200).json({
            success: true, skip: skipNum, limit: limitNum, total,
            totalPages: Math.ceil(total / limitNum),
            hasNextPage: skipNum + limitNum < total,
            hasPrevPage: skipNum > 0,
            count: recipes.length, data: recipes
        });
    } catch (err) {
        console.error('Error fetching recipes:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /my-recipes - Must be defined BEFORE /:id to avoid conflict
router.get('/my-recipes', verifyToken, cache(30), async (req, res) => {
    try {
        const { search, category, difficulty, tags, skip, limit } = req.query;
        const limitNum = Math.max(parseInt(limit) || 20, 1);
        const skipNum = Math.max(parseInt(skip) || 0, 0);
        let filter = { createdBy: req.user.id };
        if (search) {
            const r = new RegExp(search, 'i');
            filter.$or = [{ title: r }, { description: r }];
        }
        if (category) filter.category = category;
        if (difficulty) filter.difficulty = difficulty;
        if (tags) {
            const arr = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean);
            filter.tags = { $in: arr };
        }
        const [total, recipes] = await Promise.all([
            Recipe.countDocuments(filter),
            Recipe.find(filter).skip(skipNum).limit(limitNum).sort({ createdAt: -1 }).lean()
        ]);
        res.status(200).json({
            success: true, skip: skipNum, limit: limitNum, total,
            totalPages: Math.ceil(total / limitNum),
            hasNextPage: skipNum + limitNum < total,
            hasPrevPage: skipNum > 0,
            count: recipes.length, data: recipes
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /meal-plan - Fetch the user's weekly meal plan
// Must be defined BEFORE /:id to avoid conflict
router.get('/meal-plan', verifyToken, async (req, res) => {
    try {
        const meals = await MealPlan.find({ user: req.user.id })
            .populate('recipe', 'title image category calories protein carbs fat')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json(meals);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// DELETE /meal-plan/:id - Remove a meal plan entry
router.delete('/meal-plan/:id', verifyToken, async (req, res) => {
    try {
        const entry = await MealPlan.findById(req.params.id);
        if (!entry) return res.status(404).json({ message: 'Meal plan entry not found' });
        if (entry.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await MealPlan.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Removed from meal plan' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT /meal-plan/:id - Update a meal plan entry (e.g., move it to a different slot)
router.put('/meal-plan/:id', verifyToken, async (req, res) => {
    try {
        const { day, mealType } = req.body;
        if (!day || !mealType) {
            return res.status(400).json({ message: 'day and mealType are required' });
        }

        const entry = await MealPlan.findById(req.params.id);
        if (!entry) return res.status(404).json({ message: 'Meal plan entry not found' });
        if (entry.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        entry.day = day;
        entry.mealType = mealType;
        await entry.save();

        const populated = await MealPlan.findById(entry._id).populate('recipe', 'title image category calories protein carbs fat');
        res.status(200).json(populated);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /:id - Single recipe (cached 120s)
router.get('/:id', cache(120), async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id).populate('comments.userId', 'username');
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
        res.status(200).json(recipe);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST / - Create recipe → invalidate list cache
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
    let { title, description, ingredients, instructions, category, difficulty, prepTimeMinutes, cookTime, tags, calories, protein, carbs, fat } = req.body;

    if (!title || !description || !ingredients || !instructions)
        return res.status(400).json({ message: 'All fields are required' });

    if (typeof ingredients === 'string') {
        try { ingredients = JSON.parse(ingredients); }
        catch (_) { ingredients = ingredients.split(',').map(i => i.trim()).filter(Boolean); }
    }
    if (typeof instructions === 'string') {
        try { instructions = JSON.parse(instructions); }
        catch (_) { instructions = instructions.split('\n').map(i => i.trim()).filter(Boolean); }
    }
    if (typeof tags === 'string') {
        try { tags = JSON.parse(tags); }
        catch (_) { tags = tags.split(',').map(i => i.trim()).filter(Boolean); }
    }

    try {
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
        const { PREDEFINED_TAGS } = require('../utils/constants');
        if (tags && !Array.isArray(tags)) return res.status(400).json({ message: 'Tags must be an array' });
        if (tags && tags.some(t => !PREDEFINED_TAGS.includes(t))) return res.status(400).json({ message: 'Invalid tag(s) provided' });

        const recipe = new Recipe({
            title, description, ingredients, instructions,
            category, difficulty, prepTimeMinutes, cookTime,
            tags, image: imageUrl, createdBy: req.user.id,
            calories: Number(calories) || 0,
            protein: Number(protein) || 0,
            carbs: Number(carbs) || 0,
            fat: Number(fat) || 0
        });
        await recipe.save();

        await invalidateCache('cache:/api/recipes*');
        res.status(201).json(recipe);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


// PUT /:id - Update recipe fields → invalidate list + this recipe
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
    let { title, description, ingredients, instructions, category, difficulty, prepTimeMinutes, cookTime, tags, calories, protein, carbs, fat } = req.body;

    if (typeof ingredients === 'string') {
        try { ingredients = JSON.parse(ingredients); }
        catch (_) { ingredients = ingredients.split(',').map(i => i.trim()).filter(Boolean); }
    }
    if (typeof instructions === 'string') {
        try { instructions = JSON.parse(instructions); }
        catch (_) { instructions = instructions.split('\n').map(i => i.trim()).filter(Boolean); }
    }
    if (typeof tags === 'string') {
        try { tags = JSON.parse(tags); }
        catch (_) { tags = tags.split(',').map(i => i.trim()).filter(Boolean); }
    }

    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
        if (!recipe.createdBy || recipe.createdBy.toString() !== req.user.id)
            return res.status(403).json({ message: 'Not authorized' });

        Object.assign(recipe, { title, description, ingredients, instructions });
        if (category !== undefined) recipe.category = category;
        if (difficulty !== undefined) recipe.difficulty = difficulty;
        if (prepTimeMinutes !== undefined) recipe.prepTimeMinutes = prepTimeMinutes;
        if (cookTime !== undefined) recipe.cookTime = cookTime;
        if (tags !== undefined) recipe.tags = tags;
        if (calories !== undefined) recipe.calories = Number(calories) || 0;
        if (protein !== undefined) recipe.protein = Number(protein) || 0;
        if (carbs !== undefined) recipe.carbs = Number(carbs) || 0;
        if (fat !== undefined) recipe.fat = Number(fat) || 0;
        await recipe.save();

        await invalidateCache(`cache:/api/recipes/${req.params.id}`);
        await invalidateCache('cache:/api/recipes*');
        res.status(200).json(recipe);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT /:id/image - Update recipe image only
router.put('/:id/image', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
        if (!recipe.createdBy || recipe.createdBy.toString() !== req.user.id)
            return res.status(403).json({ message: 'Not authorized' });

        if (!req.file) return res.status(400).json({ message: 'No image file provided' });

        recipe.image = `/uploads/${req.file.filename}`;
        await recipe.save();

        await invalidateCache(`cache:/api/recipes/${req.params.id}`);
        await invalidateCache('cache:/api/recipes*');
        res.status(200).json(recipe);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// DELETE /:id/image - Remove recipe image without replacing it
router.delete('/:id/image', verifyToken, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
        if (!recipe.createdBy || recipe.createdBy.toString() !== req.user.id)
            return res.status(403).json({ message: 'Not authorized' });

        if (!recipe.image) return res.status(400).json({ message: 'This recipe has no image to delete' });

        recipe.image = '';
        await recipe.save();

        await invalidateCache(`cache:/api/recipes/${req.params.id}`);
        await invalidateCache('cache:/api/recipes*');
        res.status(200).json({ message: 'Image removed successfully', recipe });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// DELETE /:id - Delete recipe → invalidate cache
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
        if (!recipe.createdBy || recipe.createdBy.toString() !== req.user.id)
            return res.status(403).json({ message: 'Not authorized' });

        await Recipe.findByIdAndDelete(req.params.id);

        await invalidateCache(`cache:/api/recipes/${req.params.id}`);
        await invalidateCache('cache:/api/recipes*');
        res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /:id/rate
router.post('/:id/rate', async (req, res) => {
    const ratingValue = Number(req.body.value);
    if (!ratingValue || ratingValue < 1 || ratingValue > 5)
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

        // Get user identity: from token if logged in, otherwise from IP
        let identifier = (req.ip || '').replace(/^::ffff:/, '') || 'anonymous';
        const authHeader = req.header("Authorization");
        if (authHeader) {
            let token = authHeader;
            if (token.startsWith("Bearer ")) {
                token = token.slice(7).trim();
            }
            try {
                const jwt = require("jsonwebtoken");
                const decoded = jwt.verify(token, process.env.SECRET_KEY);
                if (decoded && decoded.id) {
                    identifier = decoded.id;
                }
            } catch (err) {
                // Ignore invalid tokens for rating and default to IP
            }
        }

        const existing = recipe.ratings.find(r => r.user && r.user.toString() === identifier.toString());
        if (existing) { existing.value = ratingValue; }
        else { recipe.ratings.push({ user: identifier, value: ratingValue }); }

        recipe.averageRating = recipe.ratings.reduce((s, r) => s + r.value, 0) / recipe.ratings.length;
        await recipe.save();

        await invalidateCache(`cache:/api/recipes/${req.params.id}`);
        await invalidateCache('cache:/api/recipes*');
        res.status(200).json({ message: 'Rating saved', ratings: recipe.ratings, averageRating: recipe.averageRating });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /:id/comments - Get comments for a recipe
router.get('/:id/comments', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id).populate('comments.userId', 'username');
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
        res.status(200).json(recipe.comments || []);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /:id/comment
router.post('/:id/comment', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

        const { text, parentId } = req.body;
        if (!text) return res.status(400).json({ message: 'Comment text is required' });

        // Get user identity if logged in
        let userId = null;
        const authHeader = req.header("Authorization");
        if (authHeader) {
            let token = authHeader;
            if (token.startsWith("Bearer ")) {
                token = token.slice(7).trim();
            }
            try {
                const jwt = require("jsonwebtoken");
                const decoded = jwt.verify(token, process.env.SECRET_KEY);
                if (decoded && decoded.id) {
                    userId = decoded.id;
                }
            } catch (err) {
                // Ignore invalid tokens for comments
            }
        }

        recipe.comments.push({ userId: userId || null, text, date: new Date(), parentId: parentId || null });
        await recipe.save();

        const updatedRecipe = await Recipe.findById(req.params.id).populate('comments.userId', 'username');
        const newComment = updatedRecipe.comments[updatedRecipe.comments.length - 1];

        await invalidateCache(`cache:/api/recipes/${req.params.id}`);
        res.status(201).json({ message: 'Comment added', comment: newComment });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// DELETE /:id/comment/:commentId
router.delete('/:id/comment/:commentId', verifyToken, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

        const comment = recipe.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        if (comment.userId.toString() !== req.user.id)
            return res.status(403).json({ message: 'Not authorized to delete this comment' });

        recipe.comments.pull(req.params.commentId);
        await recipe.save();

        await invalidateCache(`cache:/api/recipes/${req.params.id}`);
        res.status(200).json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /:id/like - Toggle like/unlike (no login required, identified by IP)
router.post('/:id/like', async (req, res) => {
    try {
        const visitorId = (req.ip || '').replace(/^::ffff:/, '');

        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

        const alreadyLiked = recipe.likes.includes(visitorId);

        if (alreadyLiked) {
            recipe.likes.pull(visitorId);
        } else {
            recipe.likes.push(visitorId);
        }

        await recipe.save();

        await invalidateCache(`cache:/api/recipes/${req.params.id}`);
        await invalidateCache('cache:/api/recipes*');

        res.status(200).json({
            message: alreadyLiked ? 'Recipe unliked' : 'Recipe liked',
            likesCount: recipe.likes.length,
            liked: !alreadyLiked,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /meal-plan - Add a recipe to the user's meal plan
router.post('/meal-plan', verifyToken, async (req, res) => {
    try {
        const { recipeId, day, mealType } = req.body;

        if (!recipeId || !day || !mealType) {
            return res.status(400).json({ message: 'recipeId, day, and mealType are required' });
        }

        const mealPlan = await MealPlan.create({
            user: req.user.id,
            recipe: recipeId,
            day,
            mealType,
        });

        const populated = await MealPlan.findById(mealPlan._id).populate('recipe', 'title image category calories protein carbs fat');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;