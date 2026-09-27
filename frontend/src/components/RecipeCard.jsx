import { Link } from 'react-router-dom';

import {
  Heart,
  Clock,
  Flame,
  Gauge,
  ArrowUpRight,
} from 'lucide-react';

export default function RecipeCard({
  recipe,
  matchScore,
  missingCount,
  isFavorite,
  onToggleFavorite,
}) {
  const totalTime =
    (recipe.prepTime || 0) +
    (recipe.cookTime || 0);

  return (
    <article className="group card card-hover overflow-hidden">

      {/* Image */}

      <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-slate-800">

        <Link
          to={`/recipes/${recipe._id}`}
          className="block w-full h-full"
        >
          <img
            src={recipe.image}
            alt={recipe.title}
            loading="lazy"
            className="recipe-image group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.src =
                'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80';
            }}
          />

          {/* Image gradient */}

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-70" />
        </Link>

        {/* Match */}

        {typeof matchScore === 'number' && (
          <span className="absolute top-4 left-4 rounded-full bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 text-xs font-bold text-brand-600 shadow-lg">
            {matchScore}% match
          </span>
        )}

        {/* Favorite */}

        {onToggleFavorite && (
          <button
            onClick={() =>
              onToggleFavorite(recipe._id)
            }
            aria-label="Toggle favorite"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 dark:bg-slate-900/95 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <Heart
              className={`w-[18px] h-[18px] transition-colors ${
                isFavorite
                  ? 'fill-brand-600 text-brand-600'
                  : 'text-slate-500 dark:text-slate-300'
              }`}
            />
          </button>
        )}

        {/* Time */}

        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/45 backdrop-blur-md text-white px-3 py-1.5 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" />
          {totalTime} min
        </div>

      </div>

      {/* Content */}

      <div className="p-5">

        <div className="flex items-start justify-between gap-3">

          <Link
            to={`/recipes/${recipe._id}`}
            className="min-w-0"
          >
            <h3 className="font-display text-base font-bold leading-snug line-clamp-1 group-hover:text-brand-600 transition-colors">
              {recipe.title}
            </h3>
          </Link>

          <Link
            to={`/recipes/${recipe._id}`}
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-brand-600 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/20 transition"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>

        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 min-h-[40px]">
          {recipe.description}
        </p>

        {/* Metadata */}

        <div className="flex items-center gap-3 mt-4 text-xs text-slate-500 dark:text-slate-400">

          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {totalTime}m
          </span>

          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />

          <span className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5" />
            {recipe.difficulty}
          </span>

          {recipe.nutrition?.calories && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />

              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                {recipe.nutrition.calories}
              </span>
            </>
          )}

        </div>

        {/* Tags */}

        <div className="flex items-center justify-between gap-3 mt-5">

          <div className="flex flex-wrap gap-1.5">

            {(recipe.dietaryTags || [])
              .slice(0, 2)
              .map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300"
                >
                  {tag}
                </span>
              ))}

          </div>

          {typeof missingCount === 'number' &&
            missingCount > 0 && (
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                {missingCount} missing
              </span>
            )}

        </div>

      </div>

    </article>
  );
}