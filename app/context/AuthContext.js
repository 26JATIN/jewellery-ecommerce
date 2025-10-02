"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Create the context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/check');
                const data = await response.json();
                
                if (data.authenticated && data.user) {
                    // Make sure we're setting the complete user object
                    setUser({
                        id: data.user.id,
                        name: data.user.name,
                        email: data.user.email,
                        isAdmin: data.user.isAdmin
                    });
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        
        checkAuth();
    }, []);

    const login = async (credentials) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setUser(data.user);

            if (data.user.isAdmin) {
                router.push('/admin');
            } else {
                router.push('/');
            }

            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            const res = await fetch('/api/auth/logout', {
                method: 'POST',
            });

            if (!res.ok) {
                throw new Error('Logout failed');
            }

            setUser(null);
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <AuthContext.Provider value={{
                user: null,
                loading: true,
                login: async () => {},
                logout: async () => {},
            }}>
                {children}
            </AuthContext.Provider>
        );
    }

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
}