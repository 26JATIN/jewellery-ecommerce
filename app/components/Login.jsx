"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';

export default function Login({ isOpen, onClose, onRegisterClick }) {
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectHandlerRef = useRef(null);
    const [formData, setFormData] = useState({
        phone: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = '';
            };
        }
    }, [isOpen]);

    // Handle browser back button to close modal
    useEffect(() => {
        if (isOpen) {
            window.history.pushState({ loginOpen: true }, '');

            const handlePopState = () => {
                onClose();
            };

            window.addEventListener('popstate', handlePopState);
            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [isOpen, onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const redirectPath = searchParams?.get('redirect');
            const userData = await login(formData, redirectPath);
            
            onClose();
            
            if (userData.user.isAdmin && redirectPath && redirectPath.startsWith('/admin')) {
                router.push(redirectPath);
            } else if (userData.user.isAdmin && !redirectPath) {
                router.push('/admin');
            } else if (redirectPath && redirectPath.startsWith('/admin') && !userData.user.isAdmin) {
                router.push('/');
            } else if (redirectPath) {
                router.push(redirectPath);
            } else {
                router.push('/');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
                    />

                    {/* Desktop: centered modal */}
                    <div className="hidden md:flex fixed inset-0 z-[111] items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white dark:bg-[#0A0A0A] rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.25)] p-8 md:p-10 relative border border-gray-100 dark:border-white/[0.06] overflow-hidden">                                
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h2 className="text-2xl font-semibold text-[#2C2C2C] dark:text-gray-100 tracking-tight">Welcome Back</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">Sign in to continue shopping</p>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={onClose}
                                        className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </motion.button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-sm"
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="10-digit mobile number"
                                            pattern="[0-9]{10}"
                                            maxLength="10"
                                            className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#D4AF76]/50 focus:border-[#D4AF76] focus:bg-white dark:focus:bg-white/[0.1] outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#D4AF76]/50 focus:border-[#D4AF76] focus:bg-white dark:focus:bg-white/[0.1] outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-[#2C2C2C] to-[#1A1A1A] dark:from-[#D4AF76] dark:to-[#C19A5B] text-white py-3.5 rounded-xl font-medium tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 mt-2"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                                Signing in...
                                            </span>
                                        ) : 'Sign In'}
                                    </motion.button>

                                    <div className="text-center pt-2">
                                        <button
                                            type="button"
                                            onClick={() => { onClose(); onRegisterClick(); }}
                                            className="text-sm text-[#D4AF76] hover:text-[#8B6B4C] dark:hover:text-[#E8C891] transition-colors font-medium"
                                        >
                                            Don't have an account? <span className="underline underline-offset-2">Sign up</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>

                    {/* Mobile: bottom sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="md:hidden fixed inset-x-0 bottom-0 z-[111]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white dark:bg-[#0A0A0A] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] relative overflow-hidden max-h-[92vh] flex flex-col"
                             style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
                        >                            <div className="flex justify-center pt-3 pb-1">
                                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                            </div>

                            <div className="px-6 pb-6 pt-2 overflow-y-auto flex-1">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-semibold text-[#2C2C2C] dark:text-gray-100 tracking-tight">Welcome Back</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to continue shopping</p>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={onClose}
                                        className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </motion.button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-sm"
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="10-digit mobile number"
                                            pattern="[0-9]{10}"
                                            maxLength="10"
                                            className="w-full px-5 py-4 bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#D4AF76]/50 focus:border-[#D4AF76] focus:bg-white dark:focus:bg-white/[0.1] outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-base"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full px-5 py-4 bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#D4AF76]/50 focus:border-[#D4AF76] focus:bg-white dark:focus:bg-white/[0.1] outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-base"
                                        />
                                    </div>

                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-[#2C2C2C] to-[#1A1A1A] dark:from-[#D4AF76] dark:to-[#C19A5B] text-white py-4 rounded-xl font-medium tracking-wide shadow-lg transition-all duration-300 disabled:opacity-50 mt-1"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                                Signing in...
                                            </span>
                                        ) : 'Sign In'}
                                    </motion.button>

                                    <div className="text-center pt-2 pb-2">
                                        <button
                                            type="button"
                                            onClick={() => { onClose(); onRegisterClick(); }}
                                            className="text-sm text-[#D4AF76] hover:text-[#8B6B4C] dark:hover:text-[#E8C891] transition-colors font-medium"
                                        >
                                            Don't have an account? <span className="underline underline-offset-2">Sign up</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}