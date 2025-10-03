"use client";
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Login({ isOpen, onClose, onRegisterClick }) {
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectHandlerRef = useRef(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Check if there's a redirect URL from admin access attempt
            const redirectPath = searchParams?.get('redirect');
            console.log('Login - redirectPath:', redirectPath);
            
            // Pass redirect path to login to prevent automatic redirect
            const userData = await login(formData, redirectPath);
            console.log('Login - userData:', userData);
            console.log('Login - isAdmin:', userData.user.isAdmin);
            
            onClose();
            
            if (userData.user.isAdmin && redirectPath && redirectPath.startsWith('/admin')) {
                // Admin user trying to access admin area, redirect to original admin page
                console.log('Login - Redirecting to admin page:', redirectPath);
                router.push(redirectPath);
            } else if (userData.user.isAdmin) {
                // Admin user, redirect to admin dashboard
                console.log('Login - Redirecting to admin dashboard');
                router.push('/admin');
            } else if (redirectPath && redirectPath.startsWith('/admin')) {
                // Non-admin user tried to access admin, stay on home page
                console.log('Login - Non-admin user, redirecting to home');
                router.push('/');
            } else {
                // Regular user, redirect to home
                console.log('Login - Regular user, redirecting to home');
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
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[110]"
                    />
                    <div className="fixed inset-0 z-[111] overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] }}
                                className="w-full max-w-md"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-8 md:p-10 relative border border-gray-100">
                                    {/* Premium accent line */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#D4AF76] to-transparent rounded-full" />
                                    
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h2 className="text-3xl font-light text-[#2C2C2C] tracking-tight">Welcome Back</h2>
                                            <p className="text-sm text-gray-500 font-light mt-1">Sign in to your account</p>
                                        </div>
                                        <button 
                                            onClick={onClose}
                                            className="text-gray-400 hover:text-[#2C2C2C] transition-colors p-2 rounded-full hover:bg-gray-100"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm font-light">
                                        {error}
                                    </div>
                                )}
                                
                                <div>
                                    <label className="block text-[#2C2C2C] text-sm font-light mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        className="w-full px-6 py-4 bg-[#FAFAFA] border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#D4AF76] focus:border-[#D4AF76] focus:bg-white outline-none transition-all font-light placeholder-gray-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[#2C2C2C] text-sm font-light mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full px-6 py-4 bg-[#FAFAFA] border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#D4AF76] focus:border-[#D4AF76] focus:bg-white outline-none transition-all font-light placeholder-gray-400"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-[#2C2C2C] to-[#3a3a3a] text-white py-4 rounded-full hover:from-[#D4AF76] hover:to-[#C19A5B] transition-all duration-300 disabled:opacity-50 font-light tracking-wide shadow-lg hover:shadow-xl"
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </button>

                                <div className="text-center mt-6">
                                    <p className="text-gray-600 font-light">
                                        Don't have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onClose();
                                                onRegisterClick();
                                            }}
                                            className="text-[#D4AF76] hover:text-[#2C2C2C] transition-colors font-normal"
                                        >
                                            Sign up
                                        </button>
                                    </p>
                                </div>
                            </form>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}