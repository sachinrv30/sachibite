import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import {
  ChefHat,
  Moon,
  Sun,
  Menu,
  X,
  User,
  LogOut,
  Heart,
  CalendarDays,
  ShoppingCart,
  LayoutDashboard,
  Search,
  ChevronDown,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navLinks = [
  {
    to: '/recipes',
    label: 'Explore',
    icon: Search,
  },
  {
    to: '/meal-planner',
    label: 'Meal Planner',
    icon: CalendarDays,
  },
  {
    to: '/shopping-list',
    label: 'Shopping List',
    icon: ShoppingCart,
  },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `relative flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
      isActive
        ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20'
        : 'text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-50 dark:hover:bg-slate-800/70'
    }`;

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 dark:border-slate-800 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl">

      <nav className="section h-[72px] flex items-center justify-between">

        {/* Logo */}

{/* Logo */}

<Link
  to="/"
  className="flex items-center gap-3 group"
>
  <span className="relative w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-600/20 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">
    <ChefHat className="w-5 h-5" />

    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white dark:border-slate-950" />
  </span>

  <div className="hidden sm:block">
    <div className="font-display font-extrabold text-lg tracking-tight">
      SachiBite
    </div>

    <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold -mt-0.5">
      Discover. Plan. Cook.
    </div>
  </div>
</Link>

        {/* Desktop Navigation */}

        <div className="hidden lg:flex items-center gap-1">

          {navLinks.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={linkClass}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </NavLink>
            );
          })}

          {user && (
            <NavLink
              to="/favorites"
              className={linkClass}
            >
              <Heart className="w-4 h-4" />
              Favorites
            </NavLink>
          )}

        </div>

        {/* Right controls */}

        <div className="flex items-center gap-2">

          {/* Theme */}

          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-[18px] h-[18px]" />
            ) : (
              <Moon className="w-[18px] h-[18px]" />
            )}
          </button>

          {/* Authenticated */}

          {user ? (
            <div className="relative hidden md:block">

              <button
                onClick={() => setProfileOpen((value) => !value)}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >

                <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center font-bold text-sm">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>

                <div className="hidden xl:block text-left">
                  <p className="text-xs font-semibold max-w-[100px] truncate">
                    {user.name}
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Account
                  </p>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    profileOpen ? 'rotate-180' : ''
                  }`}
                />

              </button>

              {profileOpen && (
                <>

                  <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setProfileOpen(false)}
                  />

                  <div className="absolute right-0 top-[calc(100%+10px)] w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-2">

                    <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-800 mb-1">

                      <p className="font-semibold text-sm truncate">
                        {user.name}
                      </p>

                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {user.email}
                      </p>

                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>

                    <Link
                      to="/favorites"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Heart className="w-4 h-4" />
                      Favorites
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>

                  </div>

                </>
              )}

            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">

              <Link
                to="/login"
                className="btn-outline !px-4 !py-2.5"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="btn-primary !px-4 !py-2.5"
              >
                Get started
              </Link>

            </div>
          )}

          {/* Mobile menu */}

          <button
            className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            {open ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

        </div>

      </nav>

      {/* Mobile navigation */}

      {open && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">

          <div className="section py-4 space-y-1">

            {navLinks.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Icon className="w-5 h-5 text-slate-400" />
                  {link.label}
                </Link>
              );
            })}

            {user ? (
              <>
                <Link
                  to="/favorites"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Heart className="w-5 h-5 text-slate-400" />
                  Favorites
                </Link>

                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <LayoutDashboard className="w-5 h-5 text-slate-400" />
                  Dashboard
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <User className="w-5 h-5 text-slate-400" />
                  Profile
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <LogOut className="w-5 h-5" />
                  Sign out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-3">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="btn-outline"
                >
                  Log in
                </Link>

                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="btn-primary"
                >
                  Get started
                </Link>
              </div>
            )}

          </div>

        </div>
      )}

    </header>
  );
}