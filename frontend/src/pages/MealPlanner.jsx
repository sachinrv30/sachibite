import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trash2,
  X,
  Search,
  Plus,
  Utensils,
  Clock,
  ArrowRight,
  WandSparkles,
} from 'lucide-react';

import RecipeImage from '../components/RecipeImage';
import { PageLoader } from '../components/Loader';
import ErrorState from '../components/ErrorState';
import IngredientInput from '../components/IngredientInput';

import api from '../services/api';
import { useToast } from '../context/ToastContext';

/* ============================================================
   CONSTANTS
============================================================ */

const DAYS = [
  { key: 'monday', label: 'Monday', short: 'MON' },
  { key: 'tuesday', label: 'Tuesday', short: 'TUE' },
  { key: 'wednesday', label: 'Wednesday', short: 'WED' },
  { key: 'thursday', label: 'Thursday', short: 'THU' },
  { key: 'friday', label: 'Friday', short: 'FRI' },
  { key: 'saturday', label: 'Saturday', short: 'SAT' },
  { key: 'sunday', label: 'Sunday', short: 'SUN' },
];

const SLOTS = [
  {
    key: 'breakfast',
    label: 'Breakfast',
    icon: '☀️',
  },
  {
    key: 'lunch',
    label: 'Lunch',
    icon: '🥗',
  },
  {
    key: 'dinner',
    label: 'Dinner',
    icon: '🍽️',
  },
  {
    key: 'snack',
    label: 'Snack',
    icon: '🍎',
  },
];

/* ============================================================
   RECIPE PICKER MODAL
============================================================ */

