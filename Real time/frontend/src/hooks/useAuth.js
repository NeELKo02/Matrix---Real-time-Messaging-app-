/**
 * Firebase Authentication Hook - Simple and Clean
 */

import { useState, useEffect } from 'react';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🔥 Setting up Firebase auth listener');
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log('✅ Firebase user signed in:', firebaseUser.displayName);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          getIdToken: () => firebaseUser.getIdToken()
        });
      } else {
        console.log('❌ No Firebase user');
        setUser(null);
      }
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔥 Attempting Firebase Google Sign-In');
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      console.log('✅ Firebase Google Sign-In successful:', firebaseUser.displayName);
      
      const user = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        getIdToken: () => firebaseUser.getIdToken()
      };
      
      const token = await user.getIdToken();
      
      return { user, token };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithDevToken = async (username) => {
    try {
      setLoading(true);
      setError(null);
      
      // For development, create a mock user and dev token
      const mockUser = {
        uid: `dev-user-${username}`,
        email: `${username}@dev.local`,
        displayName: username,
        photoURL: null,
        getIdToken: async () => `dev-token-${username}`
      };
      
      // Simulate Firebase auth
      setUser(mockUser);
      
      const token = await mockUser.getIdToken();
      
      return {
        user: mockUser,
        token: token
      };
    } catch (error) {
      console.error('Dev sign in error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔥 Firebase sign out');
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getIdToken = async () => {
    if (!user) return null;
    
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  };

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithDevToken,
    signOut,
    getIdToken,
    isAuthenticated: !!user
  };
};