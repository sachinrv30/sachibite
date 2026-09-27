/**
 * Shopping List Service
 *
 * Consolidates ingredients across all recipes in a user's
 * weekly meal plan into one grouped and deduplicated list.
 */

/**
 * Normalize ingredient names for consistent comparisons.
 */
const normalize = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

/**
 * Build a consolidated shopping list from recipes.
 *
 * @param {Array} recipes
 * @param {Array} availableIngredientNames
 * @returns {Array}
 */
function buildShoppingListFromRecipes(
  recipes,
  availableIngredientNames = []
) {
  const available = new Set(
    availableIngredientNames
      .map(normalize)
      .filter(Boolean)
  );

  const merged = new Map();

  for (const recipe of recipes || []) {
    for (const ingredient of recipe.ingredients || []) {
      const name = normalize(ingredient.name);

      if (!name) {
        continue;
      }

      /*
       * Optional ingredients are still included in the shopping list
       * because the user may want them available.
       */
      const alreadyAvailable = [...available].some(
        (availableIngredient) =>
          availableIngredient === name ||
          availableIngredient.includes(name) ||
          name.includes(availableIngredient)
      );

      if (alreadyAvailable) {
        continue;
      }

      const unit = normalize(ingredient.unit);
      const key = `${name}__${unit}`;

      const quantity = Number(ingredient.quantity);

      const safeQuantity =
        Number.isFinite(quantity) && quantity > 0
          ? quantity
          : 1;

      if (merged.has(key)) {
        const existing = merged.get(key);

        existing.quantity += safeQuantity;
      } else {
        merged.set(key, {
          name,
          quantity: safeQuantity,
          unit: ingredient.unit?.trim() || '',
          category:
            ingredient.category?.trim().toLowerCase() ||
            'other',
          purchased: false,
          custom: false,
        });
      }
    }
  }

  return Array.from(merged.values()).sort((a, b) => {
    const categoryCompare =
      a.category.localeCompare(b.category);

    if (categoryCompare !== 0) {
      return categoryCompare;
    }

    return a.name.localeCompare(b.name);
  });
}

module.exports = {
  buildShoppingListFromRecipes,
};