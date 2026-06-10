const mongoose = require('mongoose');
const { PREDEFINED_TAGS } = require('../utils/constants');
const recipeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    ingredients: { type: [String], required: true },
    instructions: { type: [String], required: true },
    category: { type: String },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
    prepTimeMinutes: { type: Number },
    cookTime: { type: Number },
    tags: [{ type: String, enum: PREDEFINED_TAGS }],
    image: { type: String },
    ratings: [{
        user: { type: String, required: true },
        value: { type: Number, min: 1, max: 5, required: true }
    }],
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        date: { type: Date, default: Date.now },
        parentId: { type: mongoose.Schema.Types.ObjectId, default: null }
    }],
    averageRating: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    likes: { type: [String], default: [] }
});

const Recipe = mongoose.model('Recipe', recipeSchema);

Recipe.seedIfEmpty = async () => {
    try {
        const count = await Recipe.countDocuments();
        if (count === 0) {
            console.log('Seeding default recipes...');
            const defaultRecipes = [
                {
                    title: "Chocolate Chip Cookies",
                    description: "Classic chewy chocolate chip cookies with golden brown crispy edges and soft, melty centers.",
                    ingredients: [
                        "2 cups all-purpose flour",
                        "1/2 tsp baking soda",
                        "1/2 tsp salt",
                        "3/4 cup unsalted butter, melted",
                        "1 cup brown sugar",
                        "1/2 cup white sugar",
                        "1 tbsp vanilla extract",
                        "1 egg + 1 yolk",
                        "1 cup semi-sweet chocolate chips"
                    ],
                    instructions: [
                        "Preheat oven to 325°F (165°C) and line baking sheets with parchment paper.",
                        "In a medium bowl, whisk together flour, baking soda, and salt.",
                        "In a large bowl, beat melted butter, brown sugar, and white sugar until smooth.",
                        "Beat in the vanilla, egg, and egg yolk until light and creamy.",
                        "Gradually stir in the dry ingredients until just blended, then fold in chocolate chips by hand.",
                        "Drop cookie dough by rounded tablespoons onto sheets and bake for 15-17 minutes until edges are golden."
                    ],
                    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=600"
                },
                {
                    title: "Creamy Tuscan Chicken",
                    description: "Pan-seared chicken breasts bathed in a rich garlic, sun-dried tomato, and spinach cream sauce. A restaurant-quality meal in 30 minutes!",
                    ingredients: [
                        "2 large chicken breasts, halved lengthwise",
                        "1 tbsp olive oil",
                        "1 cup heavy cream",
                        "1/2 cup chicken broth",
                        "1 tsp garlic powder",
                        "1 cup fresh spinach, chopped",
                        "1/2 cup sun-dried tomatoes, drained",
                        "1/2 cup grated parmesan cheese"
                    ],
                    instructions: [
                        "Season chicken breasts with salt, pepper, and garlic powder on both sides.",
                        "Heat olive oil in a large skillet over medium-high heat and sear chicken for 5 minutes per side until golden and cooked through. Transfer to a plate.",
                        "In the same skillet, add chicken broth, heavy cream, garlic powder, and bring to a simmer.",
                        "Stir in the sun-dried tomatoes and spinach. Let simmer for 3 minutes until spinach is wilted.",
                        "Stir in the parmesan cheese until the sauce thickens.",
                        "Return chicken to the skillet, spoon sauce over, and cook for 2 minutes to heat through."
                    ],
                    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=600"
                },
                {
                    title: "Fluffy Blueberry Pancakes",
                    description: "Light and fluffy buttermilk pancakes bursting with fresh blueberries, served with butter and warm maple syrup.",
                    ingredients: [
                        "1.5 cups all-purpose flour",
                        "3.5 tsp baking powder",
                        "1 tsp salt",
                        "1 tbsp sugar",
                        "1.25 cups milk",
                        "1 egg",
                        "3 tbsp butter, melted",
                        "1 cup fresh blueberries"
                    ],
                    instructions: [
                        "In a large bowl, sift together flour, baking powder, salt, and sugar.",
                        "Make a well in the center and pour in milk, egg, and melted butter; mix until smooth.",
                        "Heat a lightly oiled griddle or frying pan over medium-high heat.",
                        "Pour or scoop the batter onto the griddle, using approximately 1/4 cup for each pancake.",
                        "Drop fresh blueberries onto the batter.",
                        "Brown on both sides and serve hot with maple syrup."
                    ],
                    image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&q=80&w=600"
                },
                {
                    title: "Perfect Vegan Chocolate Chip Cookies",
                    description: "Crispy on the edges, chewy inside, made without any animal products.",
                    ingredients: [
                        "2 cups all-purpose flour",
                        "1/2 tsp baking soda",
                        "1/2 tsp salt",
                        "3/4 cup coconut oil, melted",
                        "1 cup brown sugar",
                        "1/2 cup maple syrup",
                        "1 tbsp vanilla extract",
                        "1/4 cup unsweetened applesauce",
                        "1 cup vegan chocolate chips"
                    ],
                    instructions: [
                        "Preheat oven to 350°F (175°C) and line a baking sheet with parchment paper.",
                        "In a bowl whisk together flour, baking soda, and salt.",
                        "In another bowl combine melted coconut oil, brown sugar, maple syrup, vanilla, and applesauce until smooth.",
                        "Mix wet ingredients into dry ingredients until just combined.",
                        "Fold in vegan chocolate chips.",
                        "Drop spoonfuls onto the sheet and bake 10-12 minutes until edges are golden."
                    ],
                    category: "Vegan",
                    tags: ["Vegan"],
                    image: "https://images.unsplash.com/photo-1588196749595-8c540ab2c41d?auto=format&fit=crop&q=80&w=600"
                }
            ];

            await Recipe.insertMany(defaultRecipes);
            console.log('Seeded successfully!');
        }
    } catch (err) {
        console.error('Failed to seed database:', err);
    }
};

module.exports = Recipe;
