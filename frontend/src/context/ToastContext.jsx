import {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

import {
  CheckCircle2,
  XCircle,
  Info,
  X,
} from 'lucide-react';

const ToastContext = createContext(null);

let idCounter = 0;

const TOAST_DURATION = 3500;

// ============================================================
// TOAST CONTEXT
// ============================================================

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // ==========================================================
  // REMOVE TOAST
  // ==========================================================

  const removeToast = useCallback((id) => {
    setToasts((previous) =>
      previous.filter(
        (toast) => toast.id !== id
      )
    );
  }, []);

  // ==========================================================
  // SHOW TOAST
  // ==========================================================

  const showToast = useCallback(
    (message, type = 'success') => {
      if (!message) {
        return;
      }

      const id = ++idCounter;

      const toast = {
        id,
        message,
        type,
      };

      setToasts((previous) => [
        ...previous,
        toast,
      ]);

      window.setTimeout(() => {
        removeToast(id);
      }, TOAST_DURATION);
    },
    [removeToast]
  );

  // ==========================================================
  // ICONS
  // ==========================================================

  const icons = {
    success: (
      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
    ),

    error: (
      <XCircle className="w-5 h-5 text-red-500 shrink-0" />
    ),

    info: (
      <Info className="w-5 h-5 text-brand-500 shrink-0" />
    ),
  };

  // ==========================================================
  // STYLES
  // ==========================================================

  const styles = {
    success:
      'border-emerald-200/80 bg-emerald-50/95 dark:border-emerald-900/50 dark:bg-emerald-950/80',

    error:
      'border-red-200/80 bg-red-50/95 dark:border-red-900/50 dark:bg-red-950/80',

    info:
      'border-brand-200/80 bg-brand-50/95 dark:border-brand-900/50 dark:bg-brand-950/80',
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        removeToast,
      }}
    >
      {children}

      {/* ====================================================
          TOAST CONTAINER
      ===================================================== */}

      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 w-[calc(100%-2rem)] max-w-sm pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >

        {toasts.map((toast) => (

          <div
            key={toast.id}
            role={
              toast.type === 'error'
                ? 'alert'
                : 'status'
            }
            className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 rounded-2xl border backdrop-blur-xl shadow-xl shadow-slate-900/10 dark:shadow-black/30 px-4 py-3.5 animate-[fadeIn_0.2s_ease-out] ${styles[toast.type] || styles.info}`}
          >

            {/* Icon */}

            <div className="mt-0.5">
              {icons[toast.type] || icons.info}
            </div>

            {/* Message */}

            <p className="text-sm font-medium leading-relaxed flex-1 text-slate-700 dark:text-slate-200">
              {toast.message}
            </p>

            {/* Close */}

            <button
              type="button"
              onClick={() =>
                removeToast(toast.id)
              }
              aria-label="Dismiss notification"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Progress bar */}

            <div
              className={`absolute bottom-0 left-0 h-0.5 ${
                toast.type === 'success'
                  ? 'bg-emerald-500'
                  : toast.type === 'error'
                  ? 'bg-red-500'
                  : 'bg-brand-500'
              } animate-[toastProgress_3.5s_linear_forwards]`}
            />

          </div>

        ))}

      </div>
    </ToastContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export const useToast = () =>
  useContext(ToastContext);