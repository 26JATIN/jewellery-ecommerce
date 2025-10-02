"use client";
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, loading } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Admin access protection
    useEffect(() => {
        if (!loading && mounted) {
            if (!user) {
                const currentPath = window.location.pathname;
                router.push(`/?login=required&redirect=${encodeURIComponent(currentPath)}`);
                return;
            }

            if (!user.isAdmin) {
                router.push('/');
                return;
            }
        }
    }, [user, loading, mounted, router]);

    // Show loading while checking authentication
    if (loading || !mounted || !user || !user.isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6B4C] mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying admin access...</p>
                </div>
            </div>
        );
    }

    const navItems = [
        { 
            path: '/admin', 
            label: 'Dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
            )
        },
        { 
            path: '/admin/products', 
            label: 'Products',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            )
        },
        { 
            path: '/admin/orders', 
            label: 'Orders',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            )
        },
        { 
            path: '/admin/users', 
            label: 'Users',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
            )
        }
    ];

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6B4C]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Admin Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-[#8B6B4C] rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">A</span>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                                    <p className="text-sm text-gray-500">Jewelry Store Management</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {/* Quick Stats */}
                            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
                                <span>Welcome back, {user?.name}</span>
                            </div>
                            
                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                                >
                                    <div className="w-8 h-8 bg-[#8B6B4C] rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">
                                            {user?.name?.charAt(0)?.toUpperCase()}
                                        </span>
                                    </div>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                            <p className="text-sm text-gray-500">{user?.email}</p>
                                        </div>
                                        <Link
                                            href="/"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            View Store
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex pt-20"> {/* Add top padding for fixed header */}
                {/* Sidebar */}
                <aside className="w-64 bg-white shadow-sm border-r border-gray-200 fixed left-0 top-20 bottom-0 overflow-y-auto">
                    <nav className="p-4">
                        <ul className="space-y-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.path;
                                return (
                                    <li key={item.path}>
                                        <Link
                                            href={item.path}
                                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                                isActive
                                                    ? 'bg-[#8B6B4C] text-white shadow-sm'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                        >
                                            <span className={`${isActive ? 'text-white' : 'text-gray-400'}`}>
                                                {item.icon}
                                            </span>
                                            <span className="font-medium">{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
                        <div className="text-center">
                            <p className="text-xs text-gray-500">Jewelry Store Admin</p>
                            <p className="text-xs text-gray-400">v1.0.0</p>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 ml-64 p-8 min-h-screen bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}