/**
 * Recipe Matching Service
 *
 * Calculates how well a recipe matches a user's available ingredients
 * and optionally considers:
 * - Dietary preferences
 * - Favorite cuisines
 * - Maximum preparation time
 * - Allergies
 */

/**
 * Normalize a string for reliable comparisons.
 */
const normalize = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

/**
 * Check whether an ingredient is available.
 *
 * Examples:
 * "tomato"       ↔ "tomatoes"
 * "chicken"      ↔ "chicken breast"
 * "olive oil"    ↔ "extra virgin olive oil"
 */
const ingredientMatches = (recipeIngredient, availableIngredient) => {
  const recipeName = normalize(recipeIngredient);
  const availableName = normalize(availableIngredient);

  if (!recipeName || !availableName) {
    return false;
  }

  return (
    recipeName === availableName ||
    recipeName.includes(availableName) ||
    availableName.includes(recipeName)
  );
};

/**
 * Core ingredient match score.
 *
 * Only non-optional ingredients are counted when calculating
 * the percentage.
 */
function calculateMatch(recipe, availableIngredients = []) {
  const available = availableIngredients
    .map(normalize)
    .filter(Boolean);

  const required = (recipe.ingredients || []).filter(
    (ingredient) => !ingredient.optional
  );

  const total = required.length || 1;

  const availableList = [];
  const missingList = [];

  required.forEach((ingredient) => {
    const isAvailable = available.some((availableIngredient) =>
      ingredientMatches(ingredient.name, availableIngredient)
    );

    if (isAvailable) {
      availableList.push(ingredient);
    } else {
      missingList.push(ingredient);
    }
  });

  const matchScore = Math.round(
    (availableList.length / total) * 100
  );

  return {
    matchScore,
    availableIngredients: availableList,
    missingIngredients: missingList,
  };
}

/**
 * Determine whether a recipe conflicts with any allergy.
 */
const hasAllergyConflict = (recipe, allergies = []) => {
  const normalizedAllergies = allergies
    .map(normalize)
    .filter(Boolean);

  if (!normalizedAllergies.length) {
    return false;
  }

  const recipeIngredients = (recipe.ingredients || []).map(
    (ingredient) => normalize(ingredient.name)
  );

  const recipeAllergens = (recipe.allergens || []).map(
    normalize
  );

  return normalizedAllergies.some((allergy) => {
    const ingredientConflict = recipeIngredients.some(
      (ingredient) =>
        ingredient.includes(allergy) ||
        allergy.includes(ingredient)
    );

    const allergenConflict = recipeAllergens.some(
      (allergen) =>
        allergen.includes(allergy) ||
        allergy.includes(allergen)
    );

    return ingredientConflict || allergenConflict;
  });
};

/**
 * Rank recipes based on:
 *
 * 1. Ingredient match
 * 2. Dietary preference
 * 3. Favorite cuisine
 * 4. Maximum preparation time
 * 5. Popularity
 *
 * Recipes containing an allergy are heavily penalized and
 * marked with allergyConflict: true.
 */
function rankRecipes(
  recipes,
  {
    ingredients = [],
    preferences = {},
  } = {}
) {
  const {
    diet = [],
    favoriteCuisines = [],
    maxPrepTime,
    allergies = [],
  } = preferences;

  const normalizedDiet = diet
    .map(normalize)
    .filter(Boolean);

  const normalizedCuisines = favoriteCuisines
    .map(normalize)
    .filter(Boolean);

  return recipes
    .map((recipe) => {
      const {
        matchScore,
        availableIngredients,
        missingIngredients,
      } = calculateMatch(recipe, ingredients);

      const allergyConflict = hasAllergyConflict(
        recipe,
        allergies
      );

      let bonus = 0;

      // Dietary preference bonus
      if (
        normalizedDiet.length &&
        recipe.dietaryTags?.some((tag) =>
          normalizedDiet.includes(normalize(tag))
        )
      ) {
        bonus += 8;
      }

      // Favorite cuisine bonus
      if (
        normalizedCuisines.length &&
        normalizedCuisines.includes(normalize(recipe.cuisine))
      ) {
        bonus += 6;
      }

      // Preparation-time bonus
      const totalTime =
        Number(recipe.prepTime || 0) +
        Number(recipe.cookTime || 0);

      if (
        Number.isFinite(Number(maxPrepTime)) &&
        Number(maxPrepTime) > 0 &&
        totalTime <= Number(maxPrepTime)
      ) {
        bonus += 4;
      }

      // Popularity bonus
      bonus += Math.min(
        Number(recipe.popularity || 0),
        5
      );

      /*
       * Allergy conflicts receive a strong penalty.
       *
       * We still return the recipe so the frontend can explain
       * why it should be avoided.
       */
      if (allergyConflict) {
        bonus -= 100;
      }

      return {
        recipe,
        matchScore,
        availableIngredients,
        missingIngredients,
        allergyConflict,
        rankScore: matchScore + bonus,
      };
    })
    .sort((a, b) => {
      // Safe recipes first
      if (
        a.allergyConflict !== b.allergyConflict
      ) {
        return a.allergyConflict ? 1 : -1;
      }

      // Then highest score
      return b.rankScore - a.rankScore;
    });
}

module.exports = {
  calculateMatch,
  rankRecipes,
};