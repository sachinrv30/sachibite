import { useState } from 'react';
import { Utensils } from 'lucide-react';

const FALLBACK = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=85';

export default function RecipeImage({ src, alt = '', className = '', sizes }) {
  const [failed, setFailed] = useState(false);
  const source = failed || !src ? FALLBACK : src;

  return (
    <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${className}`}>
      <img
        src={source}
        alt={alt}
        sizes={sizes}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
      {failed && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-900/5 dark:bg-white/5">
          <span className="rounded-full bg-white/90 p-3 shadow-sm dark:bg-slate-900/90">
            <Utensils className="h-5 w-5 text-brand-600" />
          </span>
        </div>
      )}
    </div>
  );
}
