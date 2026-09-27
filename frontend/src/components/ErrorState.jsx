import { AlertTriangle, RefreshCcw, Home, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
  title = 'We hit a snag',
  showHome = false,
  showBack = false,
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">

        {/* Icon */}
        <div
          className="
            relative mx-auto mb-6
            w-20 h-20
            rounded-3xl
            bg-gradient-to-br from-red-50 to-orange-50
            dark:from-red-950/40 dark:to-orange-950/20
            border border-red-100 dark:border-red-900/40
            flex items-center justify-center
            shadow-sm
          "
        >
          <div
            className="
              absolute inset-2
              rounded-2xl
              border border-red-200/60
              dark:border-red-800/40
            "
          />

          <AlertTriangle
            className="relative w-8 h-8 text-red-500"
            strokeWidth={2}
          />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-500">
            Something went wrong
          </p>

          <h3
            className="
              font-display
              text-2xl sm:text-3xl
              font-bold
              tracking-tight
              text-slate-900
              dark:text-white
            "
          >
            {title}
          </h3>

          <p
            className="
              mx-auto
              max-w-md
              text-sm sm:text-base
              leading-7
              text-slate-500
              dark:text-slate-400
            "
          >
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-7">

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="
                btn-primary
                !px-5
                !py-3
                shadow-lg
                shadow-orange-500/10
              "
            >
              <RefreshCcw className="w-4 h-4" />
              Try again
            </button>
          )}

          {showBack && (
            <button
              type="button"
              onClick={() => window.history.back()}
              className="btn-outline !px-5 !py-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Go back
            </button>
          )}

          {showHome && (
            <Link
              to="/"
              className="btn-outline !px-5 !py-3"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
          )}

        </div>

        {/* Small help message */}
        <div
          className="
            mt-8
            inline-flex items-center
            rounded-full
            bg-slate-50
            dark:bg-slate-900
            border border-slate-200
            dark:border-slate-800
            px-4 py-2
          "
        >
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Don't worry — your data is safe.
          </span>
        </div>

      </div>
    </div>
  );
}