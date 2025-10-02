"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function withAdminAuth(WrappedComponent) {
    return function AdminAuthWrapper(props) {
        const { user, loading } = useAuth();
        const router = useRouter();
        const [isAuthorized, setIsAuthorized] = useState(false);
        const [hasRedirected, setHasRedirected] = useState(false);

        useEffect(() => {
            if (!loading && !hasRedirected) {
                if (!user) {
                    // User not logged in, redirect to home with login modal trigger
                    const currentPath = window.location.pathname;
                    setHasRedirected(true);
                    router.push(`/?login=required&redirect=${encodeURIComponent(currentPath)}`);
                    return;
                }

                if (!user.isAdmin) {
                    // User is not an admin, redirect to home
                    setHasRedirected(true);
                    router.push('/');
                    return;
                }

                // User is admin, allow access
                setIsAuthorized(true);
            }
        }, [user, loading, router, hasRedirected]);

        // Show loading while checking authentication
        if (loading || (!isAuthorized && !hasRedirected)) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6B4C] mx-auto mb-4"></div>
                        <p className="text-gray-600">Verifying admin access...</p>
                    </div>
                </div>
            );
        }

        // If redirected, don't render anything
        if (hasRedirected && !isAuthorized) {
            return null;
        }

        // User is authorized, render the component
        return <WrappedComponent {...props} />;
    };
}