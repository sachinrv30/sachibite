import { useState } from 'react';
import {
  User,
  Sun,
  Moon,
  Save,
  ShieldCheck,
  Clock3,
  UtensilsCrossed,
  Heart,
  AlertTriangle,
  Check,
  Mail,
  Sparkles,
  Settings2,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const DIETS = [
  'vegetarian',
  'vegan',
  'non-vegetarian',
  'keto',
  'high-protein',
  'low-carb',
  'gluten-free',
  'dairy-free',
];

const ALLERGENS = [
  'peanuts',
  'milk',
  'eggs',
  'soy',
  'gluten',
  'shellfish',
];

const CUISINES = [
  'indian',
  'italian',
  'mexican',
  'chinese',
  'japanese',
  'korean',
  'mediterranean',
  'continental',
];

const MEALS = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
];

// ============================================================
// MULTI SELECT
// ============================================================

function MultiToggle({
  options,
  selected,
  onChange,
}) {
  const toggle = (value) => {
    const current = new Set(selected);

    if (current.has(value)) {
      current.delete(value);
    } else {
      current.add(value);
    }

    onChange(Array.from(current));
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option);

        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium capitalize border transition-all duration-200 ${
              active
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm shadow-brand-500/20'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-900/50 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                active
                  ? 'border-white/60 bg-white/10'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
            >
              {active && (
                <Check className="w-2.5 h-2.5" />
              )}
            </span>

            {option}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// SECTION HEADER
// ============================================================

function SectionHeader({
  icon: Icon,
  title,
  description,
  iconClass = 'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400',
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}
      >
        <Icon className="w-5 h-5" />
      </div>

      <div>
        <h2 className="font-display font-semibold text-lg">
          {title}
        </h2>

        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// PROFILE
// ============================================================

export default function Profile() {
  const { user, setUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [name, setName] = useState(
    user?.name || ''
  );

  const [diet, setDiet] = useState(
    user?.preferences?.diet || []
  );

  const [maxPrepTime, setMaxPrepTime] = useState(
    user?.preferences?.maxPrepTime || 45
  );

  const [allergies, setAllergies] = useState(
    user?.allergies || []
  );

  const [customAllergy, setCustomAllergy] =
    useState('');

  const [favoriteCuisines, setFavoriteCuisines] =
    useState(user?.favoriteCuisines || []);

  const [mealPreferences, setMealPreferences] =
    useState(user?.mealPreferences || []);

  const [saving, setSaving] = useState(false);

  // ==========================================================
  // SAVE
  // ==========================================================

  const save = async () => {
    if (!name.trim()) {
      showToast(
        'Please enter your name.',
        'error'
      );

      return;
    }

    setSaving(true);

    try {
      await api.put('/users/profile', {
        name: name.trim(),
        theme,
      });

      const res = await api.put(
        '/users/preferences',
        {
          preferences: {
            diet,
            maxPrepTime,
          },
          allergies,
          favoriteCuisines,
          mealPreferences,
        }
      );

      setUser(res.data.user);

      showToast(
        'Profile updated successfully.',
        'success'
      );
    } catch (err) {
      console.error(
        'Profile update error:',
        err
      );

      showToast(
        'Could not save your profile.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // ADD CUSTOM ALLERGY
  // ==========================================================

  const addCustomAllergy = () => {
    const value =
      customAllergy.trim().toLowerCase();

    if (!value) {
      return;
    }

    if (allergies.includes(value)) {
      showToast(
        'This allergy is already added.',
        'info'
      );

      setCustomAllergy('');

      return;
    }

    setAllergies([
      ...allergies,
      value,
    ]);

    setCustomAllergy('');
  };

  // ==========================================================
  // REMOVE CUSTOM ALLERGY
  // ==========================================================

  const removeAllergy = (allergy) => {
    setAllergies((current) =>
      current.filter(
        (item) => item !== allergy
      )
    );
  };

  // ==========================================================
  // INITIALS
  // ==========================================================

  const initials =
    name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'U';

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen">

      {/* ======================================================
          HERO
      ======================================================= */}

      <section className="relative overflow-hidden border-b border-slate-200/70 dark:border-slate-800/70">

        <div className="absolute inset-0 pointer-events-none overflow-hidden">

          <div className="absolute -top-40 -right-40 w-[30rem] h-[30rem] rounded-full bg-brand-500/10 blur-3xl" />

          <div className="absolute -bottom-48 -left-40 w-[28rem] h-[28rem] rounded-full bg-leaf-500/10 blur-3xl" />

        </div>

        <div className="section relative py-10 md:py-14">

          <div className="flex flex-col md:flex-row md:items-center gap-6">

            {/* Avatar */}

            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-brand-500 to-leaf-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/20 shrink-0">

              <span className="font-display font-bold text-2xl md:text-3xl">
                {initials}
              </span>

            </div>

            {/* Heading */}

            <div className="flex-1">

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-3">

                <Settings2 className="w-3.5 h-3.5" />

                PERSONALIZATION

              </div>

              <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-3">
                Profile & Settings
              </h1>

              <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-2xl">
                Personalize your recipes, meal plans,
                dietary preferences, and kitchen experience.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
          MAIN
      ======================================================= */}

      <main className="section py-8 md:py-10">

        <div className="grid lg:grid-cols-[1fr_300px] gap-8">

          {/* ====================================================
              LEFT CONTENT
          ===================================================== */}

          <div className="space-y-6">

            {/* ==================================================
                PERSONAL INFORMATION
            =================================================== */}

            <section className="card p-5 md:p-6">

              <SectionHeader
                icon={User}
                title="Personal information"
                description="Manage the basic information associated with your account."
              />

              <div className="space-y-5">

                <div>

                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2 block">
                    Full name
                  </label>

                  <input
                    className="input"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Enter your name"
                  />

                </div>

                <div>

                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2 block">
                    Email address
                  </label>

                  <div className="relative">

                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

                    <input
                      className="input !pl-10 bg-slate-50 dark:bg-slate-900/60"
                      value={user?.email || ''}
                      disabled
                    />

                  </div>

                  <p className="text-xs text-slate-400 mt-2">
                    Your email address is linked to your
                    account and cannot be changed here.
                  </p>

                </div>

              </div>

            </section>

            {/* ==================================================
                DIET
            =================================================== */}

            <section className="card p-5 md:p-6">

              <SectionHeader
                icon={UtensilsCrossed}
                title="Dietary preferences"
                description="Select the eating styles you'd like SachiBite to consider."
              />

              <MultiToggle
                options={DIETS}
                selected={diet}
                onChange={setDiet}
              />

            </section>

            {/* ==================================================
                ALLERGIES
            =================================================== */}

            <section className="card p-5 md:p-6">

              <SectionHeader
                icon={AlertTriangle}
                title="Allergies & ingredients to avoid"
                description="These preferences can help you identify recipes that may not be suitable."
                iconClass="bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
              />

              <div className="mb-5">

                <MultiToggle
                  options={ALLERGENS}
                  selected={allergies}
                  onChange={setAllergies}
                />

              </div>

              <div className="flex flex-col sm:flex-row gap-3">

                <input
                  className="input flex-1"
                  placeholder="Add a custom allergy..."
                  value={customAllergy}
                  onChange={(e) =>
                    setCustomAllergy(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomAllergy();
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={addCustomAllergy}
                  className="btn-secondary shrink-0"
                >
                  Add Allergy
                </button>

              </div>

              {allergies.length > 0 && (
                <div className="mt-5">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    Selected allergies
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {allergies.map((allergy) => (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() =>
                          removeAllergy(
                            allergy
                          )
                        }
                        className="chip capitalize hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 transition-colors"
                        title="Remove allergy"
                      >
                        {allergy}

                        <span className="ml-1.5 text-slate-400">
                          ×
                        </span>
                      </button>
                    ))}

                  </div>

                </div>
              )}

            </section>

            {/* ==================================================
                CUISINES
            =================================================== */}

            <section className="card p-5 md:p-6">

              <SectionHeader
                icon={Heart}
                title="Favorite cuisines"
                description="Tell SachiBite what kinds of food you enjoy most."
                iconClass="bg-rose-50 text-rose-500 dark:bg-rose-950/30 dark:text-rose-400"
              />

              <MultiToggle
                options={CUISINES}
                selected={favoriteCuisines}
                onChange={setFavoriteCuisines}
              />

            </section>

            {/* ==================================================
                MEAL PREFERENCES
            =================================================== */}

            <section className="card p-5 md:p-6">

              <SectionHeader
                icon={Clock3}
                title="Meal preferences"
                description="Choose the types of meals you usually plan."
              />

              <MultiToggle
                options={MEALS}
                selected={mealPreferences}
                onChange={setMealPreferences}
              />

            </section>

            {/* ==================================================
                PREP TIME
            =================================================== */}

            <section className="card p-5 md:p-6">

              <SectionHeader
                icon={Clock3}
                title="Cooking time"
                description="Set the maximum preparation time you'd normally like to spend."
              />

              <div className="max-w-md">

                <div className="flex items-center justify-between mb-3">

                  <label className="text-sm font-medium">
                    Maximum preparation time
                  </label>

                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 text-xs font-semibold">
                    {maxPrepTime} minutes
                  </span>

                </div>

                <input
                  type="range"
                  min="10"
                  max="180"
                  step="5"
                  value={maxPrepTime}
                  onChange={(e) =>
                    setMaxPrepTime(
                      Number(e.target.value)
                    )
                  }
                  className="w-full accent-brand-600 cursor-pointer"
                />

                <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                  <span>10 min</span>
                  <span>1 hour</span>
                  <span>3 hours</span>
                </div>

              </div>

            </section>

            {/* ==================================================
                THEME
            =================================================== */}

            <section className="card p-5 md:p-6">

              <SectionHeader
                icon={
                  theme === 'dark'
                    ? Moon
                    : Sun
                }
                title="Appearance"
                description="Choose how SachiBite looks on your device."
              />

              <div className="grid sm:grid-cols-2 gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setTheme('light')
                  }
                  className={`relative p-4 rounded-2xl border text-left transition-all ${
                    theme === 'light'
                      ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-brand-300'
                  }`}
                >

                  <div className="flex items-center gap-3">

                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        theme === 'light'
                          ? 'bg-white text-brand-600 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      <Sun className="w-5 h-5" />
                    </div>

                    <div>

                      <p className="font-semibold text-sm">
                        Light
                      </p>

                      <p className="text-xs text-slate-400 mt-0.5">
                        Bright and clean
                      </p>

                    </div>

                    {theme === 'light' && (
                      <Check className="w-4 h-4 text-brand-600 ml-auto" />
                    )}

                  </div>

                </button>

                <button
                  type="button"
                  onClick={() =>
                    setTheme('dark')
                  }
                  className={`relative p-4 rounded-2xl border text-left transition-all ${
                    theme === 'dark'
                      ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-brand-300'
                  }`}
                >

                  <div className="flex items-center gap-3">

                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        theme === 'dark'
                          ? 'bg-slate-800 text-brand-400 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      <Moon className="w-5 h-5" />
                    </div>

                    <div>

                      <p className="font-semibold text-sm">
                        Dark
                      </p>

                      <p className="text-xs text-slate-400 mt-0.5">
                        Easy on the eyes
                      </p>

                    </div>

                    {theme === 'dark' && (
                      <Check className="w-4 h-4 text-brand-600 ml-auto" />
                    )}

                  </div>

                </button>

              </div>

            </section>

            {/* ==================================================
                SAVE
            =================================================== */}

            <div className="sticky bottom-4 z-20">

              <div className="card p-3 md:p-4 shadow-xl shadow-slate-900/10 dark:shadow-black/30">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                  <div className="flex items-center gap-3">

                    <div className="w-9 h-9 rounded-lg bg-leaf-50 dark:bg-leaf-950/30 text-leaf-600 dark:text-leaf-400 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>

                    <div>

                      <p className="text-sm font-semibold">
                        Your preferences
                      </p>

                      <p className="text-xs text-slate-400">
                        Changes are saved to your account.
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={save}
                    disabled={saving}
                    className="btn-primary"
                  >

                    {saving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}

                  </button>

                </div>

              </div>

            </div>

          </div>

          {/* ====================================================
              RIGHT SIDEBAR
          ===================================================== */}

          <aside className="space-y-5">

            {/* Profile summary */}

            <div className="card p-6">

              <div className="flex flex-col items-center text-center">

                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-leaf-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/20 mb-4">

                  <span className="font-display font-bold text-2xl">
                    {initials}
                  </span>

                </div>

                <h2 className="font-display font-bold text-xl">
                  {name || 'Your Profile'}
                </h2>

                <p className="text-sm text-slate-400 mt-1 break-all">
                  {user?.email}
                </p>

              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 mt-6 pt-5">

                <div className="flex items-center justify-between text-sm mb-3">

                  <span className="text-slate-500 dark:text-slate-400">
                    Diet preferences
                  </span>

                  <span className="font-semibold">
                    {diet.length}
                  </span>

                </div>

                <div className="flex items-center justify-between text-sm mb-3">

                  <span className="text-slate-500 dark:text-slate-400">
                    Allergies
                  </span>

                  <span className="font-semibold">
                    {allergies.length}
                  </span>

                </div>

                <div className="flex items-center justify-between text-sm">

                  <span className="text-slate-500 dark:text-slate-400">
                    Favorite cuisines
                  </span>

                  <span className="font-semibold">
                    {favoriteCuisines.length}
                  </span>

                </div>

              </div>

            </div>

            {/* Personalization tip */}

            <div className="rounded-2xl border border-brand-200/60 dark:border-brand-900/50 bg-gradient-to-br from-brand-50 to-leaf-50 dark:from-brand-950/40 dark:to-leaf-950/20 p-5">

              <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-900/50 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">

                <Sparkles className="w-5 h-5" />

              </div>

              <h3 className="font-display font-semibold mb-2">
                Personalize your experience
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                The more preferences you add, the easier it
                becomes to find recipes that fit your cooking
                style.
              </p>

            </div>

            {/* Privacy note */}

            <div className="card p-5">

              <div className="flex items-start gap-3">

                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">

                  <ShieldCheck className="w-4 h-4" />

                </div>

                <div>

                  <h3 className="font-semibold text-sm mb-1">
                    Your preferences
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Your dietary preferences and allergy
                    selections are used to personalize your
                    SachiBite experience.
                  </p>

                </div>

              </div>

            </div>

          </aside>

        </div>

      </main>

    </div>
  );
}