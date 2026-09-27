const CUISINES = ['indian', 'italian', 'mexican', 'chinese', 'japanese', 'korean', 'mediterranean', 'continental', 'asian'];
const CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snack'];
const DIETS = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'high-protein', 'low-calorie', 'keto'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

function FilterGroup({ title, options, selected, onToggle }) {
  return (
    <div className="mb-5">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">{title}</h4>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => onToggle(opt)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize border transition ${
                active
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-400'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterPanel({ filters, setFilters }) {
  const toggle = (key, value) => {
    setFilters((prev) => {
      const set = new Set(prev[key]);
      set.has(value) ? set.delete(value) : set.add(value);
      return { ...prev, [key]: Array.from(set) };
    });
  };

  const clearAll = () =>
    setFilters({ cuisine: [], category: [], diet: [], difficulty: [] });

  const activeCount = Object.values(filters).flat().length;

  return (
    <div className="card p-5 sticky top-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold">Filters</h3>
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-xs text-brand-600 font-medium hover:underline">
            Clear all
          </button>
        )}
      </div>
      <FilterGroup title="Cuisine" options={CUISINES} selected={filters.cuisine} onToggle={(v) => toggle('cuisine', v)} />
      <FilterGroup title="Meal type" options={CATEGORIES} selected={filters.category} onToggle={(v) => toggle('category', v)} />
      <FilterGroup title="Dietary" options={DIETS} selected={filters.diet} onToggle={(v) => toggle('diet', v)} />
      <FilterGroup title="Difficulty" options={DIFFICULTIES} selected={filters.difficulty} onToggle={(v) => toggle('difficulty', v)} />
    </div>
  );
}