function RecipePickerModal({
  onClose,
  onPick,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller =
      new AbortController();

    const timeout = setTimeout(
      async () => {
        setLoading(true);

        try {
          const response =
            await api.get('/recipes', {
              params: {
                q:
                  query.trim() ||
                  undefined,
                limit: 12,
              },
              signal:
                controller.signal,
            });

          setResults(
            response.data?.data || []
          );
        } catch (error) {
          if (
            error?.code !==
            'ERR_CANCELED'
          ) {
            console.error(
              'Recipe search error:',
              error
            );
          }
        } finally {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        }
      },
      300
    );

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        bg-slate-950/60
        backdrop-blur-sm
        flex
        items-center
        justify-center
        p-4
      "
      onClick={onClose}
    >
      <div
        className="
          w-full
          max-w-2xl
          max-h-[85vh]
          bg-white
          dark:bg-slate-900
          rounded-[2rem]
          shadow-2xl
          overflow-hidden
          border
          border-slate-200
          dark:border-slate-800
          flex
          flex-col
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* Modal header */}

        <div
          className="
            p-5
            sm:p-6
            border-b
            border-slate-100
            dark:border-slate-800
          "
        >

          <div
            className="
              flex
              items-start
              justify-between
              gap-4
              mb-5
            "
          >

            <div>

              <span
                className="
                  text-xs
                  uppercase
                  tracking-widest
                  font-bold
                  text-brand-600
                "
              >
                Add a meal
              </span>

              <h3
                className="
                  font-display
                  text-2xl
                  font-bold
                  mt-1
                "
              >
                Choose a recipe
              </h3>

              <p
                className="
                  text-sm
                  text-slate-500
                  mt-1
                "
              >
                Find something delicious
                for this meal slot.
              </p>

            </div>

            <button
              type="button"
              onClick={onClose}
              className="
                w-10
                h-10
                rounded-xl
                bg-slate-100
                dark:bg-slate-800
                flex
                items-center
                justify-center
                shrink-0
                hover:bg-slate-200
                dark:hover:bg-slate-700
                transition
              "
              aria-label="Close recipe picker"
            >
              <X size={18} />
            </button>

          </div>

          {/* Search */}

          <div className="relative">

            <Search
              size={18}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              autoFocus
              className="
                input
                !pl-11
                !py-3.5
              "
              placeholder="
                Search recipes...
              "
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
            />

          </div>

        </div>

        {/* Results */}

        <div
          className="
            overflow-y-auto
            p-5
            sm:p-6
          "
        >

          {loading ? (

            <div
              className="
                grid
                sm:grid-cols-2
                gap-3
              "
            >

              {Array.from(
                { length: 6 },
                (_, index) => (
                  <div
                    key={index}
                    className="
                      animate-pulse
                      rounded-2xl
                      border
                      border-slate-100
                      dark:border-slate-800
                      p-3
                    "
                  >

                    <div
                      className="
                        h-32
                        rounded-xl
                        bg-slate-200
                        dark:bg-slate-800
                      "
                    />

                    <div
                      className="
                        h-4
                        bg-slate-200
                        dark:bg-slate-800
                        rounded
                        mt-3
                        w-3/4
                      "
                    />

                    <div
                      className="
                        h-3
                        bg-slate-200
                        dark:bg-slate-800
                        rounded
                        mt-2
                        w-1/2
                      "
                    />

                  </div>
                )
              )}

            </div>

          ) : results.length === 0 ? (

            <div
              className="
                text-center
                py-14
              "
            >

              <div
                className="
                  w-16
                  h-16
                  rounded-2xl
                  bg-brand-50
                  dark:bg-brand-900/20
                  flex
                  items-center
                  justify-center
                  mx-auto
                  mb-4
                "
              >
                <Search
                  size={25}
                  className="text-brand-600"
                />
              </div>

              <h4
                className="
                  font-display
                  text-lg
                  font-bold
                "
              >
                No recipes found
              </h4>

              <p
                className="
                  text-sm
                  text-slate-500
                  mt-2
                "
              >
                Try another recipe name.
              </p>

            </div>

          ) : (

            <div
              className="
                grid
                sm:grid-cols-2
                gap-3
              "
            >

              {results.map(
                (recipe) => (
                  <button
                    key={recipe._id}
                    type="button"
                    onClick={() =>
                      onPick(recipe)
                    }
                    className="
                      group
                      text-left
                      rounded-2xl
                      border
                      border-slate-200
                      dark:border-slate-800
                      p-3
                      hover:border-brand-400
                      hover:shadow-lg
                      hover:shadow-brand-900/5
                      transition-all
                    "
                  >

                    <RecipeImage
                      src={recipe.image}
                      alt={recipe.title}
                      className="
                        w-full
                        h-32
                        rounded-xl
                      "
                    />

                    <div className="pt-3">

                      <p
                        className="
                          text-sm
                          font-bold
                          line-clamp-1
                          group-hover:text-brand-600
                          transition
                        "
                      >
                        {recipe.title}
                      </p>

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          mt-2
                          text-xs
                          text-slate-400
                        "
                      >

                        {recipe.cuisine && (
                          <span className="capitalize">
                            {recipe.cuisine}
                          </span>
                        )}

                        <span>•</span>

                        <span>
                          {(recipe.prepTime || 0) +
                            (recipe.cookTime || 0)}
                          min
                        </span>

                      </div>

                    </div>

                  </button>
                )
              )}

            </div>

          )}

        </div>

      </div>
    </div>
  );
}

/* ============================================================
   MEAL CARD
============================================================ */

