import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

import api from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'kitchly_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================================
  // INITIALIZE AUTHENTICATION
  // ==========================================================

  const initializeAuth = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');

      if (response.data?.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      }
    } catch (error) {
      console.error(
        'Authentication initialization failed:',
        error
      );

      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = async (email, password) => {
    const response = await api.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });

    if (
      !response.data?.success ||
      !response.data?.token
    ) {
      throw new Error(
        response.data?.message ||
          'Login failed'
      );
    }

    localStorage.setItem(
      TOKEN_KEY,
      response.data.token
    );

    setUser(response.data.user);

    return response.data.user;
  };

  // ==========================================================
  // REGISTER
  // ==========================================================

  const register = async (
    name,
    email,
    password
  ) => {
    const response = await api.post(
      '/auth/register',
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      }
    );

    if (
      !response.data?.success ||
      !response.data?.token
    ) {
      throw new Error(
        response.data?.message ||
          'Registration failed'
      );
    }

    localStorage.setItem(
      TOKEN_KEY,
      response.data.token
    );

    setUser(response.data.user);

    return response.data.user;
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  // ==========================================================
  // REFRESH USER
  // ==========================================================

  const refreshUser = async () => {
    try {
      const response = await api.get(
        '/auth/me'
      );

      if (
        response.data?.success &&
        response.data?.user
      ) {
        setUser(response.data.user);

        return response.data.user;
      }

      return null;
    } catch (error) {
      console.error(
        'Failed to refresh user:',
        error
      );

      return null;
    }
  };

  // ==========================================================
  // CONTEXT
  // ==========================================================

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export const useAuth = () =>
  useContext(AuthContext);