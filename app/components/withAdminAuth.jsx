"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function withAdminAuth(WrappedComponent) {
    return function AdminAuthWrapper(props) {
        const { user, loading } = useAuth();
        const router = useRouter();
        const [isAuthorized, setIsAuthorized] = useState(false);
        const [hasRedirected, setHasRedirected] = useState(false);
        const [authMessage, setAuthMessage] = useState('Verifying admin access...');

        useEffect(() => {
            if (!loading && !hasRedirected) {
                if (!user) {
                    // User not logged in, redirect to home with login modal trigger
                    console.log('withAdminAuth: User not authenticated, redirecting to login');
                    setAuthMessage('Authentication required. Redirecting...');
                    const currentPath = window.location.pathname;
                    setHasRedirected(true);
                    
                    setTimeout(() => {
                        router.push(`/?login=required&redirect=${encodeURIComponent(currentPath)}&message=${encodeURIComponent('Admin access requires authentication')}`);
                    }, 500);
                    return;
                }

                if (!user.isAdmin) {
                    // User is not an admin, redirect to home
                    console.log(`withAdminAuth: User ${user.email} is not admin, redirecting to home`);
                    setAuthMessage('Admin access denied. Redirecting...');
                    setHasRedirected(true);
                    
                    setTimeout(() => {
                        router.push('/?message=' + encodeURIComponent('This area is restricted to administrators'));
                    }, 500);
                    return;
                }

                // User is admin, allow access
                console.log(`withAdminAuth: Admin access granted to ${user.email}`);
                setIsAuthorized(true);
            }
        }, [user, loading, router, hasRedirected]);

        // Show elegant loading while checking authentication
        if (loading || (!isAuthorized && !hasRedirected)) {
            return (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAFAFA] to-white"
                >
                    <div className="text-center">
                        <div className="relative mb-8">
                            <div className="h-16 w-16 bg-gradient-to-br from-[#D4AF76]/20 to-[#D4AF76]/10 rounded-full mx-auto shimmer"></div>
                        </div>
                        <div className="h-6 w-32 bg-gray-200 rounded mx-auto mb-3 shimmer"></div>
                        <div className="h-4 w-48 bg-gray-100 rounded mx-auto shimmer"></div>
                        
                        {/* Security indicator */}
                        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                            <svg className="w-4 h-4 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="font-light">Protected Area</span>
                        </div>
                    </div>
                </motion.div>
            );
        }

        // If redirected, show message
        if (hasRedirected && !isAuthorized) {
            return (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAFAFA] to-white"
                >
                    <div className="text-center">
                        <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-light text-[#2C2C2C] mb-2">Access Denied</h3>
                        <p className="text-gray-600 font-light">{authMessage}</p>
                    </div>
                </motion.div>
            );
        }

        // User is authorized, render the component
        return <WrappedComponent {...props} />;
    };
}