function MealCard({
  recipe,
  day,
  slot,
  onRemove,
  onAdd,
}) {
  if (!recipe) {
    return (
      <button
        type="button"
        onClick={onAdd}
        className="
          group
          w-full
          min-h-[145px]
          rounded-2xl
          border-2
          border-dashed
          border-slate-200
          dark:border-slate-800
          flex
          flex-col
          items-center
          justify-center
          text-slate-400
          hover:border-brand-400
          hover:text-brand-600
          hover:bg-brand-50/50
          dark:hover:bg-brand-900/10
          transition-all
        "
        aria-label={`Add ${slot} for ${day}`}
      >

        <span
          className="
            w-10
            h-10
            rounded-xl
            bg-slate-100
            dark:bg-slate-800
            group-hover:bg-brand-100
            dark:group-hover:bg-brand-900/30
            flex
            items-center
            justify-center
            mb-2
            transition
          "
        >
          <Plus size={18} />
        </span>

        <span
          className="
            text-xs
            font-semibold
          "
        >
          Add {slot}
        </span>

      </button>
    );
  }

  return (
    <div
      className="
        group
        relative
        rounded-2xl
        overflow-hidden
        bg-white
        dark:bg-slate-900
        border
        border-slate-200
        dark:border-slate-800
        shadow-sm
        hover:shadow-xl
        hover:shadow-slate-900/10
        transition-all
      "
    >

      <Link
        to={`/recipes/${recipe._id}`}
        className="block"
      >

        <div className="relative">

          <RecipeImage
            src={recipe.image}
            alt={recipe.title}
            className="
              w-full
              h-32
              sm:h-36
            "
          />

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black/50
              via-transparent
              to-transparent
              pointer-events-none
            "
          />

          <span
            className="
              absolute
              left-3
              bottom-3
              text-[10px]
              uppercase
              tracking-wider
              font-bold
              text-white
              bg-black/35
              backdrop-blur
              px-2.5
              py-1
              rounded-full
            "
          >
            {slot}
          </span>

        </div>

        <div className="p-3">

          <h4
            className="
              text-sm
              font-bold
              line-clamp-2
              min-h-[40px]
              group-hover:text-brand-600
              transition
            "
          >
            {recipe.title}
          </h4>

          <div
            className="
              flex
              items-center
              gap-1.5
              text-xs
              text-slate-400
              mt-2
            "
          >

            <Clock size={13} />

            <span>
              {(recipe.prepTime || 0) +
                (recipe.cookTime || 0)}
              min
            </span>

          </div>

        </div>

      </Link>

      {/* Remove */}

      <button
        type="button"
        onClick={onRemove}
        className="
          absolute
          top-2
          right-2
          w-8
          h-8
          rounded-full
          bg-white/95
          dark:bg-slate-900/95
          backdrop-blur
          shadow-lg
          flex
          items-center
          justify-center
          opacity-100
          sm:opacity-0
          group-hover:opacity-100
          transition
        "
        aria-label={`Remove ${recipe.title}`}
      >

        <X
          size={14}
          className="text-slate-500"
        />

      </button>

    </div>
  );
}

/* ============================================================
   MAIN MEAL PLANNER
============================================================ */

