"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Cart from './Cart';
import Login from './Login';
import Register from './Register';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { setIsCartOpen, cartItems } = useCart();
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logout();
            // Optional: Add a toast notification here
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    // Add click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isProfileOpen && !event.target.closest('.profile-menu')) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProfileOpen]);

    const scrollToNewArrivals = (e) => {
        e.preventDefault();
        const section = document.getElementById('new-arrivals');
        if (section) {
            const navbarHeight = 80; // Height of your navbar
            const targetPosition = section.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    };

    // Debug user data
    useEffect(() => {
        console.log('Current user:', user);
    }, [user]);

    const getInitials = () => {
        if (user?.name) {
            return user.name[0].toUpperCase();
        }
        if (user?.email) {
            return user.email[0].toUpperCase();
        }
        return 'U';
    };

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-2xl font-semibold text-[#8B6B4C]">
                            JEWELRY
                        </Link>
                    </div>
                    
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className="text-gray-700 hover:text-[#8B6B4C] transition-colors">
                            Home
                        </Link>
                        <Link href="/collections" className="text-gray-700 hover:text-[#8B6B4C] transition-colors">
                            Collections
                        </Link>
                        <a 
                            href="#new-arrivals" 
                            onClick={scrollToNewArrivals}
                            className="text-gray-700 hover:text-[#8B6B4C] transition-colors cursor-pointer"
                        >
                            New Arrivals
                        </a>
                        <Link href="/about" className="text-gray-700 hover:text-[#8B6B4C] transition-colors">
                            About
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="relative profile-menu">
                                <button 
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="w-10 h-10 rounded-full bg-[#8B6B4C] text-white flex items-center justify-center hover:bg-[#725939] transition-colors duration-200 relative z-50"
                            >
                                {getInitials()}
                            </button>
                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border border-gray-100"
                                    >
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        
                                        <div className="py-1">
                                            <button
                                                onClick={() => {/* Add profile handler */}}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Profile
                                            </button>
                                            
                                            <button
                                                onClick={() => router.push('/orders')}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                                My Orders
                                            </button>
                                        </div>

                                        <div className="border-t border-gray-100">
                                            <button
                                                onClick={handleLogout}
                                                disabled={isLoggingOut}
                                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                            >
                                                <svg className="mr-3 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        ) : (
                            <button
                                onClick={() => setIsLoginOpen(true)}
                                className="text-gray-700 hover:text-[#8B6B4C]"
                            >
                                Login
                            </button>
                        )}
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="text-gray-700 hover:text-[#8B6B4C] relative"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {cartItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-[#8B6B4C] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {cartItems.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <Login 
                isOpen={isLoginOpen} 
                onClose={() => setIsLoginOpen(false)}
                onRegisterClick={() => setIsRegisterOpen(true)}
            />
            <Register 
                isOpen={isRegisterOpen} 
                onClose={() => setIsRegisterOpen(false)}
                onLoginClick={() => setIsLoginOpen(true)}
            />
            <Cart />
        </nav>
    );
}