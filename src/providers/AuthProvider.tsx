import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      console.log('AuthProvider: Setting up auth state listener')
      const ensureUserProfile = async (u: User) => {
        if (!u.email) return
        const userRef = doc(db, 'users', u.uid)
        const snap = await getDoc(userRef)
        if (!snap.exists()) {
          try {
            await setDoc(userRef, {
              email: u.email,
              emailLower: u.email.toLowerCase(),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            })
            console.log('AuthProvider: Created user profile doc')
          } catch (e) {
            console.warn('AuthProvider: Failed to create user profile doc', e)
          }
        }
      }

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('AuthProvider: Auth state changed', { user: !!user, uid: user?.uid, email: user?.email })
        setUser(user);
        setLoading(false);
        if (user) {
          // Fire and forget; no need to block auth flow
          ensureUserProfile(user)
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Auth state change error:', error);
      setLoading(false);
      // Return empty cleanup function on error
      return () => {};
    }
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // User state will be updated automatically via onAuthStateChanged
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
