import { Link } from 'react-router-dom';
import {
  ChefHat,
  ArrowUpRight,
  Heart,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">

      <div className="section py-14 lg:py-16">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] gap-10">

          {/* Brand */}
          <div>

            <Link
              to="/"
              className="inline-flex items-center gap-3"
            >

              <span className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <ChefHat className="w-5 h-5" />
              </span>

              <div>
                <span className="block font-display font-extrabold text-xl">
                  SachiBite
                </span>

                <span className="block text-[9px] uppercase tracking-[0.18em] text-slate-400 font-semibold -mt-0.5">
                  by Sachin R V
                </span>
              </div>

            </Link>

            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400 max-w-xs mt-5">
              Turn the ingredients you already have into meals worth making.
            </p>

            <div className="flex items-center gap-2 mt-6 text-xs text-slate-400">
              Made with
              <Heart className="w-3.5 h-3.5 fill-brand-500 text-brand-500" />
              for food lovers.
            </div>

          </div>

          {/* Product */}
          <div>

            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-900 dark:text-white mb-5">
              Product
            </h4>

            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">

              <li>
                <Link
                  to="/recipes"
                  className="hover:text-brand-600 transition"
                >
                  Explore recipes
                </Link>
              </li>

              <li>
                <Link
                  to="/meal-planner"
                  className="hover:text-brand-600 transition"
                >
                  Meal planner
                </Link>
              </li>

              <li>
                <Link
                  to="/shopping-list"
                  className="hover:text-brand-600 transition"
                >
                  Shopping list
                </Link>
              </li>

              <li>
                <Link
                  to="/favorites"
                  className="hover:text-brand-600 transition"
                >
                  Favorites
                </Link>
              </li>

            </ul>

          </div>

          {/* Account */}
          <div>

            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-900 dark:text-white mb-5">
              Account
            </h4>

            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">

              <li>
                <Link
                  to="/login"
                  className="hover:text-brand-600 transition"
                >
                  Log in
                </Link>
              </li>

              <li>
                <Link
                  to="/register"
                  className="hover:text-brand-600 transition"
                >
                  Create account
                </Link>
              </li>

              <li>
                <Link
                  to="/dashboard"
                  className="hover:text-brand-600 transition"
                >
                  Dashboard
                </Link>
              </li>

              <li>
                <Link
                  to="/profile"
                  className="hover:text-brand-600 transition"
                >
                  Profile
                </Link>
              </li>

            </ul>

          </div>

          {/* About */}
          <div>

            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-900 dark:text-white mb-5">
              About SachiBite
            </h4>

            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
              A full-stack recipe discovery and meal planning platform built with React, Node.js, Express and MongoDB.
            </p>

            <div className="mt-4">
              <p className="text-xs text-slate-400">
                Designed & developed by
              </p>

              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">
                Sachin R V
              </p>
            </div>

            <Link
              to="/recipes"
              className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Start exploring
              <ArrowUpRight className="w-4 h-4" />
            </Link>

          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-slate-100 dark:border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} SachiBite. All rights reserved.
          </p>

          <p className="text-xs text-slate-400">
            Built by{' '}
            <span className="font-semibold text-slate-500 dark:text-slate-300">
              Sachin R V
            </span>{' '}
            for smarter everyday cooking.
          </p>

        </div>

      </div>

    </footer>
  );
}