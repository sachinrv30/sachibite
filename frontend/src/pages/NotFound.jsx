import { Link } from 'react-router-dom';
import {
  ChefHat,
  Home,
  ArrowLeft,
  Search,
  Sparkles,
} from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-16">

      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] rounded-full bg-brand-500/10 blur-3xl" />

        <div className="absolute -bottom-48 -right-40 w-[30rem] h-[30rem] rounded-full bg-leaf-500/10 blur-3xl" />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20rem] h-[20rem] rounded-full bg-brand-400/5 blur-3xl" />

      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="relative w-full max-w-2xl text-center">

        {/* Floating badge */}

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/50 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-7">

          <Sparkles className="w-3.5 h-3.5" />

          OOPS! SOMETHING WENT WRONG

        </div>

        {/* Large 404 */}

        <div className="relative mb-2">

          <h1 className="font-display font-black text-[8rem] sm:text-[10rem] leading-none tracking-tighter text-slate-200 dark:text-slate-800 select-none">

            404

          </h1>

          {/* Center icon */}

          <div className="absolute inset-0 flex items-center justify-center">

            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-2xl shadow-brand-500/25 rotate-3">

              <ChefHat className="w-10 h-10 sm:w-12 sm:h-12" />

            </div>

          </div>

        </div>

        {/* Heading */}

        <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-4">

          This page isn't on the menu.

        </h2>

        {/* Description */}

        <p className="max-w-lg mx-auto text-slate-500 dark:text-slate-400 leading-relaxed mb-8">

          The page you're looking for doesn't exist,
          may have moved, or the link might be incorrect.
          Let's get you back to something delicious.

        </p>

        {/* Actions */}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">

          <Link
            to="/"
            className="btn-primary w-full sm:w-auto justify-center px-6 py-3 group"
          >

            <Home className="w-4 h-4" />

            Back to Home

            <ArrowLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-1" />

          </Link>

          <Link
            to="/recipes"
            className="btn-outline w-full sm:w-auto justify-center px-6 py-3 group"
          >

            <Search className="w-4 h-4" />

            Explore Recipes

            <ArrowLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-1" />

          </Link>

        </div>

        {/* Helpful links */}

        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800">

          <p className="text-xs text-slate-400 mb-3">
            Looking for something else?
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium">

            <Link
              to="/dashboard"
              className="text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors"
            >
              Dashboard
            </Link>

            <Link
              to="/favorites"
              className="text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors"
            >
              Favorites
            </Link>

            <Link
              to="/meal-planner"
              className="text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors"
            >
              Meal Planner
            </Link>

            <Link
              to="/shopping-list"
              className="text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors"
            >
              Shopping List
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}