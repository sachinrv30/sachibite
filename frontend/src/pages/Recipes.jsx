import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  ChefHat,
  RotateCcw,
  X,
} from 'lucide-react';

import IngredientInput from '../components/IngredientInput';
import FilterPanel from '../components/FilterPanel';
import RecipeCard from '../components/RecipeCard';
import { RecipeCardSkeleton } from '../components/Loader';
import ErrorState from '../components/ErrorState';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const initialFilters = () => ({
  cuisine: [],
  category: [],
  diet: [],
  difficulty: [],
});

const sorts = [
  { value: '', label: 'Recently added' },
  { value: 'popular', label: 'Most popular' },
  { value: 'fastest', label: 'Quickest prep' },
  { value: 'lowest-calories', label: 'Lowest calories' },
  { value: 'highest-protein', label: 'Highest protein' },
];

const categories = [
  { value: '', label: 'All recipes' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snacks' },
];

export default function Recipes() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  /* -----------------------------
     Search / ingredient state
  ----------------------------- */

  const initialIngredients =
    searchParams.get('ingredients')
      ?.split(',')
      .map((item) => item.trim())
      .filter(Boolean) || [];

  const [ingredients, setIngredients] = useState(initialIngredients);

  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const [matchMode, setMatchMode] = useState(
    initialIngredients.length > 0
  );

  const [matchIngredients, setMatchIngredients] =
    useState(initialIngredients);

  /* -----------------------------
     Filter state
  ----------------------------- */

  const [sort, setSort] = useState('');
  const [filters, setFilters] = useState(initialFilters());

  const [showFilters, setShowFilters] = useState(false);

  /* -----------------------------
     Recipe state
  ----------------------------- */

  const [results, setResults] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  /* -----------------------------
     Retry state
  ----------------------------- */

  const [retryCount, setRetryCount] = useState(0);

  /* -----------------------------
     Active filters count
  ----------------------------- */

  const activeCount = Object.values(filters).reduce(
    (count, items) => count + items.length,
    0
  );

  /* ============================================================
     LOAD FAVORITES
  ============================================================ */

  useEffect(() => {
    let active = true;

    setFavoriteIds(new Set());

    if (!user) {
      return () => {
        active = false;
      };
    }

    const loadFavorites = async () => {
      try {
        const response = await api.get('/favorites');

        if (!active) return;

        const favorites = response.data?.data || [];

        const ids = favorites
          .map((recipe) => recipe?._id)
          .filter(Boolean);

        setFavoriteIds(new Set(ids));
      } catch (err) {
        if (active) {
          console.error('Failed to load favorites:', err);

          showToast(
            'Unable to load saved recipes.',
            'error'
          );
        }
      }
    };

    loadFavorites();

    return () => {
      active = false;
    };
  }, [user?._id, showToast]);

  /* ============================================================
     LOAD RECIPES
  ============================================================ */

  useEffect(() => {
    const controller = new AbortController();

    const fetchRecipes = async () => {
      setLoading(true);
      setError('');

      try {
        /* -----------------------------------------
           INGREDIENT MATCHING
        ----------------------------------------- */

        if (matchMode && matchIngredients.length > 0) {
          const response = await api.post(
            '/recipes/match',
            {
              ingredients: matchIngredients,

              preferences: {
                diet: filters.diet,
              },

              limit: 300,
            },
            {
              signal: controller.signal,
            }
          );

          let matched = response.data?.data || [];

          /* -----------------------------------------
             Safety normalization
          ----------------------------------------- */

          matched = matched.filter(
            (item) => item?.recipe
          );

          /* -----------------------------------------
             Apply filters
          ----------------------------------------- */

          matched = matched.filter(({ recipe }) => {
            const cuisineMatch =
              !filters.cuisine.length ||
              filters.cuisine.includes(recipe.cuisine);

            const categoryMatch =
              !filters.category.length ||
              filters.category.includes(recipe.category);

            const difficultyMatch =
              !filters.difficulty.length ||
              filters.difficulty.includes(recipe.difficulty);

            return (
              cuisineMatch &&
              categoryMatch &&
              difficultyMatch
            );
          });

          /* -----------------------------------------
             Sorting
          ----------------------------------------- */

          if (sort === 'fastest') {
            matched.sort(
              (a, b) =>
                (a.recipe.prepTime || 0) -
                (b.recipe.prepTime || 0)
            );
          }

          if (sort === 'lowest-calories') {
            matched.sort(
              (a, b) =>
                (a.recipe.nutrition?.calories || 0) -
                (b.recipe.nutrition?.calories || 0)
            );
          }

          if (sort === 'highest-protein') {
            matched.sort(
              (a, b) =>
                (b.recipe.nutrition?.protein || 0) -
                (a.recipe.nutrition?.protein || 0)
            );
          }

          if (sort === 'popular') {
            matched.sort(
              (a, b) =>
                (b.recipe.popularity || 0) -
                (a.recipe.popularity || 0)
            );
          }

          /* -----------------------------------------
             Pagination
          ----------------------------------------- */

          const totalMatches = matched.length;

          const totalPages = Math.max(
            1,
            Math.ceil(totalMatches / 12)
          );

          const safePage = Math.min(
            page,
            totalPages
          );

          const startIndex =
            (safePage - 1) * 12;

          const paginatedResults =
            matched.slice(
              startIndex,
              startIndex + 12
            );

          setTotal(totalMatches);
          setPages(totalPages);
          setResults(paginatedResults);

          /* If page became invalid, correct it */
          if (page > totalPages) {
            setPage(totalPages);
          }
        }

        /* -----------------------------------------
           NORMAL RECIPE SEARCH
        ----------------------------------------- */

        else {
          const response = await api.get(
            '/recipes',
            {
              signal: controller.signal,

              params: {
                q:
                  submittedQuery ||
                  undefined,

                sort:
                  sort ||
                  undefined,

                cuisine:
                  filters.cuisine.length
                    ? filters.cuisine.join(',')
                    : undefined,

                category:
                  filters.category.length
                    ? filters.category.join(',')
                    : undefined,

                diet:
                  filters.diet.length
                    ? filters.diet.join(',')
                    : undefined,

                difficulty:
                  filters.difficulty.length
                    ? filters.difficulty.join(',')
                    : undefined,

                page,

                limit: 12,
              },
            }
          );

          const recipes =
            response.data?.data || [];

          setResults(
            recipes.map((recipe) => ({
              recipe,
            }))
          );

          setTotal(
            response.data?.pagination?.total ||
              recipes.length
          );

          setPages(
            response.data?.pagination?.pages ||
              1
          );
        }
      } catch (err) {
        if (
          err?.code === 'ERR_CANCELED' ||
          err?.name === 'CanceledError'
        ) {
          return;
        }

        console.error(
          'Recipe loading error:',
          err
        );

        setError(
          'We could not load the recipes. Please try again.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchRecipes();

    return () => {
      controller.abort();
    };
  }, [
    submittedQuery,
    sort,
    filters,
    page,
    matchMode,
    matchIngredients,
    retryCount,
  ]);

  /* ============================================================
     FILTERS
  ============================================================ */

  const updateFilters = (nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
    setMatchMode(
      matchIngredients.length > 0
        ? matchMode
        : false
    );
  };

  /* ============================================================
     SEARCH
  ============================================================ */

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);
    setMatchMode(false);
    setSubmittedQuery(query.trim());
  };

  /* ============================================================
     INGREDIENT MATCHING
  ============================================================ */

  const findMatches = () => {
    if (!ingredients.length) {
      showToast(
        'Add at least one ingredient first.',
        'info'
      );

      return;
    }

    setPage(1);
    setMatchIngredients([...ingredients]);
    setMatchMode(true);
    setSubmittedQuery('');
  };

  /* ============================================================
     RESET EVERYTHING
  ============================================================ */

  const resetAll = () => {
    setQuery('');
    setSubmittedQuery('');

    setIngredients([]);
    setMatchIngredients([]);

    setFilters(initialFilters());

    setSort('');

    setMatchMode(false);

    setPage(1);

    setShowFilters(false);

    setRetryCount((count) => count + 1);
  };

  /* ============================================================
     FAVORITES
  ============================================================ */

  const toggleFavorite = async (id) => {
    if (!user) {
      showToast(
        'Please log in to save recipes.',
        'info'
      );

      return;
    }

    try {
      if (favoriteIds.has(id)) {
        await api.delete(
          `/favorites/${id}`
        );

        setFavoriteIds((previous) => {
          const next = new Set(previous);

          next.delete(id);

          return next;
        });

        showToast(
          'Removed from favorites.',
          'info'
        );
      } else {
        await api.post(
          `/favorites/${id}`
        );

        setFavoriteIds(
          (previous) =>
            new Set([
              ...previous,
              id,
            ])
        );

        showToast(
          'Added to favorites!',
          'success'
        );
      }
    } catch (err) {
      console.error(
        'Favorite error:',
        err
      );

      showToast(
        'Unable to update favorites.',
        'error'
      );
    }
  };

  /* ============================================================
     RETRY
  ============================================================ */

  const retryRequest = () => {
    setError('');
    setRetryCount(
      (count) => count + 1
    );
  };

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
            -top-32
            -right-32
            w-96
            h-96
            rounded-full
            bg-orange-300/20
            blur-3xl
            pointer-events-none
          "
        />

        <div
          className="
            absolute
            -bottom-40
            -left-32
            w-96
            h-96
            rounded-full
            bg-amber-300/20
            blur-3xl
            pointer-events-none
          "
        />

        <div className="section relative py-14 sm:py-20">

          {/* Heading */}

          <div className="max-w-3xl">

            <span
              className="
                eyebrow
                flex
                items-center
                gap-2
              "
            >
              <Sparkles size={15} />

              Discover something delicious
            </span>

            <h1
              className="
                font-display
                text-4xl
                sm:text-5xl
                lg:text-6xl
                font-extrabold
                tracking-tight
                mt-5
                leading-tight
                text-slate-900
                dark:text-white
              "
            >
              Find your next

              <span
                className="
                  block
                  text-brand-600
                "
              >
                favorite recipe.
              </span>
            </h1>

            <p
              className="
                section-description
                mt-5
                max-w-2xl
              "
            >
              Search recipes, explore cuisines,
              or discover delicious meals using
              ingredients you already have at home.
            </p>

          </div>

          {/* Search card */}

          <div
            className="
              card
              p-4
              sm:p-6
              mt-10
              max-w-5xl
              shadow-xl
              shadow-orange-900/5
              backdrop-blur-sm
            "
          >

            {/* Search */}

            <form
              onSubmit={handleSearch}
              className="
                flex
                flex-col
                sm:flex-row
                gap-3
              "
            >

              <div
                className="
                  relative
                  flex-1
                "
              >

                <Search
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                  size={20}
                />

                <input
                  className="
                    input
                    !pl-12
                    !py-4
                  "
                  placeholder="
                    Search pasta, chicken, Italian...
                  "
                  value={query}
                  onChange={(event) =>
                    setQuery(
                      event.target.value
                    )
                  }
                  aria-label="Search recipes"
                />

              </div>

              <button
                type="submit"
                className="
                  btn-primary
                  !px-8
                  !py-4
                "
              >
                <Search size={18} />

                Search recipes
              </button>

            </form>

            {/* Ingredient search */}

            <div
              className="
                border-t
                border-slate-100
                dark:border-slate-800
                mt-5
                pt-5
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

                <ChefHat
                  size={18}
                  className="text-brand-600"
                />

                <h2 className="font-semibold text-sm">
                  Cook with what you have
                </h2>

              </div>

              <div
                className="
                  flex
                  flex-col
                  md:flex-row
                  gap-3
                "
              >

                <div className="flex-1 min-w-0">

                  <IngredientInput
                    ingredients={ingredients}
                    setIngredients={
                      setIngredients
                    }
                  />

                </div>

                <button
                  type="button"
                  onClick={findMatches}
                  className="
                    btn-secondary
                    self-start
                    !py-3
                  "
                >
                  <Sparkles size={17} />

                  Find matches
                </button>

              </div>

              {/* Match mode */}

              {matchMode && (
                <div
                  className="
                    mt-4
                    flex
                    items-center
                    justify-between
                    gap-3
                    rounded-xl
                    bg-brand-50
                    dark:bg-brand-900/20
                    border
                    border-brand-100
                    dark:border-brand-900/40
                    p-3
                  "
                >

                  <p
                    className="
                      text-sm
                      text-brand-700
                      dark:text-brand-300
                    "
                  >
                    Showing recipes that match
                    your ingredients.
                  </p>

                  <button
                    type="button"
                    onClick={resetAll}
                    className="
                      text-xs
                      font-bold
                      text-brand-700
                      dark:text-brand-300
                      shrink-0
                    "
                  >
                    Clear
                  </button>

                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* ======================================================
          CATEGORY SHORTCUTS
      ====================================================== */}

      <section className="section pt-9">

        <div
          className="
            flex
            flex-wrap
            gap-2
          "
        >

          {categories.map(
            (category) => {

              const selected =
                !matchMode &&
                (
                  category.value
                    ? filters.category.length === 1 &&
                      filters.category[0] ===
                        category.value
                    : filters.category.length === 0
                );

              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() =>
                    updateFilters({
                      ...filters,

                      category:
                        category.value
                          ? [category.value]
                          : [],
                    })
                  }
                  className={`
                    rounded-full
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    border
                    transition-all
                    ${
                      selected
                        ? `
                          bg-brand-600
                          border-brand-600
                          text-white
                          shadow-md
                          shadow-brand-600/20
                        `
                        : `
                          bg-white
                          dark:bg-slate-900
                          border-slate-200
                          dark:border-slate-800
                          text-slate-700
                          dark:text-slate-300
                          hover:border-brand-400
                          hover:text-brand-600
                        `
                    }
                  `}
                >
                  {category.label}
                </button>
              );
            }
          )}

        </div>

      </section>

      {/* ======================================================
          RESULTS
      ====================================================== */}

      <section className="section mt-10">

        {/* Top bar */}

        <div
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-4
            mb-7
          "
        >

          <div>

            <h2 className="section-title">
              {matchMode
                ? 'Your recipe matches'
                : 'Explore recipes'}
            </h2>

            <p
              className="
                text-sm
                text-slate-500
                dark:text-slate-400
                mt-2
              "
            >
              {loading
                ? 'Finding delicious recipes...'
                : `${total} ${
                    total === 1
                      ? 'recipe'
                      : 'recipes'
                  } found`}
            </p>

          </div>

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            {/* Sort */}

            <select
              className="
                input
                !py-2.5
                w-44
                sm:w-52
              "
              value={sort}
              aria-label="Sort recipes"
              onChange={(event) => {
                setSort(
                  event.target.value
                );

                setPage(1);
              }}
            >

              {sorts.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}

            </select>

            {/* Mobile filters */}

            <button
              type="button"
              onClick={() =>
                setShowFilters(
                  !showFilters
                )
              }
              className="
                btn-outline
                lg:hidden
                !px-3
              "
              aria-expanded={
                showFilters
              }
            >

              <SlidersHorizontal
                size={18}
              />

              <span className="hidden sm:inline">
                Filters
              </span>

              {activeCount > 0 && (
                <span
                  className="
                    min-w-5
                    h-5
                    rounded-full
                    bg-brand-600
                    text-white
                    text-[10px]
                    flex
                    items-center
                    justify-center
                    px-1
                  "
                >
                  {activeCount}
                </span>
              )}

            </button>

          </div>

        </div>

        {/* Main grid */}

        <div
          className="
            grid
            lg:grid-cols-[260px_minmax(0,1fr)]
            gap-8
          "
        >

          {/* Desktop / mobile filters */}

          <aside
            className={`
              ${
                showFilters
                  ? 'block'
                  : 'hidden'
              }
              lg:block
            `}
          >

            <div className="lg:sticky lg:top-24">

              <div
                className="
                  flex
                  items-center
                  justify-between
                  mb-3
                  lg:hidden
                "
              >

                <h3 className="font-bold">
                  Filters
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    setShowFilters(false)
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
                  "
                  aria-label="Close filters"
                >
                  <X size={17} />
                </button>

              </div>

              <FilterPanel
                filters={filters}
                setFilters={
                  updateFilters
                }
              />

            </div>

          </aside>

          {/* Recipe area */}

          <div className="min-w-0">

            {/* Active filters */}

            {(activeCount > 0 ||
              submittedQuery ||
              matchMode) && (

              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-2
                  mb-6
                "
              >

                <span
                  className="
                    text-xs
                    font-semibold
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Active:
                </span>

                {submittedQuery && !matchMode && (
                  <span className="chip">
                    Search: {submittedQuery}
                  </span>
                )}

                {matchMode && (
                  <span className="chip">
                    Ingredient match
                  </span>
                )}

                {Object.values(filters)
                  .flat()
                  .map((value, index) => (
                    <span
                      key={`${value}-${index}`}
                      className="
                        chip
                        capitalize
                      "
                    >
                      {value}
                    </span>
                  ))}

                <button
                  type="button"
                  onClick={resetAll}
                  className="
                    text-xs
                    font-semibold
                    text-brand-600
                    hover:text-brand-700
                    inline-flex
                    items-center
                    gap-1
                    ml-1
                  "
                >

                  <RotateCcw size={13} />

                  Reset all

                </button>

              </div>
            )}

            {/* Error */}

            {error ? (

              <ErrorState
                title="We couldn't load your recipes"
                message={error}
                onRetry={retryRequest}
              />

            ) : loading ? (

              /* Skeleton loading */

              <div
                className="
                  grid
                  sm:grid-cols-2
                  xl:grid-cols-3
                  gap-6
                "
              >

                {Array.from(
                  { length: 6 },
                  (_, index) => (
                    <RecipeCardSkeleton
                      key={index}
                    />
                  )
                )}

              </div>

            ) : results.length === 0 ? (

              /* Empty state */

              <div
                className="
                  card
                  p-10
                  sm:p-14
                  text-center
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
                    mb-5
                  "
                >

                  <Search
                    size={28}
                    className="text-brand-600"
                  />

                </div>

                <h3
                  className="
                    font-display
                    text-xl
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  No recipes found
                </h3>

                <p
                  className="
                    text-slate-500
                    dark:text-slate-400
                    text-sm
                    mt-3
                    max-w-md
                    mx-auto
                  "
                >
                  We couldn't find recipes
                  matching your current search
                  and filters.
                  Try changing your search or
                  removing some filters.
                </p>

                <button
                  type="button"
                  onClick={resetAll}
                  className="
                    btn-primary
                    mt-6
                  "
                >
                  <RotateCcw size={16} />

                  Clear search
                </button>

              </div>

            ) : (

              /* Recipe grid */

              <>

                <div
                  className="
                    grid
                    sm:grid-cols-2
                    xl:grid-cols-3
                    gap-6
                  "
                >

                  {results.map(
                    (item) => {

                      const recipe =
                        item.recipe;

                      return (
                        <RecipeCard
                          key={
                            recipe._id
                          }
                          recipe={
                            recipe
                          }
                          matchScore={
                            item.matchScore
                          }
                          missingCount={
                            item
                              .missingIngredients
                              ?.length
                          }
                          isFavorite={
                            favoriteIds.has(
                              recipe._id
                            )
                          }
                          onToggleFavorite={
                            toggleFavorite
                          }
                        />
                      );
                    }
                  )}

                </div>

                {/* Pagination */}

                {pages > 1 && (

                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      justify-center
                      gap-4
                      mt-12
                    "
                  >

                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() =>
                        setPage(
                          (current) =>
                            Math.max(
                              1,
                              current - 1
                            )
                        )
                      }
                      className="
                        btn-outline
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                      "
                    >
                      Previous
                    </button>

                    <div
                      className="
                        px-4
                        py-2.5
                        rounded-xl
                        bg-slate-50
                        dark:bg-slate-900
                        border
                        border-slate-200
                        dark:border-slate-800
                        text-sm
                        font-semibold
                        text-slate-600
                        dark:text-slate-300
                      "
                    >
                      Page {page} of {pages}
                    </div>

                    <button
                      type="button"
                      disabled={
                        page >= pages
                      }
                      onClick={() =>
                        setPage(
                          (current) =>
                            Math.min(
                              pages,
                              current + 1
                            )
                        )
                      }
                      className="
                        btn-primary
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                      "
                    >
                      Next

                      <ArrowRight
                        size={16}
                      />
                    </button>

                  </div>

                )}

              </>

            )}

          </div>

        </div>

      </section>

    </main>
  );
}