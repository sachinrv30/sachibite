import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  CalendarDays,
  ShoppingCart,
  Sparkles,
  ArrowRight,
  ChefHat,
  Clock3,
  ListChecks,
  UtensilsCrossed,
  CircleCheck,
  Plus,
  RefreshCcw,
} from 'lucide-react';

import RecipeCard from '../components/RecipeCard';
import { RecipeCardSkeleton } from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [favorites, setFavorites] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [shoppingItems, setShoppingItems] = useState([]);
  const [mealPlan, setMealPlan] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // ============================================================
  // LOAD DASHBOARD DATA
  // ============================================================

  const loadDashboard = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const [
        favoritesRes,
        recommendedRes,
        shoppingRes,
        mealPlanRes,
      ] = await Promise.all([
        api.get('/favorites'),
        api.get('/recipes', {
          params: {
            sort: 'popular',
            limit: 4,
          },
        }),
        api.get('/shopping-list'),
        api.get('/meal-plans'),
      ]);

      setFavorites(favoritesRes.data.data || []);
      setRecommended(recommendedRes.data.data || []);

      setShoppingItems(
        shoppingRes.data.data?.items || []
      );

      setMealPlan(
        mealPlanRes.data.data || null
      );
    } catch (err) {
      console.error('Dashboard loading error:', err);

      setError(
        'We could not load your dashboard data.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // ============================================================
  // MEAL PLAN CALCULATIONS
  // ============================================================

  const mealsPlanned = useMemo(() => {
    if (!mealPlan?.meals) {
      return 0;
    }

    const meals = Object.values(
      mealPlan.meals
    ).flatMap((day) =>
      Object.values(day || {})
    );

    return meals.filter(
      (meal) => meal?.recipeId
    ).length;
  }, [mealPlan]);

  const totalMealSlots = 28;

  const mealProgress = Math.min(
    Math.round(
      (mealsPlanned / totalMealSlots) * 100
    ),
    100
  );

  // ============================================================
  // SHOPPING CALCULATIONS
  // ============================================================

  const shoppingTotal = shoppingItems.length;

  const shoppingPurchased = shoppingItems.filter(
    (item) => item.purchased
  ).length;

  const shoppingRemaining =
    shoppingTotal - shoppingPurchased;

  const shoppingProgress =
    shoppingTotal > 0
      ? Math.round(
          (shoppingPurchased / shoppingTotal) * 100
        )
      : 0;

  // ============================================================
  // USER NAME
  // ============================================================

  const firstName =
    user?.name?.split(' ')[0] || 'there';

  // ============================================================
  // STATS
  // ============================================================

  const stats = [
    {
      icon: Heart,
      label: 'Recipes Saved',
      value: favorites.length,
      description: 'Your favorites',
      to: '/favorites',
      iconStyle:
        'bg-rose-50 text-rose-500 dark:bg-rose-950/30 dark:text-rose-400',
    },
    {
      icon: CalendarDays,
      label: 'Meals Planned',
      value: mealsPlanned,
      description: 'This week',
      to: '/meal-planner',
      iconStyle:
        'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
    },
    {
      icon: ShoppingCart,
      label: 'Shopping Items',
      value: shoppingRemaining,
      description: 'Still to buy',
      to: '/shopping-list',
      iconStyle:
        'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
    },
    {
      icon: Sparkles,
      label: 'Meal Progress',
      value: `${mealsPlanned}/${totalMealSlots}`,
      description: `${mealProgress}% planned`,
      to: '/meal-planner',
      iconStyle:
        'bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400',
    },
  ];

  // ============================================================
  // QUICK ACTIONS
  // ============================================================

  const quickActions = [
    {
      icon: ChefHat,
      title: 'Find a Recipe',
      description: 'Discover something delicious',
      to: '/recipes',
    },
    {
      icon: CalendarDays,
      title: 'Plan Your Week',
      description: 'Build your weekly meals',
      to: '/meal-planner',
    },
    {
      icon: ShoppingCart,
      title: 'Shopping List',
      description: 'See what you need to buy',
      to: '/shopping-list',
    },
    {
      icon: Heart,
      title: 'Saved Recipes',
      description: 'Open your favorites',
      to: '/favorites',
    },
  ];

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (error && !loading) {
    return (
      <div className="section py-12">
        <div className="card p-10 text-center max-w-xl mx-auto">

          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-500 flex items-center justify-center mx-auto mb-5">
            <RefreshCcw className="w-6 h-6" />
          </div>

          <h2 className="font-display font-bold text-xl mb-2">
            Something went wrong
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {error}
          </p>

          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="btn-primary mx-auto"
          >
            <RefreshCcw
              className={`w-4 h-4 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />

            {refreshing
              ? 'Refreshing...'
              : 'Try Again'}
          </button>

        </div>
      </div>
    );
  }

  // ============================================================
  // DASHBOARD
  // ============================================================

  return (
    <div className="min-h-screen">

      {/* ========================================================
          HERO
      ========================================================= */}

      <section className="relative overflow-hidden border-b border-slate-200/70 dark:border-slate-800/70">

        {/* Background glow */}

        <div className="absolute inset-0 pointer-events-none overflow-hidden">

          <div className="absolute -top-40 -right-40 w-[30rem] h-[30rem] rounded-full bg-brand-500/10 blur-3xl" />

          <div className="absolute -bottom-48 -left-40 w-[28rem] h-[28rem] rounded-full bg-leaf-500/10 blur-3xl" />

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-orange-400/5 blur-3xl" />

        </div>

        <div className="section relative py-10 md:py-14 lg:py-16">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">

            {/* Welcome */}

            <div className="max-w-2xl">

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-5">

                <Sparkles className="w-3.5 h-3.5" />

                YOUR KITCHEN DASHBOARD

              </div>

              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] mb-5">

                Welcome back,{' '}

                <span className="text-brand-600 dark:text-brand-400">
                  {firstName}
                </span>
                !

              </h1>

              <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg leading-relaxed max-w-xl">

                Everything you need to discover recipes,
                plan meals, and stay organized in your kitchen.

              </p>

              <div className="flex flex-wrap gap-3 mt-7">

                <Link
                  to="/recipes"
                  className="btn-primary"
                >
                  <ChefHat className="w-4 h-4" />
                  Find Something to Cook
                </Link>

                <Link
                  to="/meal-planner"
                  className="btn-outline"
                >
                  <CalendarDays className="w-4 h-4" />
                  Plan My Week
                </Link>

              </div>

            </div>

            {/* Weekly overview card */}

            <div className="w-full lg:w-[360px] shrink-0">

              <div className="card p-6 relative overflow-hidden">

                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-brand-500/10 blur-2xl" />

                <div className="relative">

                  <div className="flex items-center justify-between mb-5">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        This Week
                      </p>

                      <h2 className="font-display font-bold text-xl mt-1">
                        Kitchen Overview
                      </h2>

                    </div>

                    <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                      <UtensilsCrossed className="w-5 h-5" />
                    </div>

                  </div>

                  {/* Meal progress */}

                  <div className="mb-5">

                    <div className="flex items-center justify-between mb-2">

                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Meals planned
                      </span>

                      <span className="text-sm font-semibold">
                        {mealsPlanned}/{totalMealSlots}
                      </span>

                    </div>

                    <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-leaf-500 transition-all duration-700"
                        style={{
                          width: `${mealProgress}%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* Shopping progress */}

                  <div>

                    <div className="flex items-center justify-between mb-2">

                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Shopping completed
                      </span>

                      <span className="text-sm font-semibold">
                        {shoppingProgress}%
                      </span>

                    </div>

                    <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                        style={{
                          width: `${shoppingProgress}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ========================================================
          MAIN
      ========================================================= */}

      <main className="section py-8 md:py-10">

        {/* ======================================================
            STAT CARDS
        ======================================================= */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">

          {stats.map((stat) => {

            const Icon = stat.icon;

            return (
              <Link
                key={stat.label}
                to={stat.to}
                className="card p-5 card-hover group"
              >

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {stat.label}
                    </p>

                    <p className="font-display font-bold text-2xl md:text-3xl mt-2">
                      {stat.value}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {stat.description}
                    </p>

                  </div>

                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.iconStyle}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                </div>

                <div className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 mt-4 opacity-70 group-hover:opacity-100 transition-opacity">

                  View details

                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />

                </div>

              </Link>
            );
          })}

        </div>

        {/* ======================================================
            MAIN GRID
        ======================================================= */}

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 mb-10">

          {/* ====================================================
              RECOMMENDED
          ===================================================== */}

          <section className="lg:col-span-2">

            <div className="flex items-end justify-between gap-4 mb-5">

              <div>

                <div className="flex items-center gap-2 mb-1">

                  <Sparkles className="w-4 h-4 text-brand-500" />

                  <h2 className="font-display font-bold text-xl md:text-2xl">
                    Recommended for You
                  </h2>

                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Popular recipes to inspire your next meal.
                </p>

              </div>

              <Link
                to="/recipes"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:gap-2 transition-all shrink-0"
              >
                Explore all

                <ArrowRight className="w-4 h-4" />
              </Link>

            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">

              {loading ? (

                Array.from({ length: 4 }).map(
                  (_, index) => (
                    <RecipeCardSkeleton
                      key={index}
                    />
                  )
                )

              ) : recommended.length > 0 ? (

                recommended.map((recipe) => (
                  <RecipeCard
                    key={recipe._id}
                    recipe={recipe}
                  />
                ))

              ) : (

                <div className="sm:col-span-2 xl:col-span-4 card p-10 text-center">

                  <ChefHat className="w-8 h-8 text-slate-300 mx-auto mb-3" />

                  <p className="font-medium mb-1">
                    No recommendations yet
                  </p>

                  <p className="text-sm text-slate-400 mb-5">
                    Explore the recipe collection to discover
                    something new.
                  </p>

                  <Link
                    to="/recipes"
                    className="btn-primary mx-auto"
                  >
                    Explore Recipes
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                </div>

              )}

            </div>

            <Link
              to="/recipes"
              className="flex sm:hidden items-center justify-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 mt-5"
            >
              Explore all recipes
              <ArrowRight className="w-4 h-4" />
            </Link>

          </section>

          {/* ====================================================
              QUICK ACTIONS
          ===================================================== */}

          <section>

            <div className="mb-5">

              <div className="flex items-center gap-2 mb-1">

                <Plus className="w-4 h-4 text-brand-500" />

                <h2 className="font-display font-bold text-xl md:text-2xl">
                  Quick Actions
                </h2>

              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Jump straight into your kitchen workflow.
              </p>

            </div>

            <div className="space-y-3">

              {quickActions.map((action) => {

                const Icon = action.icon;

                return (
                  <Link
                    key={action.title}
                    to={action.to}
                    className="card p-4 flex items-center gap-4 group card-hover"
                  >

                    <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">

                      <Icon className="w-5 h-5" />

                    </div>

                    <div className="flex-1 min-w-0">

                      <h3 className="font-semibold text-sm">
                        {action.title}
                      </h3>

                      <p className="text-xs text-slate-400 mt-0.5">
                        {action.description}
                      </p>

                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all shrink-0" />

                  </Link>
                );
              })}

            </div>

          </section>

        </div>

        {/* ======================================================
            SHOPPING + MEAL PLANNER OVERVIEW
        ======================================================= */}

        <div className="grid md:grid-cols-2 gap-6 mb-10">

          {/* Shopping card */}

          <Link
            to="/shopping-list"
            className="card p-6 card-hover group relative overflow-hidden"
          >

            <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-amber-500/5 blur-2xl" />

            <div className="relative">

              <div className="flex items-start justify-between mb-6">

                <div>

                  <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">

                    <ShoppingCart className="w-5 h-5" />

                  </div>

                  <h2 className="font-display font-bold text-xl">
                    Shopping List
                  </h2>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Keep your grocery trip organized.
                  </p>

                </div>

                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />

              </div>

              <div className="flex items-end justify-between gap-4">

                <div>

                  <p className="font-display font-bold text-3xl">
                    {shoppingRemaining}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    items remaining
                  </p>

                </div>

                <div className="text-right">

                  <p className="text-sm font-semibold">
                    {shoppingProgress}%
                  </p>

                  <p className="text-xs text-slate-400">
                    completed
                  </p>

                </div>

              </div>

              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-5">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                  style={{
                    width: `${shoppingProgress}%`,
                  }}
                />

              </div>

            </div>

          </Link>

          {/* Meal planner card */}

          <Link
            to="/meal-planner"
            className="card p-6 card-hover group relative overflow-hidden"
          >

            <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-brand-500/5 blur-2xl" />

            <div className="relative">

              <div className="flex items-start justify-between mb-6">

                <div>

                  <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">

                    <CalendarDays className="w-5 h-5" />

                  </div>

                  <h2 className="font-display font-bold text-xl">
                    Weekly Meal Plan
                  </h2>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Build a balanced week of meals.
                  </p>

                </div>

                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />

              </div>

              <div className="flex items-end justify-between gap-4">

                <div>

                  <p className="font-display font-bold text-3xl">
                    {mealsPlanned}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    meals planned
                  </p>

                </div>

                <div className="text-right">

                  <p className="text-sm font-semibold">
                    {mealProgress}%
                  </p>

                  <p className="text-xs text-slate-400">
                    week planned
                  </p>

                </div>

              </div>

              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-5">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-leaf-500 transition-all"
                  style={{
                    width: `${mealProgress}%`,
                  }}
                />

              </div>

            </div>

          </Link>

        </div>

        {/* ======================================================
            RECENTLY SAVED
        ======================================================= */}

        <section>

          <div className="flex items-end justify-between gap-4 mb-5">

            <div>

              <div className="flex items-center gap-2 mb-1">

                <Heart className="w-4 h-4 text-rose-500" />

                <h2 className="font-display font-bold text-xl md:text-2xl">
                  Recently Saved
                </h2>

              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your favorite recipes, ready whenever you are.
              </p>

            </div>

            {favorites.length > 0 && (
              <Link
                to="/favorites"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:gap-2 transition-all"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

          </div>

          {loading ? (

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {Array.from({ length: 4 }).map(
                (_, index) => (
                  <RecipeCardSkeleton
                    key={index}
                  />
                )
              )}

            </div>

          ) : favorites.length === 0 ? (

            <div className="card p-10 md:p-14 text-center">

              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 flex items-center justify-center mx-auto mb-4">

                <Heart className="w-6 h-6" />

              </div>

              <h3 className="font-display font-semibold text-lg mb-2">
                Your favorites are waiting
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                Save recipes you love and they'll appear here
                for quick access later.
              </p>

              <Link
                to="/recipes"
                className="btn-primary mx-auto"
              >
                <ChefHat className="w-4 h-4" />
                Explore Recipes
              </Link>

            </div>

          ) : (

            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {favorites
                  .slice(0, 4)
                  .map((recipe) => (
                    <RecipeCard
                      key={recipe._id}
                      recipe={recipe}
                    />
                  ))}

              </div>

              <Link
                to="/favorites"
                className="flex sm:hidden items-center justify-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 mt-5"
              >
                View all saved recipes
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>

          )}

        </section>

        {/* ======================================================
            BOTTOM MOTIVATION
        ======================================================= */}

        <div className="mt-10 rounded-2xl overflow-hidden relative border border-brand-200/50 dark:border-brand-900/50 bg-gradient-to-br from-brand-50 via-white to-leaf-50 dark:from-brand-950/40 dark:via-slate-900 dark:to-leaf-950/30">

          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-brand-500/10 blur-3xl" />

          <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>

              <div className="flex items-center gap-2 mb-2">

                <CircleCheck className="w-5 h-5 text-leaf-600 dark:text-leaf-400" />

                <span className="text-xs font-semibold uppercase tracking-wider text-leaf-700 dark:text-leaf-400">
                  Keep cooking
                </span>

              </div>

              <h2 className="font-display font-bold text-xl md:text-2xl">
                Make this week delicious.
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                Discover new recipes, organize your meals, and
                make grocery shopping effortless.
              </p>

            </div>

            <Link
              to="/recipes"
              className="btn-primary shrink-0"
            >
              Discover Recipes
              <ArrowRight className="w-4 h-4" />
            </Link>

          </div>

        </div>

      </main>

    </div>
  );
}