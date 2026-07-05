import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, hasFirebaseConfig } from '../services/firebase';
import { mockUsers } from '../services/mockData';

export type UserRole = 'citizen' | 'mp' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isStandalone: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  signupWithEmail: (email: string, password: string, displayName: string, role?: UserRole) => Promise<void>;
  switchMockRole: (role: UserRole) => void;
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isStandalone = !hasFirebaseConfig || !auth || !db;

  // Local storage management for standalone mode
  useEffect(() => {
    if (isStandalone) {
      const cached = localStorage.getItem('janvoice_auth_user');
      if (cached) {
        setUser(JSON.parse(cached));
      } else {
        const defaultUser = mockUsers.citizen as UserProfile;
        setUser(defaultUser);
        localStorage.setItem('janvoice_auth_user', JSON.stringify(defaultUser));
      }
      setLoading(false);
    }
  }, [isStandalone]);

  // Firebase auth state listener for connected mode
  useEffect(() => {
    if (isStandalone || !auth || !db) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // Fetch role from Firestore
          const userDocRef = doc(db!, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || data.displayName || 'User',
              role: (data.role as UserRole) || 'citizen'
            });
          } else {
            // New user, create citizen profile by default
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'New Citizen',
              role: 'citizen'
            };
            await setDoc(userDocRef, {
              uid: newProfile.uid,
              email: newProfile.email,
              displayName: newProfile.displayName,
              role: newProfile.role,
              createdAt: new Date().toISOString()
            });
            setUser(newProfile);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error synchronizing authenticated user profile:", error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [isStandalone]);

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isStandalone) {
        const matched = Object.values(mockUsers).find(u => u.email === email);
        if (matched) {
          const profile = matched as UserProfile;
          setUser(profile);
          localStorage.setItem('janvoice_auth_user', JSON.stringify(profile));
        } else {
          const profile: UserProfile = {
            uid: `mock-u-${Math.random().toString(36).substr(2, 9)}`,
            email,
            displayName: email.split('@')[0],
            role: 'citizen'
          };
          setUser(profile);
          localStorage.setItem('janvoice_auth_user', JSON.stringify(profile));
        }
      } else if (auth) {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (email: string, password: string, displayName: string, role: UserRole = 'citizen') => {
    setLoading(true);
    try {
      if (isStandalone) {
        const profile: UserProfile = {
          uid: `mock-u-${Math.random().toString(36).substr(2, 9)}`,
          email,
          displayName,
          role
        };
        setUser(profile);
        localStorage.setItem('janvoice_auth_user', JSON.stringify(profile));
      } else if (auth && db) {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName });
        
        // Save to Firestore
        const userDocRef = doc(db!, 'users', credential.user.uid);
        await setDoc(userDocRef, {
          uid: credential.user.uid,
          email,
          displayName,
          role,
          createdAt: new Date().toISOString()
        });

        setUser({
          uid: credential.user.uid,
          email,
          displayName,
          role
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      if (isStandalone) {
        const profile = mockUsers.mp as UserProfile;
        setUser(profile);
        localStorage.setItem('janvoice_auth_user', JSON.stringify(profile));
      } else if (auth && googleProvider) {
        await signInWithPopup(auth, googleProvider);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isStandalone) {
        setUser(null);
        localStorage.removeItem('janvoice_auth_user');
      } else if (auth) {
        await signOut(auth);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMockRole = (role: UserRole) => {
    if (isStandalone) {
      const mockProfile = mockUsers[role] as UserProfile;
      setUser(mockProfile);
      localStorage.setItem('janvoice_auth_user', JSON.stringify(mockProfile));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isStandalone,
      loginWithEmail,
      loginWithGoogle,
      logout,
      signupWithEmail,
      switchMockRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};
