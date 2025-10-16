"use client";
import React, { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavbar } from '../context/NavbarContext';
import Cart from './Cart';
import Login from './Login';
import Register from './Register';
import SearchBar from './SearchBar';
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [visible, setVisible] = useState(false);
    
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
            if (isMobileMenuOpen && !event.target.closest('.mobile-profile-menu')) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProfileOpen, isMobileMenuOpen]);

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
        <>
            {/* Desktop Navbar - Fixed Minimal Design */}
            <motion.nav
                ref={ref}
                className="fixed inset-x-0 top-0 z-[100] hidden lg:block"
                animate={{
                    y: isNavbarHidden ? -100 : 0,
                    opacity: isNavbarHidden ? 0 : 1
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                }}
            >
                <motion.div
                    animate={{
                        backgroundColor: visible 
                            ? "rgba(255, 255, 255, 0.98)" 
                            : "rgba(255, 255, 255, 0.90)",
                        borderBottomColor: visible 
                            ? "rgba(0, 0, 0, 0.06)" 
                            : "rgba(0, 0, 0, 0.04)",
                    }}
                    transition={{
                        duration: 0.3,
                        ease: "easeInOut"
                    }}
                    className="backdrop-blur-2xl border-b"
                >
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            {/* Logo */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link 
                                    href="/" 
                                    className="text-2xl font-light tracking-[0.2em] text-gray-900 hover:text-[#D4AF76] transition-colors duration-300"
                                >
                                    LUXE
                                </Link>
                            </motion.div>

                            {/* Center Search Bar */}
                            <div className="flex-1 max-w-xl mx-12">
                                <SearchBar />
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-3">
                                {/* Navigation Links */}
                                <motion.div 
                                    className="flex items-center gap-1 mr-2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <Link 
                                        href="/products"
                                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                                    >
                                        Shop
                                    </Link>
                                </motion.div>

                                {/* User Profile or Login */}
                                {user ? (
                                    <div className="relative profile-menu">
                                        <motion.button 
                                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                                            className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white flex items-center justify-center text-sm font-semibold shadow-sm hover:shadow-md transition-all"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {getInitials()}
                                        </motion.button>
                                        
                                        <AnimatePresence>
                                            {isProfileOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute right-0 mt-2 w-60 bg-white backdrop-blur-xl rounded-xl shadow-2xl border border-gray-100 py-1 overflow-hidden"
                                                >
                                                    <div className="px-4 py-3 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                                        <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                                                    </div>
                                                    
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => {
                                                                setIsProfileOpen(false);
                                                                router.push('/orders');
                                                            }}
                                                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <svg className="mr-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                            </svg>
                                                            My Orders
                                                        </button>
                                                        
                                                        <button
                                                            onClick={() => {
                                                                setIsProfileOpen(false);
                                                                router.push('/returns/track');
                                                            }}
                                                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <svg className="mr-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                            </svg>
                                                            My Returns
                                                        </button>
                                                        
                                                        {user.isAdmin && (
                                                            <button
                                                                onClick={() => {
                                                                    setIsProfileOpen(false);
                                                                    router.push('/admin');
                                                                }}
                                                                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                            >
                                                                <svg className="mr-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                Admin Dashboard
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="border-t border-gray-100">
                                                        <button
                                                            onClick={handleLogout}
                                                            disabled={isLoggingOut}
                                                            className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
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
                                        className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Sign In
                                    </motion.button>
                                )}

                                {/* Cart Button */}
                                <motion.button 
                                    onClick={() => {
                                        if (user) {
                                            setIsCartOpen(true);
                                        } else {
                                            triggerLoginModal();
                                        }
                                    }}
                                    className="relative p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <AnimatePresence>
                                        {cartItems.length > 0 && (
                                            <motion.span 
                                                className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow-md"
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                            >
                                                {cartItems.length}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.nav>

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
                    <SearchBar placeholder="Search jewelry, collections..." />
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
                        <Link href="/products" className="flex flex-col items-center p-2 space-y-1">
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
                            onClick={() => {
                                if (user) {
                                    setIsCartOpen(true);
                                } else {
                                    triggerLoginModal();
                                }
                            }}
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
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="relative mobile-profile-menu">
                        {user ? (
                            <>
                                <button 
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
                                
                                <AnimatePresence>
                                    {isMobileMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50"
                                        >
                                            <button
                                                onClick={() => {
                                                    setIsMobileMenuOpen(false);
                                                    router.push('/orders');
                                                }}
                                                className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50"
                                            >
                                                <svg className="mr-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                                My Orders
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsMobileMenuOpen(false);
                                                    router.push('/returns/track');
                                                }}
                                                className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50"
                                            >
                                                <svg className="mr-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                </svg>
                                                My Returns
                                            </button>
                                            {user.isAdmin && (
                                                <button
                                                    onClick={() => {
                                                        setIsMobileMenuOpen(false);
                                                        router.push('/admin');
                                                    }}
                                                    className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50"
                                                >
                                                    <svg className="mr-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Admin
                                                </button>
                                            )}
                                            <div className="border-t border-gray-100 mt-2 pt-2">
                                                <button
                                                    onClick={() => {
                                                        setIsMobileMenuOpen(false);
                                                        handleLogout();
                                                    }}
                                                    className="flex items-center w-full px-4 py-3 text-left text-red-600 hover:bg-red-50"
                                                >
                                                    <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
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