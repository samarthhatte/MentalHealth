import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'user' | 'counselor';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthResult {
  user: User | null;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<AuthResult>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function parseJsonSafe(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    console.warn('Failed to parse JSON response:', text);
    return { error: text };
  }
}

function normalizeRole(role: string | undefined): UserRole {
  if (role === 'admin') return 'admin';
  if (role === 'counselor' || role === 'console') return 'counselor';
  return 'user';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('mentalHealthUser');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as User;
        setUser({ ...parsed, role: normalizeRole(parsed.role) });
      } catch {
        localStorage.removeItem('mentalHealthUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await parseJsonSafe(response);
      if (!response.ok) {
        return { user: null, error: data?.error || 'Invalid email or password.' };
      }

// For Login
const userData: User = {
  id: String(data.user.id),   // ✅ Access the nested user object
  name: data.user.name,
  email: data.user.email,
  role: normalizeRole(data.user.role),
};

      setUser(userData);
      localStorage.setItem('mentalHealthUser', JSON.stringify(userData));
      return { user: userData };
    } catch (error: any) {
      console.error('Login failed:', error);
      return { user: null, error: error?.message || 'Unable to sign in. Please check your credentials.' };
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole): Promise<AuthResult> => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await parseJsonSafe(response);
      if (!response.ok) {
        return { user: null, error: data?.error || 'Unable to create account.' };
      }

// For Signup
const userData: User = {
  id: String(data.user.id),   // ✅ Access the nested user object
  name: data.user.name,
  email: data.user.email,
  role: normalizeRole(data.user.role),
};

      setUser(userData);
      localStorage.setItem('mentalHealthUser', JSON.stringify(userData));
      return { user: userData };
    } catch (error: any) {
      console.error('Signup failed:', error);
      return { user: null, error: error?.message || 'Unable to create account. Please try again.' };
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('mentalHealthUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user && !isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
