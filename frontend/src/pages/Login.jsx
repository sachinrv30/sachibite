import { useState } from 'react';
import {
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import {
  ChefHat,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Utensils,
  CalendarDays,
  Heart,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Spinner } from '../components/Loader';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();

  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    if (!form.email || !form.password) {
      setError(
        'Please enter your email and password.'
      );
      return;
    }

    try {
      setLoading(true);

      await login(
        form.email,
        form.password
      );

      showToast(
        'Welcome back to Kitchly!',
        'success'
      );

      navigate(
        location.state?.from?.pathname ||
          '/dashboard',
        {
          replace: true,
        }
      );
    } catch (err) {
      console.error(
        'Login error:',
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          'Unable to sign in. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError('');
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-slate-50 dark:bg-slate-950">

      {/* =====================================================
          BACKGROUND DECORATION
      ====================================================== */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        <div className="absolute -top-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-brand-500/10 blur-3xl" />

        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-leaf-500/10 blur-3xl" />

        <div className="absolute -bottom-48 left-1/3 w-[24rem] h-[24rem] rounded-full bg-brand-400/5 blur-3xl" />

      </div>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <div className="relative section py-8 md:py-12 lg:py-16">

        <div className="max-w-6xl mx-auto">

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* =================================================
                LEFT BRAND PANEL
            ================================================== */}

            <div className="hidden lg:block">

              <div className="relative">

                {/* Small badge */}

                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/50 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-6">

                  <Sparkles className="w-3.5 h-3.5" />

                  YOUR PERSONAL KITCHEN COMPANION

                </div>

                {/* Heading */}

                <h1 className="font-display font-bold text-5xl xl:text-6xl tracking-tight leading-[1.05] mb-6">

                  Cook smarter.

                  <br />

                  <span className="text-brand-600 dark:text-brand-400">
                    Eat better.
                  </span>

                </h1>

                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl mb-8">
                 Discover recipes, organize your meals,
                build shopping lists, and make everyday
                cooking feel effortless with SachiBite.
                </p>

                {/* Feature cards */}

                <div className="grid grid-cols-2 gap-3 max-w-lg">

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm p-4">

                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3">
                      <Utensils className="w-5 h-5" />
                    </div>

                    <p className="font-semibold text-sm">
                      Discover recipes
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Find meals you'll love.
                    </p>

                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm p-4">

                    <div className="w-10 h-10 rounded-xl bg-leaf-50 dark:bg-leaf-950/40 text-leaf-600 dark:text-leaf-400 flex items-center justify-center mb-3">
                      <CalendarDays className="w-5 h-5" />
                    </div>

                    <p className="font-semibold text-sm">
                      Plan your week
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Organize meals with ease.
                    </p>

                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm p-4">

                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400 flex items-center justify-center mb-3">
                      <Heart className="w-5 h-5" />
                    </div>

                    <p className="font-semibold text-sm">
                      Save favorites
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Keep your favorites close.
                    </p>

                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm p-4">

                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                      <ShieldCheck className="w-5 h-5" />
                    </div>

                    <p className="font-semibold text-sm">
                      Personalized
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Recipes made for you.
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                LOGIN CARD
            ================================================== */}

            <div className="w-full max-w-md mx-auto lg:ml-auto">

              <div className="card p-6 sm:p-8 md:p-9 shadow-xl shadow-slate-900/5 dark:shadow-black/20">

                {/* Logo */}

                <div className="text-center mb-8">

                  <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">

                    <ChefHat className="w-8 h-8" />

                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2">

                    <Sparkles className="w-3 h-3" />

                    'Welcome back to SachiBite!'

                  </div>

                  <h2 className="font-display text-3xl font-bold tracking-tight">
                    Sign in to SachiBite
                  </h2>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Continue planning delicious meals.
                  </p>

                </div>

                {/* Error */}

                {error && (
                  <div
                    role="alert"
                    className="mb-5 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30 px-4 py-3"
                  >
                    <div className="flex items-start gap-2">

                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />

                      <p className="text-sm text-red-700 dark:text-red-300">
                        {error}
                      </p>

                    </div>
                  </div>
                )}

                {/* Form */}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  {/* Email */}

                  <div>

                    <label
                      htmlFor="login-email"
                      className="block text-sm font-semibold mb-2"
                    >
                      Email address
                    </label>

                    <div className="relative">

                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                      <input
                        id="login-email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) =>
                          updateField(
                            'email',
                            e.target.value
                          )
                        }
                        placeholder="you@example.com"
                        className="input !pl-11"
                        autoComplete="email"
                        autoFocus
                      />

                    </div>

                  </div>

                  {/* Password */}

                  <div>

                    <div className="flex items-center justify-between mb-2">

                      <label
                        htmlFor="login-password"
                        className="block text-sm font-semibold"
                      >
                        Password
                      </label>

                    </div>

                    <div className="relative">

                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                      <input
                        id="login-password"
                        type={
                          showPassword
                            ? 'text'
                            : 'password'
                        }
                        required
                        value={form.password}
                        onChange={(e) =>
                          updateField(
                            'password',
                            e.target.value
                          )
                        }
                        placeholder="Enter your password"
                        className="input !pl-11 !pr-12"
                        autoComplete="current-password"
                      />

                      <button
                        type="button"
                        aria-label={
                          showPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                        onClick={() =>
                          setShowPassword(
                            (value) =>
                              !value
                          )
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>

                    </div>

                  </div>

                  {/* Submit */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center py-3.5 text-sm font-semibold group disabled:opacity-70 disabled:cursor-not-allowed"
                  >

                    {loading ? (
                      <>
                        <Spinner />
                        <span>
                          Signing in...
                        </span>
                      </>
                    ) : (
                      <>
                        <span>
                          Sign in to SachiBite
                        </span>

                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}

                  </button>

                </form>

                {/* Security note */}

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">

                  <ShieldCheck className="w-3.5 h-3.5" />

                  <span>
                    Your account information stays secure.
                  </span>

                </div>

                {/* Divider */}

                <div className="flex items-center gap-3 my-7">

                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />

                  <span className="text-xs text-slate-400">
                    NEW TO SACHIBITE?
                  </span>

                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />

                </div>

                {/* Register */}

                <Link
                  to="/register"
                  className="group flex items-center justify-center gap-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-950/20 transition-all"
                >

                  Create your SachiBite account

                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />

                </Link>

              </div>

              {/* Bottom text */}

              <p className="text-center text-xs text-slate-400 mt-5">
                Cook. Plan. Discover. Enjoy.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}