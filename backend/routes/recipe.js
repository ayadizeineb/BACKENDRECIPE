// backend/routes/recipe.js
const router = require('express').Router();
const recipeController = require('../controllers/recipe');

// Forward all recipe routes to the controller router
router.use('/', recipeController);







module.exports = router;
