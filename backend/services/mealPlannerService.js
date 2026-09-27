/**
 * Smart Auto Meal Planner Service
 *
 * Generates a weekly meal plan based on:
 * - Available ingredients
 * - Dietary preferences
 * - Allergies
 * - Favorite cuisines
 * - Maximum preparation time
 *
 * The planner also reduces excessive repetition of recipes.
 */

const { rankRecipes } = require('./recipeMatchingService');

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const SLOTS = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
];

/**
 * Generate a weekly meal plan.
 *
 * @param {Array} recipes
 * @param {Object} options
 * @param {Array} options.ingredients
 * @param {Object} options.preferences
 * @param {Array} config.onlyDays
 * @param {Array} config.onlySlots
 */
function generateWeeklyPlan(
  recipes,
  {
    ingredients = [],
    preferences = {},
  } = {},
  {
    onlySlots = SLOTS,
    onlyDays = DAYS,
  } = {}
) {
  const usedCounts = new Map();

  const selectedDays = DAYS.filter((day) =>
    onlyDays.includes(day)
  );

  const selectedSlots = SLOTS.filter((slot) =>
    onlySlots.includes(slot)
  );

  const plan = {};

  // Always return the complete Monday-Sunday structure.
  DAYS.forEach((day) => {
    plan[day] = {
      breakfast: null,
      lunch: null,
      dinner: null,
      snack: null,
    };
  });

  for (const day of selectedDays) {
    for (const slot of selectedSlots) {
      // Match recipe category with meal slot.
      const candidates = recipes.filter(
        (recipe) => recipe.category === slot
      );

      if (!candidates.length) {
        continue;
      }

      // Rank candidates using the matching engine.
      const ranked = rankRecipes(
        candidates,
        {
          ingredients,
          preferences,
        }
      );

      // Never select recipes with allergy conflicts.
      const safeRecipes = ranked.filter(
        (result) => !result.allergyConflict
      );

      if (!safeRecipes.length) {
        continue;
      }

      /*
       * Reduce repetition.
       *
       * Every previous use reduces the recipe's score.
       * This means recipes can still repeat when the catalogue
       * is small, but excessive repetition is discouraged.
       */
      const adjusted = safeRecipes
        .map((result) => {
          const recipeId = String(
            result.recipe._id
          );

          const usageCount =
            usedCounts.get(recipeId) || 0;

          const repetitionPenalty =
            usageCount * 20;

          return {
            ...result,
            adjustedScore:
              result.rankScore -
              repetitionPenalty,
          };
        })
        .sort(
          (a, b) =>
            b.adjustedScore -
            a.adjustedScore
        );

      const selected = adjusted[0];

      if (!selected) {
        continue;
      }

      const recipeId = String(
        selected.recipe._id
      );

      plan[day][slot] =
        selected.recipe._id;

      usedCounts.set(
        recipeId,
        (usedCounts.get(recipeId) || 0) + 1
      );
    }
  }

  return plan;
}

module.exports = {
  generateWeeklyPlan,
  DAYS,
  SLOTS,
};