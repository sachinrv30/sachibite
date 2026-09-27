import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  ChefHat,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  CheckCircle,
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

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ==========================================================
  // UPDATE FIELD
  // ==========================================================

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError('');
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    if (!form.name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!form.email.trim()) {
      setError(
        'Please enter your email address.'
      );
      return;
    }

    if (form.password.length < 8) {
      setError(
        'Password must contain at least 8 characters.'
      );
      return;
    }

    if (form.password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      await register(
        form.name,
        form.email,
        form.password
      );

      showToast(
        'Account created successfully. Welcome to SachiBite!',
        'success'
      );

      navigate('/dashboard', {
        replace: true,
      });
    } catch (err) {
      console.error(
        'Registration error:',
        err
      );

      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        'Registration failed. Please try again.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // PASSWORD STATUS
  // ==========================================================

  const passwordValid =
    form.password.length >= 8;

  const passwordsMatch =
    form.password.length > 0 &&
    confirmPassword.length > 0 &&
    form.password === confirmPassword;

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-slate-50 dark:bg-slate-950">

      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        <div className="absolute -top-40 -right-40 w-[30rem] h-[30rem] rounded-full bg-brand-500/10 blur-3xl" />

        <div className="absolute top-1/3 -left-40 w-[28rem] h-[28rem] rounded-full bg-leaf-500/10 blur-3xl" />

        <div className="absolute -bottom-48 right-1/3 w-[25rem] h-[25rem] rounded-full bg-brand-400/5 blur-3xl" />

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

                {/* Badge */}

                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/50 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-6">

                  <Sparkles className="w-3.5 h-3.5" />

                  WELCOME TO SACHIBITE

                </div>

                {/* Heading */}

                <h1 className="font-display font-bold text-5xl xl:text-6xl tracking-tight leading-[1.05] mb-6">

                  Your kitchen.

                  <br />

                  <span className="text-brand-600 dark:text-brand-400">
                    Your way.
                  </span>

                </h1>

                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl mb-8">
                  Create your SachiBite account and bring
recipes, meal planning, favorites, and
shopping lists together in one place.
                </p>

                {/* Feature cards */}

                <div className="grid grid-cols-2 gap-3 max-w-lg">

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm p-4">

                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3">
                      <Utensils className="w-5 h-5" />
                    </div>

                    <p className="font-semibold text-sm">
                      Explore recipes
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Discover meals for every day.
                    </p>

                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm p-4">

                    <div className="w-10 h-10 rounded-xl bg-leaf-50 dark:bg-leaf-950/40 text-leaf-600 dark:text-leaf-400 flex items-center justify-center mb-3">
                      <CalendarDays className="w-5 h-5" />
                    </div>

                    <p className="font-semibold text-sm">
                      Plan meals
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Build your perfect week.
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
                      Keep recipes you love.
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
                      Make SachiBite yours.
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                REGISTER CARD
            ================================================== */}

            <div className="w-full max-w-md mx-auto lg:ml-auto">

              <div className="card p-6 sm:p-8 md:p-9 shadow-xl shadow-slate-900/5 dark:shadow-black/20">

                {/* Header */}

                <div className="text-center mb-7">

                  <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">

                    <ChefHat className="w-8 h-8" />

                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2">

                    <Sparkles className="w-3 h-3" />

                    GET STARTED

                  </div>

                  <h1 className="font-display text-3xl font-bold tracking-tight">
                    Create your account
                  </h1>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Start your personalized cooking journey.
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

                  {/* =================================================
                      NAME
                  ================================================== */}

                  <div>

                    <label
                      htmlFor="register-name"
                      className="block text-sm font-semibold mb-2"
                    >
                      Full name
                    </label>

                    <div className="relative">

                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                      <input
                        id="register-name"
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) =>
                          updateField(
                            'name',
                            e.target.value
                          )
                        }
                        placeholder="Enter your full name"
                        className="input !pl-11"
                        autoComplete="name"
                        autoFocus
                      />

                    </div>

                  </div>

                  {/* =================================================
                      EMAIL
                  ================================================== */}

                  <div>

                    <label
                      htmlFor="register-email"
                      className="block text-sm font-semibold mb-2"
                    >
                      Email address
                    </label>

                    <div className="relative">

                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                      <input
                        id="register-email"
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
                      />

                    </div>

                  </div>

                  {/* =================================================
                      PASSWORD
                  ================================================== */}

                  <div>

                    <label
                      htmlFor="register-password"
                      className="block text-sm font-semibold mb-2"
                    >
                      Password
                    </label>

                    <div className="relative">

                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                      <input
                        id="register-password"
                        type={
                          showPassword
                            ? 'text'
                            : 'password'
                        }
                        required
                        minLength={8}
                        value={form.password}
                        onChange={(e) =>
                          updateField(
                            'password',
                            e.target.value
                          )
                        }
                        placeholder="Minimum 8 characters"
                        className="input !pl-11 !pr-12"
                        autoComplete="new-password"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (value) =>
                              !value
                          )
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label={
                          showPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>

                    </div>

                    {/* Password requirement */}

                    <div className="mt-2 flex items-center gap-2">

                      <CheckCircle
                        className={`w-4 h-4 ${
                          passwordValid
                            ? 'text-emerald-500'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />

                      <span
                        className={`text-xs ${
                          passwordValid
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-400'
                        }`}
                      >
                        At least 8 characters
                      </span>

                    </div>

                  </div>

                  {/* =================================================
                      CONFIRM PASSWORD
                  ================================================== */}

                  <div>

                    <label
                      htmlFor="register-confirm-password"
                      className="block text-sm font-semibold mb-2"
                    >
                      Confirm password
                    </label>

                    <div className="relative">

                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                      <input
                        id="register-confirm-password"
                        type={
                          showConfirmPassword
                            ? 'text'
                            : 'password'
                        }
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(
                            e.target.value
                          );
                          setError('');
                        }}
                        placeholder="Re-enter your password"
                        className="input !pl-11 !pr-12"
                        autoComplete="new-password"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (value) =>
                              !value
                          )
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label={
                          showConfirmPassword
                            ? 'Hide confirmation password'
                            : 'Show confirmation password'
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>

                    </div>

                    {/* Match status */}

                    {confirmPassword.length > 0 && (
                      <div
                        className={`mt-2 flex items-center gap-2 text-xs ${
                          passwordsMatch
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-400'
                        }`}
                      >

                        <CheckCircle className="w-3.5 h-3.5" />

                        {passwordsMatch
                          ? 'Passwords match'
                          : 'Passwords must match'}

                      </div>
                    )}

                  </div>

                  {/* =================================================
                      SUBMIT
                  ================================================== */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center py-3.5 text-sm font-semibold group disabled:opacity-70 disabled:cursor-not-allowed"
                  >

                    {loading ? (
                      <>
                        <Spinner />

                        <span>
                          Creating account...
                        </span>
                      </>
                    ) : (
                      <>
                        <span>
                          Create SachiBite account
                        </span>

                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}

                  </button>

                </form>

                {/* Security */}

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
                    ALREADY A MEMBER?
                  </span>

                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />

                </div>

                {/* Login */}

                <Link
                  to="/login"
                  className="group flex items-center justify-center gap-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-950/20 transition-all"
                >

                  Sign in to your account

                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />

                </Link>

              </div>

              {/* Bottom */}

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