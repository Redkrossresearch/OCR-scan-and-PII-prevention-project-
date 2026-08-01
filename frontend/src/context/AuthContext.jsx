import { createContext, useContext, useState } from 'react';
import { auth, audit } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const loading = false;

  const login = async (email, password) => {
    const result = await auth.login({ email, password });
    const userData = { email };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return result;
  };

  const register = async (username, email, password) => {
    return auth.register({ username, email, password });
  };

  const logout = () => {
    audit.log(user?.email, 'USER_LOGOUT', 'User logged out');
    auth.logout();
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
