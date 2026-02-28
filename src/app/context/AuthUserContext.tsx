'use client';

// Firebase authentication context for the entire app.
// Wraps all routes via the root layout, exposing auth state and actions through useAuth().
// Google OAuth popup is the only sign-in method — no email/password or other providers.
//
// Usage: call useAuth() from any client component to get { user, isLoading, authError, signIn, logOut }.

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Shape of the value exposed through AuthContext.
// user: Firebase User object when authenticated, null when signed out.
// isLoading: true until Firebase resolves the initial auth state check (prevents false redirects).
// authError: set if onAuthStateChanged fires an error (e.g. network failure).
// signIn: triggers Google OAuth popup and returns the Firebase credential promise.
// logOut: signs out the current user from Firebase.
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  authError: Error | null;
  signIn: () => Promise<unknown>;
  logOut: () => Promise<void>;
}

// Context is initialized as undefined — consuming it outside AuthProvider will throw via useAuth().
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider wraps the entire app in root layout.tsx.
// Manages auth state reactively using Firebase's onAuthStateChanged listener.
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // null = signed out, User object = authenticated.
  const [user, setUser] = useState<User | null>(null);
  // Starts as true — Firebase needs a moment to check the persisted session on mount.
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  useEffect(() => {
    // Subscribe to Firebase auth state changes. Fires immediately on mount with the
    // current user (or null), then again on every sign-in / sign-out event.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Firebase returns null when signed out — normalize to null explicitly.
      setUser(firebaseUser ?? null);
      setIsLoading(false);
    }, (error) => {
      // Auth state error (e.g. token revoked, network issue).
      setAuthError(error);
      setIsLoading(false);
    });

    // Unsubscribe from the listener on unmount to prevent memory leaks.
    return () => unsubscribe();
  }, []);

  // Opens the Google OAuth popup. Returns a promise with the Firebase UserCredential.
  const signIn = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  // Signs out the current user. Firebase clears the persisted session automatically.
  const logOut = () => {
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, authError, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to consume the auth context from any client component.
// Throws a clear error if called outside AuthProvider — avoids silent undefined failures.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
