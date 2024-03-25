// AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
    initializeAuth,
    getReactNativePersistence,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    User,
    getAuth,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Initialize Firebase app
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_apiKey,
    authDomain: process.env.EXPO_PUBLIC_authDomain,
    projectId: process.env.EXPO_PUBLIC_projectId,
    storageBucket: process.env.EXPO_PUBLIC_storageBucket,
    messagingSenderId: process.env.EXPO_PUBLIC_messagingSenderId,
    appId: process.env.EXPO_PUBLIC_appId,
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Define the authentication context
interface AuthContextType {
    user: User | null;
    signIn: (email: string, password: string) => void;
    signOut: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

// Auth provider component
export const AuthProvider = ({ children }: React.PropsWithChildren) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check if user is already authenticated
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    const signInUser = async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            setUser(userCredential.user);
        } catch (error: any) {
            console.error("Error signing in:", error.message);
        }
    };

    const signOutUser = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error: any) {
            console.error("Error signing out:", error.message);
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, signIn: signInUser, signOut: signOutUser }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to access auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
