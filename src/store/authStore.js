import { create } from 'zustand';

const loadStoredAuth = () => {
  try {
    const rawUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const user = rawUser ? JSON.parse(rawUser) : null;
    if (!token || !user) {
      return { user: null, token: null };
    }
    return { user, token };
  } catch {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return { user: null, token: null };
  }
};

const initialAuth = loadStoredAuth();

export const useAuthStore = create((set) => ({
  user: initialAuth.user,
  token: initialAuth.token,
  isAuthenticated: Boolean(initialAuth.token && initialAuth.user),
  loading: false,
  error: null,

  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true, error: null });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
}));