export default function MealPlanner() {
  const [plan, setPlan] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [picker, setPicker] =
    useState(null);

  const [generating, setGenerating] =
    useState(false);

  const [ingredients, setIngredients] =
    useState([]);

  const [showGenerate, setShowGenerate] =
    useState(false);

  const [mobileDay, setMobileDay] =
    useState(0);

  const { showToast } =
    useToast();

  /* ============================================================
     LOAD PLAN
  ============================================================ */

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const response =
        await api.get('/meal-plans');

      setPlan(
        response.data?.data
      );
    } catch (err) {
      console.error(
        'Meal plan loading error:',
        err
      );

      setError(
        'We could not load your meal plan.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ============================================================
     UPDATE SLOT
  ============================================================ */

  const setSlot = async (
    day,
    slot,
    recipeId
  ) => {
    try {
      const response =
        await api.put(
          `/meal-plans/${plan._id}`,
          {
            day,
            slot,
            recipeId,
          }
        );

      setPlan(
        response.data?.data
      );

      showToast(
        recipeId
          ? 'Meal added to your plan.'
          : 'Meal removed from your plan.',
        'success'
      );
    } catch (err) {
      console.error(
        'Meal plan update error:',
        err
      );

      showToast(
        'Could not update your meal plan.',
        'error'
      );
    }
  };

  /* ============================================================
     CLEAR WEEK
  ============================================================ */

  const clearWeek = async () => {
    const confirmed =
      window.confirm(
        'Are you sure you want to clear your entire weekly meal plan?'
      );

    if (!confirmed) return;

    try {
      const response =
        await api.delete(
          `/meal-plans/${plan._id}`
        );

      setPlan(
        response.data?.data
      );

      showToast(
        'Your week has been cleared.',
        'info'
      );
    } catch (err) {
      console.error(
        'Clear meal plan error:',
        err
      );

      showToast(
        'Could not clear your meal plan.',
        'error'
      );
    }
  };

  /* ============================================================
     GENERATE PLAN
  ============================================================ */

  const generate = async () => {
    setGenerating(true);

    try {
      const response =
        await api.post(
          '/meal-plans/generate',
          {
            ingredients,
          }
        );

      setPlan(
        response.data?.data
      );

      showToast(
        'Your weekly plan has been generated!',
        'success'
      );

      setShowGenerate(false);
    } catch (err) {
      console.error(
        'Generate meal plan error:',
        err
      );

      showToast(
        'Could not generate a plan.',
        'error'
      );
    } finally {
      setGenerating(false);
    }
  };

  /* ============================================================
     CALCULATE STATS
  ============================================================ */

  const getMealCount = () => {
    if (!plan?.meals) return 0;

    let count = 0;

    DAYS.forEach((day) => {
      SLOTS.forEach((slot) => {
        if (
          plan.meals?.[day.key]?.[
            slot.key
          ]?.recipeId
        ) {
          count += 1;
        }
      });
    });

    return count;
  };

  const mealCount =
    getMealCount();

  const totalSlots =
    DAYS.length * SLOTS.length;

  const completion =
    totalSlots
      ? Math.round(
          (mealCount /
            totalSlots) *
            100
        )
      : 0;

  /* ============================================================
     LOADING / ERROR
  ============================================================ */

  if (loading) {
    return <PageLoader />;
  }

  if (error || !plan) {
    return (
      <ErrorState
        title="Meal planner unavailable"
        message={
          error ||
          'We could not load your weekly plan.'
        }
        onRetry={load}
        showHome
      />
    );
  }

  /* ============================================================
     CURRENT MOBILE DAY
  ============================================================ */

  const currentDay =
    DAYS[mobileDay];

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <main className="page-enter pb-24">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section
        className="
          relative
          overflow-hidden
          border-b
          border-slate-200
          dark:border-slate-800
          bg-gradient-to-br
          from-orange-50
          via-white
          to-amber-50
          dark:from-slate-950
          dark:via-slate-900
          dark:to-slate-950
        "
      >

        {/* Decorative glow */}

        <div
          className="
            absolute
            -top-40
            -right-20
            w-96
            h-96
            rounded-full
            bg-orange-300/20
            blur-3xl
            pointer-events-none
          "
        />

        <div className="section relative py-12 sm:py-16">

          <div
            className="
              flex
              flex-col
              lg:flex-row
              lg:items-end
              justify-between
              gap-8
            "
          >

            <div className="max-w-2xl">

              <span
                className="
                  eyebrow
                  inline-flex
                  items-center
                  gap-2
                "
              >
                <CalendarDays size={15} />

                Your weekly kitchen plan
              </span>

              <h1
                className="
                  font-display
                  text-4xl
                  sm:text-5xl
                  font-extrabold
                  tracking-tight
                  mt-4
                  leading-tight
                "
              >
                Plan your week.
                <span
                  className="
                    block
                    text-brand-600
                  "
                >
                  Eat better.
                </span>
              </h1>

              <p
                className="
                  text-base
                  sm:text-lg
                  leading-7
                  text-slate-500
                  dark:text-slate-400
                  mt-4
                "
              >
                Organize breakfast, lunch,
                dinner and snacks for the
                entire week — without the
                daily guesswork.
              </p>

            </div>

            {/* Actions */}

            <div
              className="
                flex
                flex-wrap
                gap-3
              "
            >

              <button
                type="button"
                onClick={() =>
                  setShowGenerate(
                    !showGenerate
                  )
                }
                className="btn-primary"
              >

                <Sparkles size={17} />

                Generate plan

              </button>

              <button
                type="button"
                onClick={clearWeek}
                className="btn-outline"
              >

                <Trash2 size={17} />

                Clear week

              </button>

            </div>

          </div>

          {/* Stats */}

          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-3
              gap-3
              mt-9
              max-w-2xl
            "
          >

            <div
              className="
                rounded-2xl
                bg-white/80
                dark:bg-slate-900/80
                border
                border-slate-200
                dark:border-slate-800
                p-4
              "
            >

              <p
                className="
                  text-2xl
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                {mealCount}
              </p>

              <p
                className="
                  text-xs
                  text-slate-500
                  mt-1
                "
              >
                Meals planned
              </p>

            </div>

            <div
              className="
                rounded-2xl
                bg-white/80
                dark:bg-slate-900/80
                border
                border-slate-200
                dark:border-slate-800
                p-4
              "
            >

              <p
                className="
                  text-2xl
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                {completion}%
              </p>

              <p
                className="
                  text-xs
                  text-slate-500
                  mt-1
                "
              >
                Week planned
              </p>

            </div>

            <div
              className="
                hidden
                sm:block
                rounded-2xl
                bg-white/80
                dark:bg-slate-900/80
                border
                border-slate-200
                dark:border-slate-800
                p-4
              "
            >

              <p
                className="
                  text-2xl
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                {totalSlots}
              </p>

              <p
                className="
                  text-xs
                  text-slate-500
                  mt-1
                "
              >
                Weekly slots
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
          GENERATOR
      ====================================================== */}

      {showGenerate && (

        <section className="section pt-8">

          <div
            className="
              card
              p-5
              sm:p-7
              border-brand-200
              dark:border-brand-900/40
              bg-gradient-to-br
              from-white
              to-brand-50/40
              dark:from-slate-900
              dark:to-brand-950/10
            "
          >

            <div
              className="
                flex
                flex-col
                lg:flex-row
                lg:items-start
                justify-between
                gap-6
              "
            >

              <div>

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    mb-3
                  "
                >

                  <div
                    className="
                      w-11
                      h-11
                      rounded-xl
                      bg-brand-100
                      dark:bg-brand-900/30
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <WandSparkles
                      size={21}
                      className="text-brand-600"
                    />
                  </div>

                  <div>

                    <h2
                      className="
                        font-display
                        text-xl
                        font-bold
                      "
                    >
                      Let SachiBite plan it
                    </h2>

                    <p
                      className="
                        text-xs
                        text-slate-500
                      "
                    >
                      Optional ingredient-based
                      planning
                    </p>

                  </div>

                </div>

                <p
                  className="
                    text-sm
                    text-slate-500
                    max-w-xl
                    leading-6
                  "
                >
                  Tell SachiBite what 
                  ingredients you already 
                  have and it can generate a
                  weekly meal plan around them.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowGenerate(false)
                }
                className="
                  w-9
                  h-9
                  rounded-full
                  bg-slate-100
                  dark:bg-slate-800
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
                aria-label="Close generator"
              >
                <X size={16} />
              </button>

            </div>

            <div className="mt-6">

              <IngredientInput
                ingredients={ingredients}
                setIngredients={
                  setIngredients
                }
              />

            </div>

            <div
              className="
                flex
                flex-wrap
                gap-3
                mt-5
              "
            >

              <button
                type="button"
                onClick={generate}
                disabled={generating}
                className="
                  btn-primary
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                "
              >

                <Sparkles size={16} />

                {generating
                  ? 'Generating your week...'
                  : 'Generate weekly plan'}

              </button>

              <button
                type="button"
                onClick={() =>
                  setShowGenerate(false)
                }
                className="btn-secondary"
              >
                Cancel
              </button>

            </div>

          </div>

        </section>

      )}

      {/* ======================================================
          MOBILE DAY NAVIGATION
      ====================================================== */}

      <section className="section pt-8 lg:hidden">

        <div
          className="
            flex
            items-center
            justify-between
            rounded-2xl
            bg-slate-100
            dark:bg-slate-900
            p-2
          "
        >

          <button
            type="button"
            onClick={() =>
              setMobileDay(
                (current) =>
                  Math.max(
                    0,
                    current - 1
                  )
              )
            }
            disabled={mobileDay === 0}
            className="
              w-10
              h-10
              rounded-xl
              bg-white
              dark:bg-slate-800
              flex
              items-center
              justify-center
              disabled:opacity-30
            "
          >
            <ChevronLeft size={18} />
          </button>

          <div className="text-center">

            <p
              className="
                text-[10px]
                tracking-widest
                font-bold
                text-brand-600
              "
            >
              {currentDay.short}
            </p>

            <p
              className="
                font-display
                font-bold
              "
            >
              {currentDay.label}
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              setMobileDay(
                (current) =>
                  Math.min(
                    DAYS.length - 1,
                    current + 1
                  )
              )
            }
            disabled={
              mobileDay ===
              DAYS.length - 1
            }
            className="
              w-10
              h-10
              rounded-xl
              bg-white
              dark:bg-slate-800
              flex
              items-center
              justify-center
              disabled:opacity-30
            "
          >
            <ChevronRight size={18} />
          </button>

        </div>

      </section>

      {/* ======================================================
          DESKTOP WEEK VIEW
      ====================================================== */}

      <section className="section mt-8">

        {/* Desktop */}

        <div className="hidden lg:block">

          <div
            className="
              grid
              grid-cols-7
              gap-4
            "
          >

            {DAYS.map(
              (day) => (
                <div
                  key={day.key}
                  className="min-w-0"
                >

                  {/* Day header */}

                  <div
                    className="
                      mb-3
                      text-center
                    "
                  >

                    <span
                      className="
                        text-[10px]
                        tracking-widest
                        font-bold
                        text-brand-600
                      "
                    >
                      {day.short}
                    </span>

                    <h3
                      className="
                        font-display
                        font-bold
                        mt-0.5
                      "
                    >
                      {day.label}
                    </h3>

                  </div>

                  {/* Meals */}

                  <div className="space-y-3">

                    {SLOTS.map(
                      (slot) => {

                        const recipe =
                          plan.meals?.[
                            day.key
                          ]?.[
                            slot.key
                          ]?.recipeId;

                        return (
                          <MealCard
                            key={
                              slot.key
                            }
                            recipe={
                              recipe
                            }
                            day={
                              day.label
                            }
                            slot={
                              slot.label
                            }
                            onRemove={() =>
                              setSlot(
                                day.key,
                                slot.key,
                                null
                              )
                            }
                            onAdd={() =>
                              setPicker({
                                day:
                                  day.key,
                                slot:
                                  slot.key,
                              })
                            }
                          />
                        );
                      }
                    )}

                  </div>

                </div>
              )
            )}

          </div>

        </div>

        {/* ==================================================
            MOBILE DAY
        ================================================== */}

        <div className="lg:hidden">

          <div
            className="
              space-y-4
            "
          >

            {SLOTS.map(
              (slot) => {

                const recipe =
                  plan.meals?.[
                    currentDay.key
                  ]?.[
                    slot.key
                  ]?.recipeId;

                return (
                  <div
                    key={slot.key}
                    className="
                      rounded-2xl
                      border
                      border-slate-200
                      dark:border-slate-800
                      p-4
                      bg-white
                      dark:bg-slate-900
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        mb-3
                      "
                    >

                      <span className="text-lg">
                        {slot.icon}
                      </span>

                      <div>

                        <p
                          className="
                            text-xs
                            uppercase
                            tracking-widest
                            font-bold
                            text-slate-400
                          "
                        >
                          {slot.label}
                        </p>

                      </div>

                    </div>

                    <MealCard
                      recipe={
                        recipe
                      }
                      day={
                        currentDay.label
                      }
                      slot={
                        slot.label
                      }
                      onRemove={() =>
                        setSlot(
                          currentDay.key,
                          slot.key,
                          null
                        )
                      }
                      onAdd={() =>
                        setPicker({
                          day:
                            currentDay.key,
                          slot:
                            slot.key,
                        })
                      }
                    />

                  </div>
                );
              }
            )}

          </div>

        </div>

      </section>

      {/* ======================================================
          HELPFUL FOOTER
      ====================================================== */}

      <section className="section mt-8">

        <div
          className="
            rounded-3xl
            bg-slate-900
            dark:bg-black
            text-white
            p-7
            sm:p-9
            overflow-hidden
            relative
          "
        >

          <div
            className="
              absolute
              -right-20
              -top-20
              w-64
              h-64
              rounded-full
              bg-brand-600/20
              blur-3xl
            "
          />

          <div
            className="
              relative
              flex
              flex-col
              sm:flex-row
              sm:items-center
              justify-between
              gap-6
            "
          >

            <div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  mb-2
                "
              >

                <Utensils
                  size={18}
                  className="text-brand-400"
                />

                <span
                  className="
                    text-xs
                    uppercase
                    tracking-widest
                    font-bold
                    text-brand-400
                  "
                >
                  Make it easier
                </span>

              </div>

              <h2
                className="
                  font-display
                  text-2xl
                  font-bold
                "
              >
                Need ingredients?
              </h2>

              <p
                className="
                  text-sm
                  text-slate-400
                  mt-2
                  max-w-lg
                "
              >
                Add everything from your
                planned meals to your
                shopping list and get ready
                for the week.
              </p>

            </div>

            <Link
              to="/shopping-list"
              className="
                btn-primary
                shrink-0
              "
            >

              Shopping list

              <ArrowRight size={16} />

            </Link>

          </div>

        </div>

      </section>

      {/* ======================================================
          RECIPE PICKER
      ====================================================== */}

      {picker && (
        <RecipePickerModal
          onClose={() =>
            setPicker(null)
          }
          onPick={(recipe) => {
            setSlot(
              picker.day,
              picker.slot,
              recipe._id
            );

            setPicker(null);
          }}
        />
      )}

    </main>
  );
}