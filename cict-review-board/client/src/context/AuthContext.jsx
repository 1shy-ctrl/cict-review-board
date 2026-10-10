import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cict_user'));
    } catch {
      return null;
    }
  });

  const signIn = ({ token, user }) => {
    localStorage.setItem('cict_token', token);
    localStorage.setItem('cict_user', JSON.stringify(user));
    setUser(user);
  };

  const signOut = () => {
    localStorage.removeItem('cict_token');
    localStorage.removeItem('cict_user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
