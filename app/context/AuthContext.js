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
    const [showLoginModal, setShowLoginModal] = useState(false);
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

    const login = async (credentials, redirectPath = null) => {
        try {
            console.log('AuthContext login - credentials:', credentials);
            console.log('AuthContext login - redirectPath:', redirectPath);
            
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await res.json();
            console.log('AuthContext login - response data:', data);
            
            if (!res.ok) throw new Error(data.error);

            setUser(data.user);
            console.log('AuthContext login - user set:', data.user);

            // Only redirect if no specific redirect path is provided by the caller
            if (!redirectPath) {
                console.log('AuthContext login - no redirectPath, checking isAdmin:', data.user.isAdmin);
                if (data.user.isAdmin) {
                    console.log('AuthContext login - redirecting to /admin');
                    router.push('/admin');
                } else {
                    console.log('AuthContext login - redirecting to /');
                    router.push('/');
                }
            } else {
                console.log('AuthContext login - redirectPath provided, not redirecting from here');
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

    const triggerLoginModal = () => {
        setShowLoginModal(true);
    };

    const closeLoginModal = () => {
        setShowLoginModal(false);
    };

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <AuthContext.Provider value={{
                user: null,
                loading: true,
                login: async () => {},
                logout: async () => {},
                showLoginModal: false,
                triggerLoginModal: () => {},
                closeLoginModal: () => {},
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
            showLoginModal,
            triggerLoginModal,
            closeLoginModal,
        }}>
            {children}
        </AuthContext.Provider>
    );
}