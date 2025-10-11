"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddressForm({ onSubmit }) {
    const [formData, setFormData] = useState({
        fullName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        phone: ''
    });

    const [focusedField, setFocusedField] = useState(null);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
        if (!formData.country) newErrors.country = 'Please select a country';
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone must be 10 digits';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const inputVariants = {
        initial: { scale: 1 },
        focus: { scale: 1.01, transition: { duration: 0.2 } },
        error: { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-3 mb-8">
                <motion.div 
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-[#D4AF76] to-[#8B6B4C] flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </motion.div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Shipping Address</h2>
                    <p className="text-sm text-gray-500">Enter your delivery details</p>
                </div>
            </div>
            
            <div className="space-y-6">
                {/* Full Name */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <motion.div
                        variants={inputVariants}
                        animate={focusedField === 'fullName' ? 'focus' : errors.fullName ? 'error' : 'initial'}
                    >
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('fullName')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="John Doe"
                                className={`pl-12 w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                                    errors.fullName 
                                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                        : 'border-gray-200 focus:border-[#D4AF76] focus:ring-2 focus:ring-[#D4AF76]/20'
                                } outline-none`}
                            />
                        </div>
                    </motion.div>
                    <AnimatePresence>
                        {errors.fullName && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-red-500 text-xs mt-1 ml-1"
                            >
                                {errors.fullName}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Address Line 1 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <motion.div
                        variants={inputVariants}
                        animate={focusedField === 'addressLine1' ? 'focus' : errors.addressLine1 ? 'error' : 'initial'}
                    >
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                name="addressLine1"
                                value={formData.addressLine1}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('addressLine1')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Street address, P.O. box"
                                className={`pl-12 w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                                    errors.addressLine1 
                                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                        : 'border-gray-200 focus:border-[#D4AF76] focus:ring-2 focus:ring-[#D4AF76]/20'
                                } outline-none`}
                            />
                        </div>
                    </motion.div>
                    <AnimatePresence>
                        {errors.addressLine1 && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-red-500 text-xs mt-1 ml-1"
                            >
                                {errors.addressLine1}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Address Line 2 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Address Line 2 <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <motion.div
                        variants={inputVariants}
                        animate={focusedField === 'addressLine2' ? 'focus' : 'initial'}
                    >
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                name="addressLine2"
                                value={formData.addressLine2}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('addressLine2')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Apartment, suite, unit, building, floor, etc."
                                className="pl-12 w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D4AF76] focus:ring-2 focus:ring-[#D4AF76]/20 transition-all duration-200 outline-none"
                            />
                        </div>
                    </motion.div>
                </motion.div>

                {/* City and State */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            City <span className="text-red-500">*</span>
                        </label>
                        <motion.div
                            variants={inputVariants}
                            animate={focusedField === 'city' ? 'focus' : errors.city ? 'error' : 'initial'}
                        >
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('city')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="New York"
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                                    errors.city 
                                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                        : 'border-gray-200 focus:border-[#D4AF76] focus:ring-2 focus:ring-[#D4AF76]/20'
                                } outline-none`}
                            />
                        </motion.div>
                        <AnimatePresence>
                            {errors.city && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-red-500 text-xs mt-1 ml-1"
                                >
                                    {errors.city}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            State <span className="text-red-500">*</span>
                        </label>
                        <motion.div
                            variants={inputVariants}
                            animate={focusedField === 'state' ? 'focus' : errors.state ? 'error' : 'initial'}
                        >
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('state')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="NY"
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                                    errors.state 
                                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                        : 'border-gray-200 focus:border-[#D4AF76] focus:ring-2 focus:ring-[#D4AF76]/20'
                                } outline-none`}
                            />
                        </motion.div>
                        <AnimatePresence>
                            {errors.state && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-red-500 text-xs mt-1 ml-1"
                                >
                                    {errors.state}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Postal Code and Country */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Postal Code <span className="text-red-500">*</span>
                        </label>
                        <motion.div
                            variants={inputVariants}
                            animate={focusedField === 'postalCode' ? 'focus' : errors.postalCode ? 'error' : 'initial'}
                        >
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('postalCode')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="10001"
                                    className={`pl-12 w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                                        errors.postalCode 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                            : 'border-gray-200 focus:border-[#D4AF76] focus:ring-2 focus:ring-[#D4AF76]/20'
                                    } outline-none`}
                                />
                            </div>
                        </motion.div>
                        <AnimatePresence>
                            {errors.postalCode && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-red-500 text-xs mt-1 ml-1"
                                >
                                    {errors.postalCode}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Country <span className="text-red-500">*</span>
                        </label>
                        <motion.div
                            variants={inputVariants}
                            animate={focusedField === 'country' ? 'focus' : errors.country ? 'error' : 'initial'}
                        >
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('country')}
                                    onBlur={() => setFocusedField(null)}
                                    className={`pl-12 w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 appearance-none ${
                                        errors.country 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                            : 'border-gray-200 focus:border-[#D4AF76] focus:ring-2 focus:ring-[#D4AF76]/20'
                                    } outline-none bg-white`}
                                >
                                    <option value="">Select Country</option>
                                    <option value="IN">India</option>
                                    <option value="US">United States</option>
                                    <option value="CA">Canada</option>
                                    <option value="GB">United Kingdom</option>
                                    <option value="AU">Australia</option>
                                    <option value="AE">United Arab Emirates</option>
                                    <option value="SG">Singapore</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </motion.div>
                        <AnimatePresence>
                            {errors.country && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-red-500 text-xs mt-1 ml-1"
                                >
                                    {errors.country}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Phone */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <motion.div
                        variants={inputVariants}
                        animate={focusedField === 'phone' ? 'focus' : errors.phone ? 'error' : 'initial'}
                    >
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('phone')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="1234567890"
                                maxLength="10"
                                className={`pl-12 w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                                    errors.phone 
                                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                        : 'border-gray-200 focus:border-[#D4AF76] focus:ring-2 focus:ring-[#D4AF76]/20'
                                } outline-none`}
                            />
                        </div>
                    </motion.div>
                    <AnimatePresence>
                        {errors.phone && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-red-500 text-xs mt-1 ml-1"
                            >
                                {errors.phone}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Submit Button */}
            <motion.button
                type="submit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-8 bg-gradient-to-r from-[#D4AF76] to-[#8B6B4C] text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 group"
            >
                <span>Continue to Payment</span>
                <motion.svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
            </motion.button>
        </form>
    );
}