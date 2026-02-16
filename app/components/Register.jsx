"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Register({ isOpen, onClose, onLoginClick }) {
    // Add prop validation
    if (typeof onLoginClick !== 'function') {
        console.warn('onLoginClick prop is required and should be a function');
        onLoginClick = () => {};
    }

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            return () => {
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.left = '';
                document.body.style.right = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen]);

    // Handle browser back button to close modal
    useEffect(() => {
        if (isOpen) {
            window.history.pushState({ registerOpen: true }, '');

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

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Something went wrong');

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

    const inputClass = "w-full px-5 py-3.5 bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#D4AF76]/50 focus:border-[#D4AF76] focus:bg-white dark:focus:bg-white/[0.1] outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";
    const mobileInputClass = inputClass + " py-4 text-base";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";

    const successContent = (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10"
        >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <p className="text-green-600 dark:text-green-400 font-medium text-lg">Registration successful!</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Redirecting...</p>
        </motion.div>
    );

    const formContent = (isMobile = false) => (
        <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className={labelClass}>Full Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange}
                    placeholder="John Doe" className={isMobile ? mobileInputClass : inputClass} />
            </div>

            <div>
                <label className={labelClass}>Phone Number</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange}
                    placeholder="10-digit mobile number" pattern="[0-9]{10}" maxLength="10"
                    className={isMobile ? mobileInputClass : inputClass} />
            </div>

            <div>
                <label className={labelClass}>Email (Optional)</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="you@example.com" className={isMobile ? mobileInputClass : inputClass} />
            </div>

            <div>
                <label className={labelClass}>Password</label>
                <input type="password" name="password" required value={formData.password} onChange={handleChange}
                    placeholder="••••••••" className={isMobile ? mobileInputClass : inputClass} />
            </div>

            <div>
                <label className={labelClass}>Confirm Password</label>
                <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}
                    placeholder="••••••••" className={isMobile ? mobileInputClass : inputClass} />
            </div>

            <motion.button
                whileHover={!isMobile ? { scale: 1.01 } : undefined}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#2C2C2C] to-[#1A1A1A] dark:from-[#D4AF76] dark:to-[#C19A5B] text-white py-3.5 md:py-3.5 rounded-xl font-medium tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 mt-2"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Creating Account...
                    </span>
                ) : 'Create Account'}
            </motion.button>

            <div className="text-center pt-2">
                <button type="button"
                    onClick={() => { onClose(); onLoginClick(); }}
                    className="text-sm text-[#D4AF76] hover:text-[#8B6B4C] dark:hover:text-[#E8C891] transition-colors font-medium"
                >
                    Already have an account? <span className="underline underline-offset-2">Sign in</span>
                </button>
            </div>
        </form>
    );

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
                            <div className="bg-white dark:bg-[#0A0A0A] rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.25)] p-8 md:p-10 relative border border-gray-100 dark:border-white/[0.06] overflow-hidden max-h-[90vh] overflow-y-auto">
                                {/* Decorative top gradient */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF76] via-[#E8C891] to-[#D4AF76]" />

                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-semibold text-[#2C2C2C] dark:text-gray-100 tracking-tight">Create Account</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">Join our exclusive collection</p>
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

                                {success ? successContent : formContent(false)}
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
                        >
                            {/* Decorative top gradient + drag handle */}
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D4AF76] via-[#E8C891] to-[#D4AF76]" />
                            <div className="flex justify-center pt-3 pb-1">
                                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                            </div>

                            <div className="px-6 pb-6 pt-2 overflow-y-auto flex-1">
                                <div className="flex justify-between items-start mb-5">
                                    <div>
                                        <h2 className="text-2xl font-semibold text-[#2C2C2C] dark:text-gray-100 tracking-tight">Create Account</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Join our exclusive collection</p>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={onClose}
                                        className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </motion.button>
                                </div>

                                {success ? successContent : formContent(true)}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}