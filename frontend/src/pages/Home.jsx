import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  Search,
  Sparkles,
  CalendarDays,
  ShoppingCart,
  Heart,
  ArrowRight,
  ChefHat,
  CheckCircle2,
  Utensils,
  Clock3,
} from 'lucide-react';

import IngredientInput from '../components/IngredientInput';
import RecipeCard from '../components/RecipeCard';
import { RecipeCardSkeleton } from '../components/Loader';
import api from '../services/api';

const HOW_IT_WORKS = [
  {
    icon: Search,
    number: '01',
    title: 'Add your ingredients',
    text: 'Tell Kitchly what you already have in your fridge and pantry.',
  },
  {
    icon: Sparkles,
    number: '02',
    title: 'Discover your matches',
    text: 'Get recipe suggestions based on the ingredients you have.',
  },
  {
    icon: CalendarDays,
    number: '03',
    title: 'Plan your week',
    text: 'Build a complete meal schedule without the daily guesswork.',
  },
  {
    icon: ShoppingCart,
    number: '04',
    title: 'Shop smarter',
    text: 'Generate a focused shopping list for everything you are missing.',
  },
];

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=85',
];

export default function Home() {
  const [ingredients, setIngredients] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/recipes', {
        params: {
          sort: 'popular',
          limit: 6,
        },
      })
      .then((response) => {
        setPopular(response.data.data || []);
      })
      .catch((error) => {
        console.error(
          'Unable to load popular recipes:',
          error
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleFindRecipes = () => {
    if (!ingredients.length) {
      navigate('/recipes');
      return;
    }

    navigate(
      `/recipes?ingredients=${encodeURIComponent(
        ingredients.join(',')
      )}`
    );
  };

  return (
    <div className="page-enter">

      {/* =====================================
          HERO
      ====================================== */}

      <section className="relative overflow-hidden hero-glow">

        {/* Decorative shapes */}

        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />

        <div className="absolute bottom-0 -left-32 w-96 h-96 rounded-full bg-green-400/10 blur-3xl pointer-events-none" />

        <div className="section relative pt-12 sm:pt-20 lg:pt-24 pb-16 lg:pb-24">

          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 xl:gap-20 items-center">

            {/* Left */}

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 dark:border-brand-900/60 bg-brand-50/80 dark:bg-brand-900/20 px-4 py-2 mb-6">

                <Sparkles className="w-4 h-4 text-brand-600" />

                <span className="text-xs font-bold text-brand-700 dark:text-brand-300">
                  SMARTER COOKING STARTS HERE
                </span>

              </div>

              <h1 className="font-display font-extrabold tracking-[-0.04em] text-5xl sm:text-6xl lg:text-[4.4rem] leading-[1.02] max-w-3xl">

                What's in your kitchen?

                <span className="block text-brand-600 mt-2">
                  Let's make dinner.
                </span>

              </h1>

              <p className="mt-7 text-base sm:text-lg leading-8 text-slate-600 dark:text-slate-400 max-w-xl">
                SachiBite turns the ingredients you already have into delicious recipes, weekly meal plans, and smarter shopping lists.
              </p>

              {/* Search card */}

              <div className="mt-9 max-w-xl">

                <div className="card p-3 sm:p-4 shadow-2xl shadow-slate-900/10 dark:shadow-black/30">

                  <div className="px-2 pt-1 pb-3">

                    <div className="flex items-center gap-2">

                      <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                        <Utensils className="w-4 h-4 text-brand-600" />
                      </div>

                      <div>
                        <p className="text-sm font-bold">
                          What can I cook?
                        </p>

                        <p className="text-xs text-slate-400">
                          Add what you have at home
                        </p>
                      </div>

                    </div>

                  </div>

                  <IngredientInput
                    ingredients={ingredients}
                    setIngredients={setIngredients}
                  />

                  <button
                    onClick={handleFindRecipes}
                    className="btn-primary w-full mt-3 py-3.5"
                  >
                    Find my recipes

                    <ArrowRight className="w-4 h-4" />
                  </button>

                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 px-2 text-xs text-slate-500 dark:text-slate-400">

                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    No complicated setup
                  </span>

                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    Personalized matches
                  </span>

                </div>

              </div>

            </div>

            {/* Right visual */}

            <div className="relative max-w-xl mx-auto w-full">

              <div className="relative grid grid-cols-[1.1fr_0.9fr] gap-4">

                <div className="relative">

                  <img
                    src={HERO_IMAGES[0]}
                    alt="Fresh homemade meal"
                    className="w-full h-[430px] sm:h-[520px] object-cover rounded-[2rem] shadow-2xl"
                    onError={(event) => {
                      event.currentTarget.src =
                        'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85';
                    }}
                  />

                  <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                  {/* Floating recipe info */}

                  <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 shadow-xl">

                    <div className="flex items-center justify-between gap-3">

                      <div>

                        <p className="text-[10px] uppercase tracking-wider font-bold text-brand-600">
                          Today's inspiration
                        </p>

                        <p className="font-display font-bold mt-1">
                          Fresh & delicious
                        </p>

                      </div>

                      <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
                        <ChefHat className="w-5 h-5 text-brand-600" />
                      </div>

                    </div>

                  </div>

                </div>

                <div className="flex flex-col gap-4 pt-10">

                  <img
                    src={HERO_IMAGES[1]}
                    alt="Fresh ingredients"
                    className="w-full h-48 sm:h-60 object-cover rounded-[1.5rem] shadow-xl"
                  />

                  <img
                    src={HERO_IMAGES[2]}
                    alt="Healthy meal bowl"
                    className="w-full h-48 sm:h-60 object-cover rounded-[1.5rem] shadow-xl"
                  />

                </div>

              </div>

              {/* Floating stats */}

              <div className="absolute -left-5 bottom-12 hidden sm:flex items-center gap-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-2xl float">

                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Clock3 className="w-5 h-5 text-green-600" />
                </div>

                <div>
                  <p className="text-sm font-bold">
                    Less planning
                  </p>

                  <p className="text-[11px] text-slate-400">
                    More time cooking
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================
          TRUST / VALUE STRIP
      ====================================== */}

      <section className="border-y border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40">

        <div className="section py-7 grid grid-cols-2 lg:grid-cols-4 gap-6">

          {[
            ['26+', 'Curated recipes'],
            ['4', 'Planning tools'],
            ['1', 'Smart kitchen'],
            ['∞', 'Meal possibilities'],
          ].map(([value, label]) => (
            <div
              key={label}
              className="text-center"
            >
              <p className="font-display text-2xl font-extrabold text-brand-600">
                {value}
              </p>

              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                {label}
              </p>
            </div>
          ))}

        </div>

      </section>

      {/* =====================================
          HOW IT WORKS
      ====================================== */}

      <section className="section py-20 lg:py-24">

        <div className="text-center max-w-2xl mx-auto mb-12">

          <span className="eyebrow">
            Simple by design
          </span>

          <h2 className="section-title mt-3">
            From fridge to dinner in four steps.
          </h2>

          <p className="section-description mx-auto">
            Everything SachiBite does is designed to reduce the everyday friction of deciding what to cook.
          </p>

        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {HOW_IT_WORKS.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="group card card-hover p-6 relative overflow-hidden"
              >

                <div className="absolute top-4 right-5 text-5xl font-black text-slate-100 dark:text-slate-800/80 select-none">
                  {step.number}
                </div>

                <div className="relative">

                  <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5 text-brand-600 group-hover:text-white" />
                  </div>

                  <h3 className="font-display font-bold text-base">
                    {step.title}
                  </h3>

                  <p className="text-sm leading-6 text-slate-500 dark:text-slate-400 mt-2">
                    {step.text}
                  </p>

                </div>

              </div>
            );
          })}

        </div>

      </section>

      {/* =====================================
          POPULAR RECIPES
      ====================================== */}

      <section className="section py-20 lg:py-24">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">

          <div>

            <span className="eyebrow">
              Get inspired
            </span>

            <h2 className="section-title mt-2">
              Popular this week
            </h2>

            <p className="section-description">
              Recipes worth adding to your next meal plan.
            </p>

          </div>

          <Link
            to="/recipes"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 shrink-0"
          >
            Explore all recipes
            <ArrowRight className="w-4 h-4" />
          </Link>

        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <RecipeCardSkeleton key={index} />
              ))
            : popular.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                />
              ))}

        </div>

      </section>

      {/* =====================================
          CTA
      ====================================== */}

      <section className="section pb-20 lg:pb-28">

        <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white p-8 sm:p-12 lg:p-16">

          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/20 rounded-full blur-3xl" />

          <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />

          <div className="relative grid lg:grid-cols-[1fr_auto] items-center gap-10">

            <div className="max-w-2xl">

              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-brand-300">
                <Sparkles className="w-3.5 h-3.5" />
                YOUR KITCHEN, ORGANIZED
              </span>

              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-5">
                Stop wondering what to cook.
                <span className="block text-brand-400">
                  Start cooking what you have.
                </span>
              </h2>

              <p className="text-slate-400 mt-5 leading-7 max-w-xl">
                Save your favorite recipes, organize your week, and turn missing ingredients into one simple shopping list.
              </p>

            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">

              <Link
                to="/register"
                className="btn-primary !bg-brand-500 hover:!bg-brand-400 !text-white whitespace-nowrap"
              >
                Create free account
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/recipes"
                className="btn !bg-white/10 !text-white hover:!bg-white/15 whitespace-nowrap"
              >
                Browse recipes
              </Link>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}