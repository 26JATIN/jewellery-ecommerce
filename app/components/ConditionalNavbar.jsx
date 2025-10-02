"use client";
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return null;
    }
    
    // Don't show the main navbar on admin pages
    const isAdminPage = pathname?.startsWith('/admin');
    
    if (isAdminPage) {
        return null;
    }
    
    return <Navbar />;
}