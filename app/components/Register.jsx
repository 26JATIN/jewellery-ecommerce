"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Register({ isOpen, onClose, onLoginClick }) {
    // Add prop validation
    if (typeof onLoginClick !== 'function') {
        console.warn('onLoginClick prop is required and should be a function');
        onLoginClick = () => {}; // Provide default empty function
    }

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
            }, 2000);

        } catch (err) {
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
                                            <h2 className="text-3xl font-light text-[#2C2C2C] tracking-tight">Create Account</h2>
                                            <p className="text-sm text-gray-500 font-light mt-1">Join our exclusive collection</p>
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

                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-green-600 font-light text-lg">Registration successful!</p>
                                    <p className="text-gray-500 text-sm mt-2 font-light">Redirecting...</p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm font-light">
                                            {error}
                                        </div>
                                    )}
                                    
                                    <div>
                                        <label className="block text-[#2C2C2C] text-sm font-light mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            className="w-full px-6 py-3.5 bg-[#FAFAFA] border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#D4AF76] focus:border-[#D4AF76] focus:bg-white outline-none transition-all font-light placeholder-gray-400"
                                        />
                                    </div>

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
                                            className="w-full px-6 py-3.5 bg-[#FAFAFA] border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#D4AF76] focus:border-[#D4AF76] focus:bg-white outline-none transition-all font-light placeholder-gray-400"
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
                                            className="w-full px-6 py-3.5 bg-[#FAFAFA] border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#D4AF76] focus:border-[#D4AF76] focus:bg-white outline-none transition-all font-light placeholder-gray-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[#2C2C2C] text-sm font-light mb-2">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full px-6 py-3.5 bg-[#FAFAFA] border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#D4AF76] focus:border-[#D4AF76] focus:bg-white outline-none transition-all font-light placeholder-gray-400"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-[#2C2C2C] to-[#3a3a3a] text-white py-4 rounded-full hover:from-[#D4AF76] hover:to-[#C19A5B] transition-all duration-300 disabled:opacity-50 font-light tracking-wide shadow-lg hover:shadow-xl mt-6"
                                    >
                                        {loading ? 'Creating Account...' : 'Create Account'}
                                    </button>

                                    <div className="text-center mt-6">
                                        <p className="text-gray-600 font-light">
                                            Already have an account?{' '}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onClose();
                                                    onLoginClick();
                                                }}
                                                className="text-[#D4AF76] hover:text-[#2C2C2C] transition-colors font-normal"
                                            >
                                                Sign in
                                            </button>
                                        </p>
                                    </div>
                                </form>
                            )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}