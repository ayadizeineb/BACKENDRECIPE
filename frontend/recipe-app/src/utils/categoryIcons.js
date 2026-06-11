// src/utils/categoryIcons.js
// ------------------------------------------------------------
//  Category Icons Mapping
// ------------------------------------------------------------
// This module centralises the mapping between a recipe's `category`
// and a representative emoji/icon. Keeping the mapping in a single
// location makes it easy to add, rename or remove categories without
// touching UI components.
// ------------------------------------------------------------
export const CATEGORY_ICONS = {
  Vegan: '🥦',
  Dessert: '🍰',
  Breakfast: '🥞',
  Lunch: '🥪',
  Dinner: '🍽️',
  Snack: '🍿',
  // fallback icon for any unknown category
  default: '📁',
};
