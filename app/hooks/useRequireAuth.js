'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

/**
 * Hook that requires authentication to access a page.
 * If not authenticated, redirects to home with login modal.
 * 
 * @param {Object} options
 * @param {string} options.redirectTo - Where to redirect after login (defaults to current page)
 * @param {string} options.message - Message to show in the login modal
 * @returns {{ isAuthed: boolean, isChecking: boolean, user: object|null }}
 */
export function useRequireAuth(options = {}) {
    const { user, loading, triggerLoginModal } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Wait for auth to finish loading
        if (loading) return;

        if (!user) {
            // Not authenticated — redirect to home with login prompt
            const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
            const redirectPath = options.redirectTo || currentPath;
            const message = options.message || 'Please sign in to continue';

            // Build redirect URL
            const homeUrl = new URL('/', window.location.origin);
            homeUrl.searchParams.set('login', 'required');
            homeUrl.searchParams.set('redirect', redirectPath);
            homeUrl.searchParams.set('message', message);

            router.replace(homeUrl.pathname + homeUrl.search);
            return;
        }

        // User is authenticated
        setIsChecking(false);
    }, [user, loading, router, options.redirectTo, options.message]);

    return {
        isAuthed: !!user && !loading,
        isChecking: loading || isChecking,
        user,
    };
}
