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
        } else if (userData.user.isAdmin) {
            // Admin user, redirect to admin dashboard
            router.push('/admin');
        } else if (redirectPath && redirectPath.startsWith('/admin')) {
            // Non-admin user tried to access admin, stay on home page
            router.push('/');
        } else {
            // Regular user, redirect to home
            router.push('/');
        }
    };

    // Call the parent's redirect handler
    if (onRedirect) {
        onRedirect(handleRedirect);
    }

    return null;
}