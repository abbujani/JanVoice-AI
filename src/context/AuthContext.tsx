import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { hasFirebaseConfig, loadFirebaseAuth } from '../services/firebase';

export interface AuthProfile {
  uid: string;
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: AuthProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const auth = await loadFirebaseAuth();
      if (cancelled) return;
      if (!auth) {
        setUser({ uid: 'guest', email: '', displayName: 'Guest' });
        setLoading(false);
        return;
      }
      const { onAuthStateChanged } = await import('firebase/auth');
      unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        setUser(
          firebaseUser
            ? {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || 'User',
              }
            : null
        );
        setLoading(false);
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const logout = async () => {
    if (!hasFirebaseConfig) return;
    const auth = await loadFirebaseAuth();
    if (!auth) return;
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>;
};