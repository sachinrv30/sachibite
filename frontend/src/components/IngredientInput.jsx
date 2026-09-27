import { useState } from 'react';
import { Plus, X } from 'lucide-react';

const COMMON_INGREDIENTS = [
  'chicken', 'rice', 'tomato', 'onion', 'garlic', 'egg', 'bread', 'cheese',
  'paneer', 'spinach', 'potato', 'beef', 'shrimp', 'mushroom', 'broccoli',
  'lemon', 'butter', 'milk', 'yogurt', 'basil', 'olive oil', 'chickpeas',
];

export default function IngredientInput({ ingredients, setIngredients, placeholder = 'e.g. chicken, rice, tomato' }) {
  const [value, setValue] = useState('');

  const suggestions = value.length
    ? COMMON_INGREDIENTS.filter(
        (i) => i.includes(value.toLowerCase()) && !ingredients.includes(i)
      ).slice(0, 6)
    : [];

  const addIngredient = (raw) => {
    const name = raw.trim().toLowerCase();
    if (!name || ingredients.includes(name)) return;
    setIngredients([...ingredients, name]);
    setValue('');
  };

  const removeIngredient = (name) => setIngredients(ingredients.filter((i) => i !== name));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addIngredient(value);
    }
  };

  return (
    <div>
      <div className="relative">
        <input
          className="input pr-12"
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Add an ingredient"
        />
        <button
          type="button"
          onClick={() => addIngredient(value)}
          className="absolute right-1.5 top-1.5 w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700"
          aria-label="Add ingredient"
        >
          <Plus className="w-4 h-4" />
        </button>

        {suggestions.length > 0 && (
          <div className="absolute z-20 mt-1 w-full card p-1.5 space-y-0.5">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => addIngredient(s)}
                className="w-full text-left text-sm px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 capitalize"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {ingredients.map((ing) => (
            <span key={ing} className="chip capitalize">
              {ing}
              <button onClick={() => removeIngredient(ing)} aria-label={`Remove ${ing}`}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
