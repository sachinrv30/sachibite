import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Search,
  X,
  Sparkles,
  Clock3,
  Flame,
  ArrowRight,
  ChefHat,
  HeartOff,
} from 'lucide-react';

import RecipeCard from '../components/RecipeCard';
import { RecipeCardSkeleton } from '../components/Loader';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const { showToast } = useToast();

  // ============================================================
  // LOAD FAVORITES
  // ============================================================

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get('/favorites');

      setFavorites(res.data.data || []);
    } catch (err) {
      console.error('Favorites loading error:', err);

      setError(
        'We could not load your favorites.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ============================================================
  // REMOVE FAVORITE
  // ============================================================

  const removeFavorite = async (recipeId) => {
    setRemovingId(recipeId);

    try {
      await api.delete(`/favorites/${recipeId}`);

      setFavorites((prev) =>
        prev.filter(
          (recipe) => recipe._id !== recipeId
        )
      );

      showToast(
        'Removed from favorites.',
        'info'
      );
    } catch (err) {
      console.error(
        'Remove favorite error:',
        err
      );

      showToast(
        'Could not remove favorite.',
        'error'
      );
    } finally {
      setRemovingId(null);
    }
  };

  // ============================================================
  // FILTER + SORT
  // ============================================================

  const filtered = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    const results = favorites.filter((recipe) =>
      recipe.title
        ?.toLowerCase()
        .includes(normalizedQuery)
    );

    return [...results].sort((a, b) => {
      if (sort === 'fastest') {
        const aTime =
          Number(a.prepTime || 0) +
          Number(a.cookTime || 0);

        const bTime =
          Number(b.prepTime || 0) +
          Number(b.cookTime || 0);

        return aTime - bTime;
      }

      if (sort === 'calories') {
        return (
          Number(a.nutrition?.calories || 0) -
          Number(b.nutrition?.calories || 0)
        );
      }

      if (sort === 'title') {
        return (a.title || '').localeCompare(
          b.title || ''
        );
      }

      return 0;
    });
  }, [favorites, query, sort]);

  // ============================================================
  // STATS
  // ============================================================

  const totalFavorites = favorites.length;

  const averageTime =
    totalFavorites > 0
      ? Math.round(
          favorites.reduce(
            (total, recipe) =>
              total +
              Number(recipe.prepTime || 0) +
              Number(recipe.cookTime || 0),
            0
          ) / totalFavorites
        )
      : 0;

  const averageCalories =
    totalFavorites > 0
      ? Math.round(
          favorites.reduce(
            (total, recipe) =>
              total +
              Number(
                recipe.nutrition?.calories || 0
              ),
            0
          ) / totalFavorites
        )
      : 0;

  const visibleCount = filtered.length;

  const hasSearch =
    query.trim().length > 0;

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="section py-10 md:py-12">

        <div className="mb-8">
          <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="h-10 w-64 rounded bg-slate-200 dark:bg-slate-800 animate-pulse mb-3" />
          <div className="h-4 w-96 max-w-full rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map(
            (_, index) => (
              <div
                key={index}
                className="card p-5"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse mb-4" />
                <div className="h-7 w-16 rounded bg-slate-200 dark:bg-slate-800 animate-pulse mb-2" />
                <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>
            )
          )}
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <RecipeCardSkeleton key={index} />
            )
          )}
        </div>

      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="section py-10">
        <ErrorState
          message={error}
          onRetry={load}
        />
      </div>
    );
  }

  // ============================================================
  // EMPTY FAVORITES
  // ============================================================

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen">

        <section className="relative overflow-hidden border-b border-slate-200/70 dark:border-slate-800/70">

          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-rose-500/10 blur-3xl" />
            <div className="absolute -bottom-40 -left-32 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl" />
          </div>

          <div className="section relative py-10 md:py-14">

            <div className="max-w-2xl">

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-4">
                <Heart className="w-3.5 h-3.5" />
                YOUR COLLECTION
              </div>

              <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-4">
                Your Favorites
              </h1>

              <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg">
                Save recipes you love and keep your
                best meal ideas in one place.
              </p>

            </div>

          </div>

        </section>

        <main className="section py-10">

          <div className="card p-8 md:p-14">

            <EmptyState
              icon={Heart}
              title="No favorites yet"
              description="Save recipes you love and they'll show up here for quick access."
              action={
                <Link
                  to="/recipes"
                  className="btn-primary"
                >
                  <ChefHat className="w-4 h-4" />
                  Explore Recipes
                </Link>
              }
            />

          </div>

        </main>

      </div>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div className="min-h-screen">

      {/* ========================================================
          HERO
      ========================================================= */}

      <section className="relative overflow-hidden border-b border-slate-200/70 dark:border-slate-800/70">

        <div className="absolute inset-0 pointer-events-none overflow-hidden">

          <div className="absolute -top-40 -right-40 w-[30rem] h-[30rem] rounded-full bg-rose-500/10 blur-3xl" />

          <div className="absolute -bottom-48 -left-40 w-[28rem] h-[28rem] rounded-full bg-brand-500/10 blur-3xl" />

        </div>

        <div className="section relative py-10 md:py-14">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

            <div className="max-w-2xl">

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-4">

                <Heart className="w-3.5 h-3.5 fill-current" />

                YOUR COLLECTION

              </div>

              <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-4">

                Your Favorites

              </h1>

              <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg leading-relaxed max-w-xl">

                Your hand-picked collection of recipes
                ready whenever inspiration strikes.

              </p>

            </div>

            <Link
              to="/recipes"
              className="btn-primary shrink-0"
            >
              <ChefHat className="w-4 h-4" />
              Discover More Recipes
              <ArrowRight className="w-4 h-4" />
            </Link>

          </div>

        </div>

      </section>

      {/* ========================================================
          MAIN
      ========================================================= */}

      <main className="section py-8 md:py-10">

        {/* ======================================================
            STATS
        ======================================================= */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          <FavoriteStat
            icon={Heart}
            value={totalFavorites}
            label="Saved Recipes"
            iconClass="bg-rose-50 text-rose-500 dark:bg-rose-950/30 dark:text-rose-400"
          />

          <FavoriteStat
            icon={Clock3}
            value={`${averageTime}m`}
            label="Average Time"
            iconClass="bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
          />

          <FavoriteStat
            icon={Flame}
            value={averageCalories}
            label="Avg. Calories"
            iconClass="bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
          />

          <FavoriteStat
            icon={Sparkles}
            value={visibleCount}
            label="Currently Shown"
            iconClass="bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400"
          />

        </div>

        {/* ======================================================
            SEARCH + FILTER
        ======================================================= */}

        <section className="card p-4 md:p-5 mb-8">

          <div className="flex flex-col lg:flex-row gap-3">

            <div className="relative flex-1">

              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />

              <input
                className="input !pl-11 !pr-10"
                placeholder="Search your favorite recipes..."
                value={query}
                onChange={(e) =>
                  setQuery(e.target.value)
                }
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

            </div>

            <select
              className="input lg:w-56"
              value={sort}
              onChange={(e) =>
                setSort(e.target.value)
              }
            >
              <option value="recent">
                Recently added
              </option>

              <option value="fastest">
                Fastest to cook
              </option>

              <option value="calories">
                Lowest calories
              </option>

              <option value="title">
                A-Z
              </option>
            </select>

          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">

            <div className="flex items-center gap-2 text-xs text-slate-400">

              <Heart className="w-3.5 h-3.5 text-rose-400" />

              {hasSearch
                ? `${visibleCount} ${
                    visibleCount === 1
                      ? 'recipe'
                      : 'recipes'
                  } found`
                : `${totalFavorites} ${
                    totalFavorites === 1
                      ? 'recipe'
                      : 'recipes'
                  } saved`}

            </div>

            {hasSearch && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
              >
                Clear search
              </button>
            )}

          </div>

        </section>

        {/* ======================================================
            RESULTS
        ======================================================= */}

        {filtered.length === 0 ? (

          <div className="card p-8 md:p-12">

            <div className="text-center max-w-md mx-auto">

              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">

                <HeartOff className="w-6 h-6" />

              </div>

              <h2 className="font-display font-semibold text-lg mb-2">
                No matching recipes
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                We couldn't find a favorite recipe matching
                "{query}".
              </p>

              <button
                type="button"
                onClick={() => setQuery('')}
                className="btn-outline mx-auto"
              >
                Clear Search
              </button>

            </div>

          </div>

        ) : (

          <section>

            <div className="flex items-center justify-between gap-4 mb-5">

              <div>

                <div className="flex items-center gap-2">

                  <Heart className="w-4 h-4 text-rose-500 fill-current" />

                  <h2 className="font-display font-bold text-xl md:text-2xl">
                    Saved Recipes
                  </h2>

                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Your recipes, your collection.
                </p>

              </div>

            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">

              {filtered.map((recipe) => (
                <div
                  key={recipe._id}
                  className={`relative transition-opacity ${
                    removingId === recipe._id
                      ? 'opacity-50 pointer-events-none'
                      : ''
                  }`}
                >

                  <RecipeCard
                    recipe={recipe}
                    isFavorite
                    onToggleFavorite={
                      removeFavorite
                    }
                  />

                </div>
              ))}

            </div>

          </section>

        )}

        {/* ======================================================
            BOTTOM CTA
        ======================================================= */}

        <div className="mt-10 rounded-2xl overflow-hidden relative border border-brand-200/50 dark:border-brand-900/50 bg-gradient-to-br from-brand-50 via-white to-rose-50 dark:from-brand-950/40 dark:via-slate-900 dark:to-rose-950/20">

          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-brand-500/10 blur-3xl" />

          <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>

              <div className="flex items-center gap-2 mb-2">

                <Sparkles className="w-4 h-4 text-brand-500" />

                <span className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">
                  Keep exploring
                </span>

              </div>

              <h2 className="font-display font-bold text-xl md:text-2xl">
                Looking for your next favorite?
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                Explore more recipes and discover something
                delicious to add to your collection.
              </p>

            </div>

            <Link
              to="/recipes"
              className="btn-primary shrink-0"
            >
              Explore Recipes
              <ArrowRight className="w-4 h-4" />
            </Link>

          </div>

        </div>

      </main>

    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function FavoriteStat({
  icon: Icon,
  value,
  label,
  iconClass,
}) {
  return (
    <div className="card p-4 md:p-5 card-hover">

      <div className="flex items-start justify-between gap-3">

        <div>

          <p className="font-display font-bold text-2xl md:text-3xl">
            {value}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            {label}
          </p>

        </div>

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}
        >
          <Icon className="w-5 h-5" />
        </div>

      </div>

    </div>
  );
}