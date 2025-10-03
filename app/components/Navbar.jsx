"use client";
import React, { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavbar } from '../context/NavbarContext';
import Cart from './Cart';
import Login from './Login';
import Register from './Register';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from "../../lib/utils";

export default function Navbar() {
    const { setIsCartOpen, cartItems } = useCart();
    const { user, logout, showLoginModal, closeLoginModal, triggerLoginModal } = useAuth();
    const { isNavbarHidden } = useNavbar();
    const router = useRouter();
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [visible, setVisible] = useState(false);
    
    // Sync search query with URL when on collections page
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            if (currentPath === '/collections') {
                const urlParams = new URLSearchParams(window.location.search);
                const searchParam = urlParams.get('search');
                if (searchParam) {
                    setSearchQuery(searchParam);
                } else {
                    setSearchQuery('');
                }
            }
        }
    }, []);

    // Listen for URL changes to keep navbar search in sync
    useEffect(() => {
        const handleUrlChange = () => {
            if (typeof window !== 'undefined') {
                const currentPath = window.location.pathname;
                if (currentPath === '/collections') {
                    const urlParams = new URLSearchParams(window.location.search);
                    const searchParam = urlParams.get('search');
                    setSearchQuery(searchParam || '');
                } else {
                    setSearchQuery('');
                }
            }
        };

        window.addEventListener('popstate', handleUrlChange);
        return () => window.removeEventListener('popstate', handleUrlChange);
    }, []);
    
    const ref = useRef(null);
    const { scrollY } = useScroll();

    // Track scroll position for floating effect
    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 100) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    });

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logout();
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

    const getInitials = () => {
        if (user?.name) {
            return user.name[0].toUpperCase();
        }
        if (user?.email) {
            return user.email[0].toUpperCase();
        }
        return 'U';
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Navigate to collections page with search parameter
            router.push(`/collections?search=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            // If search is empty, just go to collections page
            router.push('/collections');
        }
    };

    const scrollToProducts = () => {
        const productsSection = document.getElementById('products-section');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <>
            {/* Desktop Navbar */}
            <motion.div
                ref={ref}
                className="fixed inset-x-0 top-0 z-[100] w-full px-4 pt-6 hidden lg:block"
                animate={{
                    y: isNavbarHidden ? -100 : 0,
                    opacity: isNavbarHidden ? 0 : 1
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    duration: 0.4
                }}
            >
                <motion.div
                    animate={{
                        backdropFilter: visible ? "blur(20px)" : "blur(10px)",
                        backgroundColor: visible ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.85)",
                        boxShadow: visible
                            ? "0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)"
                            : "0 4px 20px rgba(0, 0, 0, 0.08)",
                        width: visible ? "70%" : "100%",
                        y: visible ? 12 : 0,
                        scale: visible ? 0.98 : 1,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        mass: 0.8,
                    }}
                    style={{
                        minWidth: visible ? "900px" : "auto",
                        borderRadius: visible ? "24px" : "32px",
                    }}
                    className={cn(
                        "relative z-[60] mx-auto w-full max-w-7xl flex flex-row items-center justify-between self-start bg-transparent px-8 py-4 backdrop-blur-xl",
                        visible && "shadow-2xl border border-white/20",
                    )}
                >
                    {/* Logo */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <Link href="/" className="flex-shrink-0 text-2xl font-light tracking-widest text-gray-900 hover:text-[#D4AF76] transition-all duration-300">
                            LUXE
                        </Link>
                    </motion.div>

                    {/* Large Search Bar - Center */}
                    <div className="flex-1 max-w-2xl mx-8">
                        <motion.form 
                            onSubmit={handleSearch} 
                            className="relative"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <motion.input
                                type="text"
                                placeholder="Search for jewelry, collections, or anything..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-6 py-4 text-sm bg-white/60 backdrop-blur-lg border border-white/30 rounded-2xl focus:bg-white/90 focus:border-[#D4AF76]/50 focus:ring-4 focus:ring-[#D4AF76]/20 outline-none transition-all duration-300 shadow-sm pr-20 placeholder:text-gray-500"
                                whileFocus={{ scale: 1.01 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            />
                            <AnimatePresence>
                                {searchQuery && (
                                    <motion.button 
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery('');
                                            router.push('/collections');
                                        }}
                                        className="absolute right-14 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200"
                                        title="Clear search"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </motion.button>
                                )}
                            </AnimatePresence>
                            <motion.button 
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-[#2C2C2C] text-white hover:bg-[#D4AF76] transition-all duration-300 shadow-md"
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </motion.button>
                        </motion.form>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-4 flex-shrink-0">
                        {/* User Profile or Login */}
                        {user ? (
                            <div className="relative profile-menu">
                                <motion.button 
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-900 to-gray-700 text-white flex items-center justify-center text-sm font-medium hover:shadow-lg transition-all"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {getInitials()}
                                </motion.button>
                                
                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 py-2"
                                        >
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                            
                                            <div className="py-2">
                                                <button
                                                    onClick={() => {
                                                        setIsProfileOpen(false);
                                                        router.push('/orders');
                                                    }}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                >
                                                    <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                    </svg>
                                                    My Orders
                                                </button>
                                                
                                                {user.isAdmin && (
                                                    <button
                                                        onClick={() => {
                                                            setIsProfileOpen(false);
                                                            router.push('/admin');
                                                        }}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                    >
                                                        <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        Admin Dashboard
                                                    </button>
                                                )}
                                            </div>

                                            <div className="border-t border-gray-100 pt-2">
                                                <button
                                                    onClick={handleLogout}
                                                    disabled={isLoggingOut}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                >
                                                    <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                            <motion.button
                                onClick={() => triggerLoginModal()}
                                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white/60 backdrop-blur-lg border border-white/30 rounded-2xl hover:bg-white/90 hover:border-[#D4AF76]/50 transition-all duration-300 shadow-sm"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                                Sign In
                            </motion.button>
                        )}

                        {/* Cart */}
                        <motion.button 
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-4 rounded-2xl bg-white/60 backdrop-blur-lg border border-white/30 hover:bg-white/90 hover:border-[#D4AF76]/50 transition-all duration-300 shadow-sm"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                            <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <AnimatePresence>
                                {cartItems.length > 0 && (
                                    <motion.span 
                                        className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-medium shadow-lg"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                        whileHover={{ scale: 1.1 }}
                                    >
                                        {cartItems.length}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>

            {/* Mobile Top Search Bar */}
            <motion.div 
                className="lg:hidden fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-xl border-b border-gray-200/50"
                initial={{ y: -100 }}
                animate={{ 
                    y: isNavbarHidden ? -100 : 0,
                    opacity: isNavbarHidden ? 0 : 1
                }}
                transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 25,
                    duration: 0.4 
                }}
            >
                <div className="px-4 py-3">
                    <motion.form 
                        onSubmit={handleSearch} 
                        className="relative"
                        whileTap={{ scale: 0.98 }}
                    >
                        <motion.input
                            type="text"
                            placeholder="Search jewelry, collections..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-20 py-4 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#D4AF76] focus:ring-4 focus:ring-[#D4AF76]/20 outline-none transition-all duration-300"
                            whileFocus={{ scale: 1.01 }}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <AnimatePresence>
                            {searchQuery && (
                                <motion.button 
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        router.push('/collections');
                                    }}
                                    className="absolute right-14 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                                    title="Clear search"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </motion.button>
                            )}
                        </AnimatePresence>
                        <motion.button 
                            type="submit"
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-[#2C2C2C] text-white hover:bg-[#D4AF76] transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </motion.button>
                    </motion.form>
                </div>
            </motion.div>

            {/* Mobile Bottom Navigation */}
            <motion.div 
                className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-xl border-t border-gray-200/50"
                initial={{ y: 100 }}
                animate={{ 
                    y: isNavbarHidden ? 100 : 0,
                    opacity: isNavbarHidden ? 0 : 1
                }}
                transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 25, 
                    duration: 0.4 
                }}
            >
                <div className="flex items-center justify-around py-2">
                    {/* Home */}
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Link href="/" className="flex flex-col items-center p-2 space-y-1">
                            <motion.div
                                className="p-2 rounded-xl bg-gray-50"
                                whileHover={{ backgroundColor: "#D4AF76", scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0h1a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </motion.div>
                            <span className="text-xs text-gray-600 font-medium">Home</span>
                        </Link>
                    </motion.div>

                    {/* Browse */}
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Link href="/collections" className="flex flex-col items-center p-2 space-y-1">
                            <motion.div
                                className="p-2 rounded-xl bg-gray-50"
                                whileHover={{ backgroundColor: "#D4AF76", scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </motion.div>
                            <span className="text-xs text-gray-600 font-medium">Browse</span>
                        </Link>
                    </motion.div>

                    {/* Cart */}
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="flex flex-col items-center p-2 space-y-1 relative"
                        >
                            <motion.div
                                className="p-2 rounded-xl bg-gray-50 relative"
                                whileHover={{ backgroundColor: "#D4AF76", scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <AnimatePresence>
                                    {cartItems.length > 0 && (
                                        <motion.span 
                                            className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium shadow-lg"
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                        >
                                            {cartItems.length}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                            <span className="text-xs text-gray-600 font-medium">Cart</span>
                        </button>
                    </motion.div>

                    {/* Profile/Account */}
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        {user ? (
                            <button 
                                onClick={() => router.push('/orders')}
                                className="flex flex-col items-center p-2 space-y-1"
                            >
                                <motion.div
                                    className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#2C2C2C] to-[#D4AF76] text-white flex items-center justify-center text-xs font-medium shadow-md"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {getInitials()}
                                </motion.div>
                                <span className="text-xs text-gray-600 font-medium">Profile</span>
                            </button>
                        ) : (
                            <button 
                                onClick={() => triggerLoginModal()}
                                className="flex flex-col items-center p-2 space-y-1"
                            >
                                <motion.div
                                    className="p-2 rounded-xl bg-gray-50"
                                    whileHover={{ backgroundColor: "#D4AF76", scale: 1.1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </motion.div>
                                <span className="text-xs text-gray-600 font-medium">Sign In</span>
                            </button>
                        )}
                    </motion.div>
                </div>
            </motion.div>

            {/* Modals and Cart */}
            <Suspense fallback={null}>
                <Login 
                    isOpen={showLoginModal} 
                    onClose={() => closeLoginModal()}
                    onRegisterClick={() => setIsRegisterOpen(true)}
                />
            </Suspense>
            <Register 
                isOpen={isRegisterOpen} 
                onClose={() => setIsRegisterOpen(false)}
                onLoginClick={() => triggerLoginModal()}
            />
            <Cart />
        </>
    );
}