"use client";
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginSearchParamsHandler({ onRedirect }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const getRedirectPath = () => {
        return searchParams?.get('redirect');
    };

    const handleRedirect = (userData) => {
        const redirectPath = getRedirectPath();
        
        if (userData.user.isAdmin && redirectPath && redirectPath.startsWith('/admin')) {
            // Admin user trying to access admin area, redirect to original admin page
            router.push(redirectPath);
        } else if (userData.user.isAdmin && !redirectPath) {
            // Admin user with no redirect, go to admin dashboard
            router.push('/admin');
        } else if (redirectPath && redirectPath.startsWith('/admin') && !userData.user.isAdmin) {
            // Non-admin user tried to access admin, stay on home page
            router.push('/');
        } else if (redirectPath) {
            // User has a valid redirect path (checkout, orders, returns, etc.)
            router.push(redirectPath);
        } else {
            // No redirect path, go home
            router.push('/');
        }
    };

    // Call the parent's redirect handler
    if (onRedirect) {
        onRedirect(handleRedirect);
    }

    return null;
}