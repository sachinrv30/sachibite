import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

const ThemeContext = createContext(null);

const THEME_KEY = 'kitchly_theme';

function getInitialTheme() {
  const savedTheme =
    localStorage.getItem(THEME_KEY);

  if (
    savedTheme === 'light' ||
    savedTheme === 'dark'
  ) {
    return savedTheme;
  }

  if (
    typeof window !== 'undefined' &&
    window.matchMedia
  ) {
    return window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
      ? 'dark'
      : 'light';
  }

  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    getInitialTheme
  );

  // ==========================================================
  // APPLY THEME
  // ==========================================================

  useEffect(() => {
    const root =
      document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem(
      THEME_KEY,
      theme
    );
  }, [theme]);

  // ==========================================================
  // TOGGLE THEME
  // ==========================================================

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === 'dark'
        ? 'light'
        : 'dark'
    );
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () =>
  useContext(ThemeContext);