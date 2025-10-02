"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Login({ isOpen, onClose, onRegisterClick }) {
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md z-50"
                    >
                        <div className="bg-white rounded-lg shadow-xl p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-[#8B6B4C]">Welcome Back</h2>
                                <button 
                                    onClick={onClose}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <p className="text-red-500 text-sm">{error}</p>
                                )}
                                
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#8B6B4C] text-white py-3 rounded-lg hover:bg-[#725939] transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>

                                <div className="text-center mt-4">
                                    <p className="text-gray-600">
                                        Don't have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onClose();
                                                onRegisterClick();
                                            }}
                                            className="text-[#8B6B4C] hover:underline"
                                        >
                                            Sign up
                                        </button>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}