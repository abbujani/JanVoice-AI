import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, hasFirebaseConfig } from '../services/firebase';

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
    if (!hasFirebaseConfig || !auth) {
      setUser({ uid: 'guest', email: '', displayName: 'Guest' });
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
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
    return unsubscribe;
  }, []);

  const logout = async () => {
    if (!hasFirebaseConfig || !auth) return;
    await signOut(auth);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>;
};