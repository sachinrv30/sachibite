import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  Users,
  Flame,
  Heart,
  Printer,
  Share2,
  Plus,
  Minus,
  CheckCircle2,
  ShoppingCart,
  CalendarPlus,
  ChefHat,
  ArrowLeft,
  Sparkles,
  CircleCheck,
} from 'lucide-react';

import { PageLoader } from '../components/Loader';
import ErrorState from '../components/ErrorState';
import AllergyWarning from '../components/AllergyWarning';
import RecipeImage from '../components/RecipeImage';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RecipeDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  /* ============================================================
     STATE
  ============================================================ */

  const [recipe, setRecipe] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [servings, setServings] = useState(2);

  const [isFavorite, setIsFavorite] = useState(false);

  const [addingToShopping, setAddingToShopping] =
    useState(false);

  const [addingToPlan, setAddingToPlan] =
    useState(false);

  const [checkedIngredients, setCheckedIngredients] =
    useState([]);

  const [completedSteps, setCompletedSteps] =
    useState([]);

  /* ============================================================
     LOAD RECIPE
  ============================================================ */

  const loadRecipe = async () => {
    setLoading(true);
    setError('');

    try {
      const response =
        await api.get(`/recipes/${id}`);

      const recipeData =
        response.data?.data;

      if (!recipeData) {
        throw new Error('Recipe not found');
      }

      setRecipe(recipeData);

      setServings(
        recipeData.servings || 2
      );

      setCheckedIngredients([]);
      setCompletedSteps([]);

      /* Load favorite status */

      if (user) {
        try {
          const favoritesResponse =
            await api.get('/favorites');

          const favorites =
            favoritesResponse.data?.data || [];

          setIsFavorite(
            favorites.some(
              (item) => item._id === id
            )
          );
        } catch (favoriteError) {
          console.error(
            'Favorite loading error:',
            favoriteError
          );

          setIsFavorite(false);
        }
      } else {
        setIsFavorite(false);
      }
    } catch (err) {
      console.error(
        'Recipe loading error:',
        err
      );

      setError(
        'This recipe could not be loaded. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipe();
  }, [id, user]);

  /* ============================================================
     FAVORITE
  ============================================================ */

  const toggleFavorite = async () => {
    if (!user) {
      showToast(
        'Log in to save your favorite recipes.',
        'info'
      );

      return;
    }

    try {
      if (isFavorite) {
        await api.delete(
          `/favorites/${id}`
        );

        setIsFavorite(false);

        showToast(
          'Removed from favorites.',
          'info'
        );
      } else {
        await api.post(
          `/favorites/${id}`
        );

        setIsFavorite(true);

        showToast(
          'Recipe added to favorites!',
          'success'
        );
      }
    } catch (err) {
      console.error(
        'Favorite error:',
        err
      );

      showToast(
        'Could not update favorites.',
        'error'
      );
    }
  };

  /* ============================================================
     SHOPPING LIST
  ============================================================ */

  const addToShoppingList = async () => {
    if (!user) {
      showToast(
        'Log in to use the shopping list.',
        'info'
      );

      return;
    }

    if (!recipe?.ingredients?.length) {
      showToast(
        'No ingredients available.',
        'info'
      );

      return;
    }

    setAddingToShopping(true);

    try {
      await Promise.all(
        recipe.ingredients.map(
          (ingredient) =>
            api.post(
              '/shopping-list/items',
              {
                name: ingredient.name,
                quantity:
                  Math.round(
                    (ingredient.quantity || 0) *
                      (servings /
                        recipe.servings) *
                      100
                  ) / 100,
                unit: ingredient.unit,
                category:
                  ingredient.category,
              }
            )
        )
      );

      showToast(
        'Ingredients added to your shopping list!',
        'success'
      );
    } catch (err) {
      console.error(
        'Shopping list error:',
        err
      );

      showToast(
        'Could not update your shopping list.',
        'error'
      );
    } finally {
      setAddingToShopping(false);
    }
  };

  /* ============================================================
     MEAL PLANNER
  ============================================================ */

  const addToMealPlan = async () => {
    if (!user) {
      showToast(
        'Log in to use the meal planner.',
        'info'
      );

      return;
    }

    /*
      We keep this button safe because your current
      project may use a specific meal-planner endpoint.
      It navigates the user to the planner where the
      recipe can be scheduled using your existing flow.
    */

    setAddingToPlan(true);

    try {
      showToast(
        'Opening your Meal Planner...',
        'success'
      );
    } finally {
      setAddingToPlan(false);
    }
  };

  /* ============================================================
     SHARE
  ============================================================ */

  const shareRecipe = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: recipe?.title || 'SachiBite Recipe',
          text:
            recipe?.description ||
            'Check out this recipe on SachiBite.',
          url,
        });

        return;
      }

      await navigator.clipboard?.writeText(url);

      showToast(
        'Recipe link copied!',
        'success'
      );
    } catch (err) {
      if (
        err?.name !== 'AbortError'
      ) {
        showToast(
          'Could not share this recipe.',
          'error'
        );
      }
    }
  };

  /* ============================================================
     PRINT
  ============================================================ */

  const printRecipe = () => {
    window.print();
  };

  /* ============================================================
     INGREDIENT CHECKLIST
  ============================================================ */

  const toggleIngredient = (index) => {
    setCheckedIngredients(
      (previous) =>
        previous.includes(index)
          ? previous.filter(
              (item) => item !== index
            )
          : [...previous, index]
    );
  };

  const resetIngredients = () => {
    setCheckedIngredients([]);
  };

  /* ============================================================
     STEP CHECKLIST
  ============================================================ */

  const toggleStep = (index) => {
    setCompletedSteps(
      (previous) =>
        previous.includes(index)
          ? previous.filter(
              (item) => item !== index
            )
          : [...previous, index]
    );
  };

  const resetSteps = () => {
    setCompletedSteps([]);
  };

  /* ============================================================
     LOADING / ERROR
  ============================================================ */

  if (loading) {
    return <PageLoader />;
  }

  if (error || !recipe) {
    return (
      <ErrorState
        title="Recipe unavailable"
        message={
          error ||
          'We could not find this recipe.'
        }
        onRetry={loadRecipe}
        showHome
        showBack
      />
    );
  }

  /* ============================================================
     CALCULATIONS
  ============================================================ */

  const baseServings =
    recipe.servings || 1;

  const scale =
    servings / baseServings;

  const totalTime =
    (recipe.prepTime || 0) +
    (recipe.cookTime || 0);

  const nutrition =
    recipe.nutrition || {};

  const ingredientProgress =
    recipe.ingredients?.length
      ? Math.round(
          (checkedIngredients.length /
            recipe.ingredients.length) *
            100
        )
      : 0;

  const instructionProgress =
    recipe.instructions?.length
      ? Math.round(
          (completedSteps.length /
            recipe.instructions.length) *
            100
        )
      : 0;

  const hasAllergyConflict =
    Boolean(
      user?.allergies?.length &&
        recipe.ingredients?.some(
          (ingredient) =>
            user.allergies.some(
              (allergy) =>
                ingredient.name
                  .toLowerCase()
                  .includes(
                    allergy.toLowerCase()
                  )
            )
        )
    );

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <main className="page-enter pb-24">

      {/* ======================================================
          BACK BUTTON
      ====================================================== */}

      <section className="section pt-6">

        <Link
          to="/recipes"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-slate-500
            hover:text-brand-600
            transition-colors
          "
        >
          <ArrowLeft size={16} />

          Back to recipes
        </Link>

      </section>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="section mt-6">

        <div
          className="
            grid
            lg:grid-cols-[1.15fr_0.85fr]
            gap-8
            lg:gap-12
            items-stretch
          "
        >

          {/* IMAGE */}

          <div
            className="
              relative
              overflow-hidden
              rounded-[2rem]
              min-h-[360px]
              lg:min-h-[620px]
              bg-slate-100
              dark:bg-slate-900
              shadow-2xl
              shadow-slate-900/10
            "
          >

            <RecipeImage
              src={recipe.image}
              alt={recipe.title}
              className="
                w-full
                h-full
                min-h-[360px]
                lg:min-h-[620px]
                object-cover
              "
            />

            {/* Image overlay */}

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-t
                from-black/55
                via-transparent
                to-black/5
                pointer-events-none
              "
            />

            {/* Top actions */}

            <div
              className="
                absolute
                top-5
                left-5
                right-5
                flex
                justify-between
                items-center
              "
            >

              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-white/90
                  dark:bg-slate-900/90
                  backdrop-blur
                  px-4
                  py-2
                  text-xs
                  font-bold
                  text-slate-700
                  dark:text-slate-200
                  shadow-lg
                "
              >
                <Sparkles
                  size={14}
                  className="text-brand-600"
                />

                SachiBite Recipe
              </span>

              <button
                type="button"
                onClick={toggleFavorite}
                className="
                  w-11
                  h-11
                  rounded-full
                  bg-white/95
                  dark:bg-slate-900/95
                  backdrop-blur
                  flex
                  items-center
                  justify-center
                  shadow-lg
                  transition-all
                  hover:scale-105
                "
                aria-label={
                  isFavorite
                    ? 'Remove from favorites'
                    : 'Add to favorites'
                }
              >

                <Heart
                  size={20}
                  className={
                    isFavorite
                      ? 'text-red-500 fill-red-500'
                      : 'text-slate-700 dark:text-slate-200'
                  }
                />

              </button>

            </div>

            {/* Bottom image information */}

            <div
              className="
                absolute
                bottom-5
                left-5
                right-5
                flex
                flex-wrap
                gap-2
              "
            >

              {recipe.cuisine && (
                <span
                  className="
                    rounded-full
                    bg-black/45
                    backdrop-blur
                    px-3
                    py-1.5
                    text-xs
                    font-semibold
                    text-white
                    capitalize
                  "
                >
                  {recipe.cuisine}
                </span>
              )}

              {recipe.category && (
                <span
                  className="
                    rounded-full
                    bg-black/45
                    backdrop-blur
                    px-3
                    py-1.5
                    text-xs
                    font-semibold
                    text-white
                    capitalize
                  "
                >
                  {recipe.category}
                </span>
              )}

            </div>

          </div>

          {/* HERO CONTENT */}

          <div className="flex flex-col justify-center py-2">

            {/* Dietary tags */}

            {recipe.dietaryTags?.length > 0 && (
              <div
                className="
                  flex
                  flex-wrap
                  gap-2
                  mb-5
                "
              >

                {recipe.dietaryTags.map(
                  (tag) => (
                    <span
                      key={tag}
                      className="
                        chip
                        capitalize
                      "
                    >
                      {tag}
                    </span>
                  )
                )}

              </div>
            )}

            {/* Title */}

            <h1
              className="
                font-display
                text-4xl
                sm:text-5xl
                lg:text-6xl
                font-extrabold
                tracking-tight
                leading-[1.05]
                text-slate-900
                dark:text-white
              "
            >
              {recipe.title}
            </h1>

            {/* Description */}

            <p
              className="
                text-base
                sm:text-lg
                leading-8
                text-slate-500
                dark:text-slate-400
                mt-6
                max-w-2xl
              "
            >
              {recipe.description}
            </p>

            {/* Quick stats */}

            <div
              className="
                grid
                grid-cols-2
                sm:grid-cols-4
                gap-3
                mt-8
              "
            >

              {[
                {
                  icon: Clock,
                  value: `${totalTime} min`,
                  label: 'Total time',
                },
                {
                  icon: Users,
                  value: recipe.servings,
                  label: 'Servings',
                },
                {
                  icon: Flame,
                  value: `${nutrition.calories || 0}`,
                  label: 'Calories',
                },
                {
                  icon: ChefHat,
                  value:
                    recipe.difficulty ||
                    'Easy',
                  label: 'Difficulty',
                },
              ].map(
                (stat) => {
                  const Icon =
                    stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className="
                        rounded-2xl
                        border
                        border-slate-200
                        dark:border-slate-800
                        bg-white
                        dark:bg-slate-900
                        p-4
                      "
                    >

                      <Icon
                        size={18}
                        className="
                          text-brand-600
                          mb-3
                        "
                      />

                      <p
                        className="
                          font-bold
                          text-sm
                          capitalize
                          text-slate-900
                          dark:text-white
                        "
                      >
                        {stat.value}
                      </p>

                      <p
                        className="
                          text-xs
                          text-slate-400
                          mt-1
                        "
                      >
                        {stat.label}
                      </p>

                    </div>
                  );
                }
              )}

            </div>

            {/* Allergy warning */}

            {hasAllergyConflict && (
              <div className="mt-6">
                <AllergyWarning />
              </div>
            )}

            {/* Actions */}

            <div
              className="
                flex
                flex-wrap
                gap-3
                mt-8
              "
            >

              <button
                type="button"
                onClick={toggleFavorite}
                className={
                  isFavorite
                    ? 'btn-primary'
                    : 'btn-outline'
                }
              >

                <Heart
                  size={17}
                  className={
                    isFavorite
                      ? 'fill-white'
                      : ''
                  }
                />

                {isFavorite
                  ? 'Saved'
                  : 'Add to Favorites'}

              </button>

              <button
                type="button"
                onClick={addToShoppingList}
                disabled={addingToShopping}
                className="
                  btn-secondary
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                "
              >

                <ShoppingCart size={17} />

                {addingToShopping
                  ? 'Adding...'
                  : 'Shopping List'}

              </button>

              <button
                type="button"
                onClick={addToMealPlan}
                disabled={addingToPlan}
                className="
                  btn-outline
                  disabled:opacity-60
                "
              >

                <CalendarPlus size={17} />

                {addingToPlan
                  ? 'Opening...'
                  : 'Meal Planner'}

              </button>

            </div>

            {/* Secondary actions */}

            <div
              className="
                flex
                flex-wrap
                gap-5
                mt-5
              "
            >

              <button
                type="button"
                onClick={printRecipe}
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-slate-500
                  hover:text-brand-600
                "
              >
                <Printer size={16} />

                Print recipe
              </button>

              <button
                type="button"
                onClick={shareRecipe}
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-slate-500
                  hover:text-brand-600
                "
              >
                <Share2 size={16} />

                Share recipe
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <section className="section mt-16">

        <div
          className="
            grid
            lg:grid-cols-[360px_minmax(0,1fr)]
            gap-8
            lg:gap-12
            items-start
          "
        >

          {/* ==================================================
              LEFT SIDEBAR
          ================================================== */}

          <aside className="space-y-6">

            {/* Ingredients */}

            <div
              className="
                card
                p-5
                sm:p-6
                lg:sticky
                lg:top-24
              "
            >

              {/* Header */}

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >

                <div>

                  <p
                    className="
                      text-xs
                      uppercase
                      tracking-widest
                      font-bold
                      text-brand-600
                    "
                  >
                    What's inside
                  </p>

                  <h2
                    className="
                      font-display
                      text-2xl
                      font-bold
                      mt-1
                    "
                  >
                    Ingredients
                  </h2>

                </div>

                {/* Servings */}

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-slate-50
                    dark:bg-slate-800
                    p-1
                  "
                >

                  <button
                    type="button"
                    onClick={() =>
                      setServings(
                        (current) =>
                          Math.max(
                            1,
                            current - 1
                          )
                      )
                    }
                    className="
                      w-8
                      h-8
                      rounded-lg
                      flex
                      items-center
                      justify-center
                      hover:bg-white
                      dark:hover:bg-slate-700
                    "
                    aria-label="Decrease servings"
                  >
                    <Minus size={14} />
                  </button>

                  <span
                    className="
                      text-sm
                      font-bold
                      min-w-7
                      text-center
                    "
                  >
                    {servings}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setServings(
                        (current) =>
                          current + 1
                      )
                    }
                    className="
                      w-8
                      h-8
                      rounded-lg
                      flex
                      items-center
                      justify-center
                      hover:bg-white
                      dark:hover:bg-slate-700
                    "
                    aria-label="Increase servings"
                  >
                    <Plus size={14} />
                  </button>

                </div>

              </div>

              {/* Progress */}

              <div className="mt-6">

                <div
                  className="
                    flex
                    justify-between
                    text-xs
                    mb-2
                  "
                >

                  <span className="text-slate-500">
                    Ingredients ready
                  </span>

                  <span className="font-semibold">
                    {checkedIngredients.length}/
                    {recipe.ingredients?.length || 0}
                  </span>

                </div>

                <div
                  className="
                    h-1.5
                    rounded-full
                    bg-slate-100
                    dark:bg-slate-800
                    overflow-hidden
                  "
                >

                  <div
                    className="
                      h-full
                      bg-brand-600
                      rounded-full
                      transition-all
                      duration-300
                    "
                    style={{
                      width: `${ingredientProgress}%`,
                    }}
                  />

                </div>

              </div>

              {/* Ingredient list */}

              <div className="space-y-2 mt-6">

                {recipe.ingredients?.map(
                  (ingredient, index) => {

                    const checked =
                      checkedIngredients.includes(
                        index
                      );

                    const quantity =
                      Math.round(
                        (ingredient.quantity || 0) *
                          scale *
                          100
                      ) / 100;

                    return (
                      <label
                        key={`${ingredient.name}-${index}`}
                        className={`
                          flex
                          items-center
                          gap-3
                          p-3
                          rounded-xl
                          border
                          cursor-pointer
                          transition-all
                          ${
                            checked
                              ? `
                                bg-green-50
                                dark:bg-green-900/10
                                border-green-200
                                dark:border-green-900/40
                              `
                              : `
                                bg-white
                                dark:bg-slate-900
                                border-slate-100
                                dark:border-slate-800
                                hover:border-brand-300
                              `
                          }
                        `}
                      >

                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            toggleIngredient(
                              index
                            )
                          }
                          className="
                            w-4
                            h-4
                            accent-orange-600
                            shrink-0
                          "
                        />

                        <span
                          className={`
                            flex-1
                            text-sm
                            capitalize
                            ${
                              checked
                                ? `
                                  line-through
                                  text-slate-400
                                `
                                : ''
                            }
                          `}
                        >
                          {ingredient.name}
                        </span>

                        <span
                          className="
                            text-xs
                            font-semibold
                            text-slate-400
                            whitespace-nowrap
                          "
                        >
                          {quantity}{' '}
                          {ingredient.unit}
                        </span>

                      </label>
                    );
                  }
                )}

              </div>

              {/* Reset */}

              {checkedIngredients.length >
                0 && (
                <button
                  type="button"
                  onClick={
                    resetIngredients
                  }
                  className="
                    text-xs
                    font-semibold
                    text-brand-600
                    mt-4
                    hover:underline
                  "
                >
                  Reset checklist
                </button>
              )}

            </div>

            {/* Nutrition */}

            <div className="card p-5 sm:p-6">

              <div className="flex items-center gap-3 mb-5">

                <div
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-brand-50
                    dark:bg-brand-900/20
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Flame
                    size={19}
                    className="text-brand-600"
                  />
                </div>

                <div>

                  <h2
                    className="
                      font-display
                      text-lg
                      font-bold
                    "
                  >
                    Nutrition
                  </h2>

                  <p
                    className="
                      text-xs
                      text-slate-400
                    "
                  >
                    Per serving
                  </p>

                </div>

              </div>

              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                "
              >

                {[
                  {
                    label: 'Calories',
                    value:
                      `${nutrition.calories || 0} kcal`,
                  },
                  {
                    label: 'Protein',
                    value:
                      `${nutrition.protein || 0} g`,
                  },
                  {
                    label: 'Carbs',
                    value:
                      `${nutrition.carbs || 0} g`,
                  },
                  {
                    label: 'Fat',
                    value:
                      `${nutrition.fat || 0} g`,
                  },
                ].map(
                  (item) => (
                    <div
                      key={item.label}
                      className="
                        rounded-xl
                        bg-slate-50
                        dark:bg-slate-800
                        p-3
                      "
                    >

                      <p
                        className="
                          text-xs
                          text-slate-400
                        "
                      >
                        {item.label}
                      </p>

                      <p
                        className="
                          font-bold
                          text-sm
                          mt-1
                        "
                      >
                        {item.value}
                      </p>

                    </div>
                  )
                )}

              </div>

            </div>

          </aside>

          {/* ==================================================
              RIGHT CONTENT
          ================================================== */}

          <div>

            {/* Instructions header */}

            <div
              className="
                flex
                flex-wrap
                items-end
                justify-between
                gap-4
                mb-6
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-widest
                    font-bold
                    text-brand-600
                  "
                >
                  Step by step
                </p>

                <h2
                  className="
                    font-display
                    text-3xl
                    sm:text-4xl
                    font-bold
                    mt-1
                  "
                >
                  Let's get cooking.
                </h2>

              </div>

              <div className="flex items-center gap-3">

                <span className="chip">
                  {completedSteps.length}/
                  {recipe.instructions?.length || 0}
                  {' '}completed
                </span>

                {completedSteps.length >
                  0 && (
                  <button
                    type="button"
                    onClick={resetSteps}
                    className="
                      text-xs
                      font-semibold
                      text-brand-600
                      hover:underline
                    "
                  >
                    Reset
                  </button>
                )}

              </div>

            </div>

            {/* Instruction progress */}

            <div
              className="
                h-2
                rounded-full
                bg-slate-100
                dark:bg-slate-800
                overflow-hidden
                mb-7
              "
            >

              <div
                className="
                  h-full
                  bg-brand-600
                  rounded-full
                  transition-all
                  duration-300
                "
                style={{
                  width: `${instructionProgress}%`,
                }}
              />

            </div>

            {/* Instructions */}

            <div className="space-y-4">

              {recipe.instructions?.map(
                (step, index) => {

                  const completed =
                    completedSteps.includes(
                      index
                    );

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() =>
                        toggleStep(
                          index
                        )
                      }
                      className={`
                        w-full
                        text-left
                        flex
                        items-start
                        gap-4
                        sm:gap-5
                        p-5
                        sm:p-6
                        rounded-2xl
                        border
                        transition-all
                        ${
                          completed
                            ? `
                              bg-green-50
                              dark:bg-green-900/10
                              border-green-200
                              dark:border-green-900/40
                            `
                            : `
                              bg-white
                              dark:bg-slate-900
                              border-slate-200
                              dark:border-slate-800
                              hover:border-brand-300
                              hover:shadow-lg
                              hover:shadow-slate-900/5
                            `
                        }
                      `}
                    >

                      {/* Step number */}

                      <span
                        className={`
                          w-11
                          h-11
                          shrink-0
                          rounded-xl
                          flex
                          items-center
                          justify-center
                          font-bold
                          text-sm
                          transition-all
                          ${
                            completed
                              ? `
                                bg-green-600
                                text-white
                              `
                              : `
                                bg-brand-50
                                dark:bg-brand-900/20
                                text-brand-600
                              `
                          }
                        `}
                      >

                        {completed ? (
                          <CheckCircle2
                            size={21}
                          />
                        ) : (
                          String(
                            index + 1
                          ).padStart(
                            2,
                            '0'
                          )
                        )}

                      </span>

                      {/* Step content */}

                      <div className="flex-1 pt-0.5">

                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            gap-3
                            mb-2
                          "
                        >

                          <span
                            className="
                              text-[11px]
                              uppercase
                              tracking-widest
                              font-bold
                              text-brand-600
                            "
                          >
                            Step {index + 1}
                          </span>

                          {completed && (
                            <span
                              className="
                                text-[11px]
                                font-bold
                                text-green-600
                              "
                            >
                              Done
                            </span>
                          )}

                        </div>

                        <p
                          className={`
                            text-sm
                            sm:text-base
                            leading-7
                            ${
                              completed
                                ? `
                                  text-slate-400
                                  line-through
                                `
                                : `
                                  text-slate-700
                                  dark:text-slate-200
                                `
                            }
                          `}
                        >
                          {step}
                        </p>

                      </div>

                    </button>
                  );
                }
              )}

            </div>

            {/* Complete message */}

            {recipe.instructions?.length >
              0 &&
              completedSteps.length ===
                recipe.instructions.length && (

                <div
                  className="
                    mt-7
                    rounded-2xl
                    bg-green-50
                    dark:bg-green-900/20
                    border
                    border-green-200
                    dark:border-green-900/40
                    p-7
                    text-center
                  "
                >

                  <div
                    className="
                      w-14
                      h-14
                      rounded-full
                      bg-green-600
                      text-white
                      flex
                      items-center
                      justify-center
                      mx-auto
                      mb-4
                    "
                  >
                    <CircleCheck
                      size={28}
                    />
                  </div>

                  <h3
                    className="
                      font-display
                      text-2xl
                      font-bold
                    "
                  >
                    Recipe complete!
                  </h3>

                  <p
                    className="
                      text-sm
                      text-slate-500
                      mt-2
                    "
                  >
                    Great job. Your delicious
                    meal is ready to enjoy.
                  </p>

                </div>
              )}

          </div>

        </div>

      </section>

    </main>
  );
}