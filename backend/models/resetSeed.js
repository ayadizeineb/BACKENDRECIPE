// resetSeed.js – drop existing recipes collection and reseed with N fake docs (default 10000)
// Usage: node models/resetSeed.js [count]
// Example: node models/resetSeed.js 20000

require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const Recipe = require('./recipeschema');
const { PREDEFINED_TAGS } = require('../utils/constants');

function fakeRecipe() {
  const ingredientCount = faker.number.int({ min: 5, max: 15 });
  const instructionCount = faker.number.int({ min: 3, max: 8 });
  return {
    title: faker.lorem.sentence(3),
    description: faker.lorem.paragraph(),
    ingredients: Array.from({ length: ingredientCount }, () =>
      faker.lorem.words(faker.number.int({ min: 2, max: 5 }))
    ),
    instructions: Array.from({ length: instructionCount }, () => faker.lorem.sentence()),
    prepTimeMinutes: faker.number.int({ min: 5, max: 60 }),
    cookTime: faker.number.int({ min: 10, max: 120 }),
    image: `https://picsum.photos/seed/${faker.string.uuid()}/600/400`,
    category: faker.helpers.arrayElement(['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Other']),
    tags: faker.helpers.arrayElements(PREDEFINED_TAGS, faker.number.int({ min: 1, max: 3 })),
    createdAt: new Date()
  };
}

async function run() {
  const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/recipesDB';
  const COUNT = parseInt(process.argv[2], 10) || 10;

  console.log(`Connecting to ${DB_URI}`);
  await mongoose.connect(DB_URI);

  console.log('Dropping existing recipes collection (if present)…');
  try {
    await Recipe.collection.drop();
    console.log('Collection dropped');
  } catch (e) {
    if (e.codeName !== 'NamespaceNotFound') console.error(e);
  }

  console.log(`Generating ${COUNT.toLocaleString()} fake recipes…`);
  const batchSize = 5000;
  let inserted = 0;
  while (inserted < COUNT) {
    const remaining = COUNT - inserted;
    const curBatch = Math.min(batchSize, remaining);
    const docs = Array.from({ length: curBatch }, fakeRecipe);
    await Recipe.insertMany(docs, { ordered: false });
    inserted += curBatch;
    console.log(`Inserted ${inserted}/${COUNT}`);
  }

  console.log('Seeding complete');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
