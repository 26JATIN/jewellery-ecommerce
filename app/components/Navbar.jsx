"use client";
import React, { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavbar } from '../context/NavbarContext';
import { useTheme } from '../context/ThemeContext';
import Cart from './Cart';
import Login from './Login';
import Register from './Register';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from "../../lib/utils";

export default function Navbar() {
    const { setIsCartOpen, cartItems } = useCart();
    const { user, logout, showLoginModal, closeLoginModal, triggerLoginModal, showRegisterModal, closeRegisterModal, triggerRegisterModal } = useAuth();
    const { isNavbarHidden } = useNavbar();
    const { isDark } = useTheme();
    const router = useRouter();
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
            {/* Desktop Navbar - Enhanced Apple Liquid Glass Effect */}
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
                            ? "var(--navbar-bg-scroll)" 
                            : "var(--navbar-bg)",
                        borderBottomColor: visible 
                            ? "var(--navbar-border-scroll)" 
                            : "var(--navbar-border)",
                        boxShadow: visible
                            ? "var(--navbar-shadow-scroll)"
                            : "var(--navbar-shadow)"
                    }}
                    transition={{
                        duration: 0.5,
                        ease: [0.25, 0.1, 0.25, 1]
                    }}
                    className="backdrop-blur-[24px] backdrop-saturate-[200%] border-b"
                    style={{
                        WebkitBackdropFilter: "blur(24px) saturate(200%)",
                        backdropFilter: "blur(24px) saturate(200%)"
                    }}
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
                                    className="flex items-center"
                                >
                                    {/* Fixed-height container to keep header size but visually enlarge logo by scaling image */}
                                        <span className="relative h-12 w-[180px] overflow-hidden block">
                                        <Image
                                            src="/logo/desktop.png"
                                            alt="Nandika Jewellers"
                                            fill
                                            className="absolute inset-0 object-cover transform scale-110"
                                            priority
                                        />
                                    </span>
                                </Link>
                            </motion.div>

                            {/* Center Search Bar */}
                            <div className="flex-1 max-w-xl mx-12 flex items-center gap-2">
                                <div className="flex-1">
                                    <SearchBar />
                                </div>
                                <ThemeToggle />
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
                                        className="px-4 py-2 text-sm font-medium text-[var(--nav-text)] hover:bg-[var(--nav-hover-bg)] rounded-xl transition-all duration-300"
                                    >
                                        Shop
                                    </Link>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    <Link 
                                        href="/blogs"
                                        className="px-4 py-2 text-sm font-medium text-[var(--nav-text)] hover:bg-[var(--nav-hover-bg)] rounded-xl transition-all duration-300"
                                    >
                                        Blog
                                    </Link>
                                </motion.div>

                                {/* User Profile or Login */}
                                {user ? (
                                    <div className="relative profile-menu">
                                        <motion.button 
                                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                                            className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white flex items-center justify-center text-sm font-semibold shadow-lg hover:shadow-xl transition-all ring-2 ring-white/30 hover:ring-white/50"
                                            whileHover={{ scale: 1.08, y: -1 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {getInitials()}
                                        </motion.button>
                                        
                                        <AnimatePresence>
                                            {isProfileOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.92, y: -10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.92, y: -10 }}
                                                    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                                                    className="absolute right-0 top-full mt-7 w-64 backdrop-blur-[40px] backdrop-saturate-[200%] rounded-2xl shadow-2xl border border-[var(--navbar-border-scroll)] py-2 overflow-hidden"
                                                    style={{
                                                        backgroundColor: "var(--dropdown-bg)",
                                                        WebkitBackdropFilter: "blur(40px) saturate(200%)",
                                                        backdropFilter: "blur(40px) saturate(200%)",
                                                        boxShadow: "var(--dropdown-shadow)"
                                                    }}
                                                >
                                                    <div className="px-4 py-3 bg-[var(--nav-hover-bg)] border-b border-[var(--navbar-border)]">
                                                        <p className="text-sm font-semibold text-[var(--nav-text)] truncate">{user.name}</p>
                                                        <p className="text-xs text-[var(--nav-text-muted)] truncate mt-0.5">{user.email}</p>
                                                    </div>
                                                    
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => {
                                                                setIsProfileOpen(false);
                                                                router.push('/orders');
                                                            }}
                                                            className="flex items-center w-full px-4 py-2.5 text-sm text-[var(--nav-text)] hover:bg-[var(--nav-hover-bg)] active:bg-[var(--nav-hover-bg)] transition-all duration-200"
                                                        >
                                                            <svg className="mr-3 h-4 w-4 text-[var(--nav-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                            </svg>
                                                            My Orders
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                setIsProfileOpen(false);
                                                                router.push('/returns');
                                                            }}
                                                            className="flex items-center w-full px-4 py-2.5 text-sm text-[var(--nav-text)] hover:bg-[var(--nav-hover-bg)] active:bg-[var(--nav-hover-bg)] transition-all duration-200"
                                                        >
                                                            <svg className="mr-3 h-4 w-4 text-[var(--nav-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                                                            </svg>
                                                            My Returns
                                                        </button>

                                                        {user.isAdmin && (
                                                            <button
                                                                onClick={() => {
                                                                    setIsProfileOpen(false);
                                                                    router.push('/admin');
                                                                }}
                                                                className="flex items-center w-full px-4 py-2.5 text-sm text-[var(--nav-text)] hover:bg-[var(--nav-hover-bg)] active:bg-[var(--nav-hover-bg)] transition-all duration-200"
                                                            >
                                                                <svg className="mr-3 h-4 w-4 text-[var(--nav-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                Admin Dashboard
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="border-t border-[var(--navbar-border)] mt-1">
                                                        <button
                                                            onClick={handleLogout}
                                                            disabled={isLoggingOut}
                                                            className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/90 active:bg-red-50 transition-all duration-200 disabled:opacity-50"
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
                                        onClick={() => triggerRegisterModal()}
                                        className="px-5 py-2 text-sm font-medium text-[var(--nav-text)] bg-[var(--nav-hover-bg)] hover:opacity-80 rounded-xl transition-all duration-300 hover:shadow-sm"
                                        whileHover={{ scale: 1.03, y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Sign Up
                                    </motion.button>
                                )}

                                {/* Cart Button */}
                                <motion.button 
                                    onClick={() => {
                                        if (user) {
                                            setIsCartOpen(true);
                                        } else {
                                            triggerRegisterModal();
                                        }
                                    }}
                                    className="relative p-2.5 rounded-xl bg-[var(--nav-hover-bg)] hover:opacity-80 transition-all duration-300 hover:shadow-sm"
                                    whileHover={{ scale: 1.08, y: -1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <svg className="h-5 w-5 text-[var(--nav-icon-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <AnimatePresence>
                                        {cartItems.length > 0 && (
                                            <motion.span 
                                                className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow-lg ring-2 ring-white/40"
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

            {/* Mobile Top Search Bar - Enhanced Apple Liquid Glass Effect */}
            <motion.div 
                className="lg:hidden fixed top-0 left-0 right-0 z-[100] backdrop-blur-[24px] backdrop-saturate-[200%] border-b border-[var(--navbar-border)]"
                style={{
                    backgroundColor: "var(--navbar-bg)",
                    WebkitBackdropFilter: "blur(24px) saturate(200%)",
                    backdropFilter: "blur(24px) saturate(200%)",
                    boxShadow: "var(--navbar-shadow)"
                }}
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
                <div className="px-4 py-3 flex items-center gap-3">
                    {/* Mobile Logo */}
                    <Link href="/" className="flex-shrink-0">
                        {/* keep container same height but scale image up */}
                            <span className="relative h-10 w-10 overflow-hidden block rounded">
                            <Image
                                src="/logo/mobile.png"
                                alt="Nandika Jewellers"
                                fill
                                className="absolute inset-0 object-cover transform scale-140"
                                priority
                            />
                        </span>
                    </Link>
                    {/* Search Bar */}
                    <div className="flex-1">
                        <SearchBar placeholder="Search jewelry, collections..." />
                    </div>
                    {/* Theme Toggle */}
                    <ThemeToggle />
                </div>
            </motion.div>

            {/* Mobile Bottom Navigation - Enhanced Apple Liquid Glass Effect */}
            <motion.div 
                className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] backdrop-blur-[24px] backdrop-saturate-[200%] border-t border-[var(--navbar-border)]"
                style={{
                    backgroundColor: "var(--navbar-bg)",
                    WebkitBackdropFilter: "blur(24px) saturate(200%)",
                    backdropFilter: "blur(24px) saturate(200%)",
                    boxShadow: "var(--navbar-shadow)",
                    paddingBottom: "env(safe-area-inset-bottom, 0px)"
                }}
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
                <div className="flex items-center justify-around py-2.5">
                    {/* Home */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}>
                        <Link href="/" className="flex flex-col items-center p-2 space-y-1.5">
                            <motion.div
                                className="p-2.5 rounded-2xl bg-[var(--nav-hover-bg)]"
                                whileHover={{ backgroundColor: "rgba(212, 175, 118, 0.15)", scale: 1.08 }}
                                transition={{ duration: 0.3 }}
                            >
                                <svg className="w-5 h-5 text-[var(--nav-icon-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0h1a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </motion.div>
                            <span className="text-xs text-[var(--nav-text-muted)] font-medium">Home</span>
                        </Link>
                    </motion.div>

                    {/* Browse */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}>
                        <Link href="/products" className="flex flex-col items-center p-2 space-y-1.5">
                            <motion.div
                                className="p-2.5 rounded-2xl bg-[var(--nav-hover-bg)]"
                                whileHover={{ backgroundColor: "rgba(212, 175, 118, 0.15)", scale: 1.08 }}
                                transition={{ duration: 0.3 }}
                            >
                                <svg className="w-5 h-5 text-[var(--nav-icon-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </motion.div>
                            <span className="text-xs text-[var(--nav-text-muted)] font-medium">Browse</span>
                        </Link>
                    </motion.div>

                    {/* Blog */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}>
                        <Link href="/blogs" className="flex flex-col items-center p-2 space-y-1.5">
                            <motion.div
                                className="p-2.5 rounded-2xl bg-[var(--nav-hover-bg)]"
                                whileHover={{ backgroundColor: "rgba(212, 175, 118, 0.15)", scale: 1.08 }}
                                transition={{ duration: 0.3 }}
                            >
                                <svg className="w-5 h-5 text-[var(--nav-icon-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </motion.div>
                            <span className="text-xs text-[var(--nav-text-muted)] font-medium">Blog</span>
                        </Link>
                    </motion.div>

                    {/* Cart */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}>
                        <button 
                            onClick={() => {
                                if (user) {
                                    setIsCartOpen(true);
                                } else {
                                    triggerRegisterModal();
                                }
                            }}
                            className="flex flex-col items-center p-2 space-y-1.5 relative"
                        >
                            <motion.div
                                className="p-2.5 rounded-2xl bg-[var(--nav-hover-bg)] relative"
                                whileHover={{ backgroundColor: "rgba(212, 175, 118, 0.15)", scale: 1.08 }}
                                transition={{ duration: 0.3 }}
                            >
                                <svg className="w-5 h-5 text-[var(--nav-icon-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <AnimatePresence>
                                    {cartItems.length > 0 && (
                                        <motion.span 
                                            className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow-lg ring-2 ring-white/50"
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
                            <span className="text-xs text-[var(--nav-text-muted)] font-medium">Cart</span>
                        </button>
                    </motion.div>

                    {/* Profile/Account */}
                    <motion.div whileHover={{ scale: 1.05 }} className="relative mobile-profile-menu">
                        {user ? (
                            <>
                                <button 
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="flex flex-col items-center p-2 space-y-1.5"
                                >
                                    <motion.div
                                        className="w-9 h-9 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white flex items-center justify-center text-xs font-semibold shadow-lg ring-2 ring-white/30"
                                        whileHover={{ scale: 1.08, rotate: 3 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {getInitials()}
                                    </motion.div>
                                    <span className="text-xs text-[var(--nav-text-muted)] font-medium">Profile</span>
                                </button>
                                
                                <AnimatePresence>
                                    {isMobileMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.92, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.92, y: 10 }}
                                            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                                            className="absolute bottom-full right-0 mb-4 w-52 backdrop-blur-[40px] backdrop-saturate-[200%] rounded-2xl shadow-2xl border border-[var(--navbar-border-scroll)] py-2 z-[110]"
                                            style={{
                                                backgroundColor: "var(--dropdown-bg)",
                                                WebkitBackdropFilter: "blur(40px) saturate(200%)",
                                                backdropFilter: "blur(40px) saturate(200%)",
                                                boxShadow: "var(--dropdown-shadow)"
                                            }}
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setIsMobileMenuOpen(false);
                                                    router.push('/orders');
                                                }}
                                                className="flex items-center w-full px-4 py-3 text-left text-[var(--nav-text)] hover:bg-[var(--nav-hover-bg)] active:bg-[var(--nav-hover-bg)] transition-colors"
                                            >
                                                <svg className="mr-3 h-4 w-4 text-[var(--nav-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                                My Orders
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setIsMobileMenuOpen(false);
                                                    router.push('/returns');
                                                }}
                                                className="flex items-center w-full px-4 py-3 text-left text-[var(--nav-text)] hover:bg-[var(--nav-hover-bg)] active:bg-[var(--nav-hover-bg)] transition-colors"
                                            >
                                                <svg className="mr-3 h-4 w-4 text-[var(--nav-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                                                </svg>
                                                My Returns
                                            </button>
                                            {user.isAdmin && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setIsMobileMenuOpen(false);
                                                        router.push('/admin');
                                                    }}
                                                    className="flex items-center w-full px-4 py-3 text-left text-[var(--nav-text)] hover:bg-[var(--nav-hover-bg)] active:bg-[var(--nav-hover-bg)] transition-colors"
                                                >
                                                    <svg className="mr-3 h-4 w-4 text-[var(--nav-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Admin
                                                </button>
                                            )}
                                            <div className="border-t border-[var(--navbar-border)] mt-2 pt-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setIsMobileMenuOpen(false);
                                                        handleLogout();
                                                    }}
                                                    className="flex items-center w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
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
                                onClick={() => triggerRegisterModal()}
                                className="flex flex-col items-center p-2 space-y-1"
                            >
                                <motion.div
                                    className="p-2 rounded-xl bg-[var(--nav-hover-bg)]"
                                    whileHover={{ backgroundColor: "#D4AF76", scale: 1.1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <svg className="w-5 h-5 text-[var(--nav-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </motion.div>
                                <span className="text-xs text-[var(--nav-text-muted)] font-medium">Sign Up</span>
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
                    onRegisterClick={() => triggerRegisterModal()}
                />
            </Suspense>
            <Register 
                isOpen={showRegisterModal} 
                onClose={() => closeRegisterModal()}
                onLoginClick={() => triggerLoginModal()}
            />
            <Cart />
        </>
    );
}