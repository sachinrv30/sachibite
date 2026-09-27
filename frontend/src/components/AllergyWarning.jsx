import { AlertTriangle } from 'lucide-react';

export default function AllergyWarning() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 mb-4">
      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Allergy warning</p>
        <p className="text-xs text-amber-700 dark:text-amber-400">
          This recipe contains ingredients that may conflict with your saved allergy preferences. Please review the ingredient list carefully.
        </p>
      </div>
    </div>
  );
}
