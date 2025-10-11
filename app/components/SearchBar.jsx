"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchBar({ className = "", placeholder = "Search for jewelry, collections, or anything..." }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [currentQuery, setCurrentQuery] = useState(''); // Track current fetching query
    const router = useRouter();
    const searchRef = useRef(null);
    const suggestionsRef = useRef(null);
    const abortControllerRef = useRef(null);

    const fetchSuggestions = useCallback(async (query) => {
        if (!query.trim()) return;
        
        // Cancel previous request if it exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();
        
        setIsLoading(true);
        setCurrentQuery(query);
        
        // Set a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            setIsLoading(false);
        }, 5000); // 5 second timeout
        
        try {
            const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`, {
                signal: abortControllerRef.current.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                // Only update if this request wasn't aborted and query still matches
                if (!abortControllerRef.current.signal.aborted && query === searchQuery.trim()) {
                    setSuggestions(data);
                    setIsOpen(data.length > 0);
                }
            }
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name !== 'AbortError') {
                console.error('Failed to fetch suggestions:', error);
                setSuggestions([]);
                setIsOpen(false);
            }
        } finally {
            // Only stop loading if this request wasn't aborted
            if (!abortControllerRef.current?.signal.aborted) {
                setIsLoading(false);
            }
        }
    }, [searchQuery]);

    // Debounced search for suggestions
    useEffect(() => {
        // Cancel any pending request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Clear previous suggestions immediately when typing
        if (searchQuery.trim().length < 2) {
            setSuggestions([]);
            setIsOpen(false);
            setIsLoading(false);
            setCurrentQuery('');
            return;
        }

        const timeoutId = setTimeout(() => {
            const trimmedQuery = searchQuery.trim();
            if (trimmedQuery.length >= 2) {
                fetchSuggestions(trimmedQuery);
            }
        }, 300);

        return () => {
            clearTimeout(timeoutId);
            // Cancel any pending request when effect cleans up
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [searchQuery, fetchSuggestions]);

    // Handle clicking outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync search query with URL when on products page
    useEffect(() => {
        const handleRouteChange = () => {
            const currentPath = window.location.pathname;
            if (currentPath === '/products') {
                const urlParams = new URLSearchParams(window.location.search);
                const searchFromUrl = urlParams.get('search');
                if (searchFromUrl && searchFromUrl !== searchQuery) {
                    setSearchQuery(searchFromUrl);
                } else if (!searchFromUrl && searchQuery) {
                    setSearchQuery('');
                }
            }
        };

        window.addEventListener('popstate', handleRouteChange);
        setTimeout(() => {
            const currentPath = window.location.pathname;
            if (currentPath === '/products') {
                const urlParams = new URLSearchParams(window.location.search);
                const searchFromUrl = urlParams.get('search');
                if (searchFromUrl) {
                    setSearchQuery(searchFromUrl);
                }
            }
        }, 100);

        return () => window.removeEventListener('popstate', handleRouteChange);
    }, [searchQuery, fetchSuggestions]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const handleSearch = (query = searchQuery) => {
        const trimmedQuery = query.trim();
        if (trimmedQuery) {
            router.push(`/products?search=${encodeURIComponent(trimmedQuery)}`);
        } else {
            router.push('/products');
        }
        setIsOpen(false);
        setSelectedIndex(-1);
    };

    const handleSuggestionClick = (suggestion) => {
        if (suggestion.type === 'product') {
            // Navigate directly to product detail page
            router.push(`/products/${suggestion.id}`);
        } else if (suggestion.type === 'category') {
            router.push(suggestion.url);
        } else {
            // For popular searches, go to products with search
            setSearchQuery(suggestion.text);
            handleSearch(suggestion.text);
        }
        setIsOpen(false);
        setSelectedIndex(-1);
    };

    const handleKeyDown = (e) => {
        if (!isOpen || suggestions.length === 0) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => 
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                } else {
                    handleSearch();
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
        }
    };

    const getTypeIcon = (type, icon = null) => {
        // For popular searches with specific jewelry icons
        if (type === 'popular' && icon) {
            switch (icon) {
                case 'necklace':
                    return (
                        <svg className="w-4 h-4 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="8" r="3" strokeWidth={2} />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c-3 0-6 2-6 5v3h12v-3c0-3-3-5-6-5z" />
                        </svg>
                    );
                case 'ring':
                    return (
                        <svg className="w-4 h-4 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="8" strokeWidth={2} />
                            <circle cx="12" cy="12" r="3" strokeWidth={2} />
                        </svg>
                    );
                case 'earring':
                    return (
                        <svg className="w-4 h-4 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="9" cy="6" r="2" strokeWidth={2} />
                            <circle cx="15" cy="6" r="2" strokeWidth={2} />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8v8m6-8v8" />
                        </svg>
                    );
                default:
                    return (
                        <svg className="w-4 h-4 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    );
            }
        }

        switch (type) {
            case 'product':
                return (
                    <svg className="w-4 h-4 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                );
            case 'category':
                return (
                    <svg className="w-4 h-4 text-[#8B6B4C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                );
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'product': return 'Product';
            case 'category': return 'Collection';
            case 'popular': return 'Popular';
            default: return '';
        }
    };

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            <motion.form 
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                }}
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                <motion.input
                    type="text"
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0) {
                            setIsOpen(true);
                        }
                    }}
                    className="w-full px-6 py-4 text-sm bg-white/60 backdrop-blur-lg border border-white/30 rounded-2xl focus:bg-white/90 focus:border-[#D4AF76]/50 focus:ring-4 focus:ring-[#D4AF76]/20 outline-none transition-all duration-300 shadow-sm pr-20 placeholder:text-gray-500 lg:px-6 lg:py-4 sm:px-4 sm:py-3"
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
                
                {/* Loading indicator */}
                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute right-14 top-1/2 -translate-y-1/2"
                        >
                            <div className="animate-spin w-4 h-4 border-2 border-[#D4AF76] border-t-transparent rounded-full"></div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Clear button */}
                <AnimatePresence>
                    {searchQuery && !isLoading && (
                        <motion.button 
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setSuggestions([]);
                                setIsOpen(false);
                                router.push('/products');
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

                {/* Search button */}
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

            {/* Suggestions Dropdown */}
            <AnimatePresence mode="wait">
                {isOpen && (suggestions.length > 0 || isLoading) && searchQuery.trim().length >= 2 && (
                    <motion.div
                        ref={suggestionsRef}
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden z-50"
                    >
                        {isLoading ? (
                            <div className="py-2">
                                {/* Loading skeleton */}
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
                                        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                            <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className="max-h-80 overflow-y-auto">
                                    {suggestions.map((suggestion, index) => (
                                <motion.button
                                    key={suggestion.id}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className={`w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-gray-50 transition-all duration-200 ${
                                        selectedIndex === index ? 'bg-[#D4AF76]/10 border-l-4 border-[#D4AF76]' : ''
                                    }`}
                                    whileHover={{ x: 4, backgroundColor: "rgba(212, 175, 118, 0.05)" }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    {suggestion.image ? (
                                        <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative">
                                            <img
                                                src={suggestion.image}
                                                alt={suggestion.text}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                onError={(e) => {
                                                    // Hide the image and show fallback
                                                    e.target.style.display = 'none';
                                                    const fallback = e.target.nextElementSibling;
                                                    if (fallback) {
                                                        fallback.style.display = 'flex';
                                                    }
                                                }}
                                            />
                                            <div className="w-full h-full bg-gradient-to-br from-[#D4AF76]/20 to-[#8B6B4C]/20 items-center justify-center absolute inset-0 hidden">
                                                {getTypeIcon(suggestion.type, suggestion.icon)}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center">
                                            {getTypeIcon(suggestion.type, suggestion.icon)}
                                        </div>
                                    )}
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-gray-900 truncate">
                                                {suggestion.text}
                                            </p>
                                            {suggestion.price && (
                                                <span className="text-sm font-semibold text-[#D4AF76] ml-2">
                                                    ₹{suggestion.price.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {suggestion.category ? `${getTypeLabel(suggestion.type)} • ${suggestion.category}` : getTypeLabel(suggestion.type)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {suggestion.type === 'product' && (
                                            <div className="w-6 h-6 rounded-full bg-[#D4AF76]/20 flex items-center justify-center">
                                                <svg className="w-3 h-3 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </div>
                                        )}
                                        {suggestion.type === 'category' && (
                                            <div className="w-6 h-6 rounded-full bg-[#8B6B4C]/20 flex items-center justify-center">
                                                <svg className="w-3 h-3 text-[#8B6B4C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2" />
                                                </svg>
                                            </div>
                                        )}
                                        {suggestion.type === 'popular' && (
                                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                        
                        {/* Search footer */}
                        <div className="border-t border-gray-100 px-4 py-2 bg-gray-50/50">
                            <button
                                onClick={() => handleSearch()}
                                className="flex items-center gap-2 text-sm text-[#D4AF76] hover:text-[#8B6B4C] transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Search for "{searchQuery}"
                            </button>
                        </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}