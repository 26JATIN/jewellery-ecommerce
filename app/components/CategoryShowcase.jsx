"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import SafeImage from "./SafeImage";
import { useRouter } from "next/navigation";

// Category Preview Component
const CategoryPreview = React.memo(({ category, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className || ''}`}>
      {category.image ? (
        <>
          <SafeImage
            src={category.image}
            alt={category.name}
            fill={true}
            className={`object-cover object-top transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'
              } ${hasError ? 'hidden' : 'block'}`}
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
        </>
      ) : null}

      {/* Loading state */}
      {(!isLoaded && !hasError) && category.image && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-[#D4AF76] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Loading preview...
            </p>
          </div>
        </div>
      )}

      {/* Fallback when no image */}
      {(!category.image || hasError) && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#FAFAFA] to-[#F5F5F5] dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400 p-4">
            <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-40 text-[#D4AF76]" />
            <div className="text-sm font-medium mb-1">{typeof category.name === 'object' ? category.name?.name || '' : category.name}</div>
          </div>
        </div>
      )}

      {/* Click overlay for cards */}
      <div className="absolute inset-0 bg-transparent cursor-pointer z-10" />
    </div>
  );
});

CategoryPreview.displayName = 'CategoryPreview';

// Subcategory Badge Component
const SubcategoryBadge = React.memo(({ subcategory, onClick, index }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="cursor-pointer group/sub"
    >
      {/* Subcategory Badge */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 group-hover/sub:border-[#D4AF76] transition-all duration-300">
        {subcategory.image ? (
          <>
            <SafeImage
              src={subcategory.image}
              alt={subcategory.name}
              fill={true}
              className={`object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setIsLoaded(true)}
              loading="lazy"
            />
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-[#D4AF76] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#D4AF76] opacity-30" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

        {/* Subcategory Name */}
        <div className="absolute inset-x-0 bottom-0 p-2">
          <p className="text-white text-xs font-medium text-center line-clamp-2 drop-shadow-lg">
            {typeof subcategory.name === 'object' ? subcategory.name?.name || '' : subcategory.name}
          </p>
        </div>
      </div>
    </motion.div>
  );
});

SubcategoryBadge.displayName = 'SubcategoryBadge';

// Main Category Card Component
export const Card = React.memo(({
  card,
  index,
  layout = false,
  onClick,
  subcategories = [],
  onSubcategoryClick
}) => {
  const router = useRouter();

  // Memoize the card preview to prevent unnecessary re-renders
  const cardPreview = useMemo(() => (
    <div
      className={`rounded-xl sm:rounded-2xl transition-all duration-700 ease-out hover:scale-105 p-0.5 sm:p-1 md:p-2 aspect-[4/3] overflow-hidden relative group`}
      style={{
        borderRadius: '24px 24px 4px 24px'
      }}
    >
      <div className="bg-white dark:bg-[#0A0A0A] h-full shadow-lg relative overflow-hidden" style={{ borderRadius: '16px 16px 2px 16px' }}>
        <CategoryPreview
          category={card}
          className="w-full h-full"
        />
      </div>
    </div>
  ), [card]);

  const handleOpen = () => {
    if (onClick) onClick(card);
  };

  const handleSubcategoryClick = (e, subcategory) => {
    e.stopPropagation();
    if (onSubcategoryClick) {
      onSubcategoryClick(card, subcategory);
    }
  };

  return (
    <motion.div
      layoutId={layout ? `card-${card._id || card.name}` : undefined}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleOpen}
      className="cursor-pointer card-hover border border-gray-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-2 sm:p-3 bg-white/50 dark:bg-white/5 shadow-sm hover:shadow-lg"
      transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      {cardPreview}
      <div className="space-y-2 sm:space-y-3 md:space-y-4 mt-2 sm:mt-3 md:mt-4">
        <div className="flex flex-col gap-1 sm:gap-2">
          <div className="flex justify-between items-start gap-2">
            <motion.h3
              layoutId={layout ? `title-${card._id || card.name}` : undefined}
              className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-foreground leading-tight flex-1"
            >
              {typeof card.name === 'object' ? card.name?.name || '' : card.name}
            </motion.h3>
          </div>
          {card.description && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {card.description}
            </p>
          )}
        </div>

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {subcategories.length} {subcategories.length === 1 ? 'Style' : 'Styles'}
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {subcategories.slice(0, 4).map((sub, idx) => (
                <SubcategoryBadge
                  key={sub._id || idx}
                  subcategory={sub}
                  index={idx}
                  onClick={(e) => handleSubcategoryClick(e, sub)}
                />
              ))}
            </div>
            {subcategories.length > 4 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(card);
                }}
                className="text-xs text-[#D4AF76] hover:text-[#B8935F] transition-colors font-medium"
              >
                +{subcategories.length - 4} more styles →
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

Card.displayName = 'Card';

export default function CategoryShowcase() {
  const [isVisible, setIsVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const sectionRef = useRef(null);
  const router = useRouter();

  const MAX_DISPLAYED = 16; // Maximum subcategories to display initially

  // Function to scroll to the top of the section smoothly
  const scrollToSection = useCallback(() => {
    if (sectionRef.current) {
      const sectionTop = sectionRef.current.offsetTop;
      window.scrollTo({
        top: sectionTop - 80,
        behavior: 'smooth'
      });
    }
  }, []);

  // Handle category change with scroll
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    scrollToSection();
  }, [scrollToSection]);

  // Check if element is already in viewport on mount (for direct mobile navigation)
  useEffect(() => {
    const checkInitialVisibility = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom >= 0;
        if (isInViewport) {
          setIsVisible(true);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(checkInitialVisibility, 100);
    return () => clearTimeout(timer);
  }, []);

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 } // Reduced threshold for better mobile detection
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Fetch categories and subcategories
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        const timestamp = Date.now();
        const [categoriesRes, subcategoriesRes] = await Promise.all([
          fetch(`/api/categories?_=${timestamp}`, {
            signal: controller.signal,
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache'
            }
          }),
          fetch(`/api/subcategories?_=${timestamp}`, {
            signal: controller.signal,
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache'
            }
          })
        ]);

        const categoriesData = await categoriesRes.json();
        const subcategoriesData = await subcategoriesRes.json();

        // Filter active categories AND deduplicate by name to prevent layoutId collisions
        const uniqueCategories = Array.isArray(categoriesData)
          ? categoriesData
            .filter(cat => cat && cat.isActive && cat.name && cat._id)
            .filter((cat, index, self) =>
              index === self.findIndex((t) => t && t.name === cat.name)
            )
          : [];
        setCategories(uniqueCategories);

        // Deduplicate subcategories by ID
        const uniqueSubcategories = (subcategoriesData.success && Array.isArray(subcategoriesData.subcategories))
          ? subcategoriesData.subcategories
            .filter(sub => sub && sub.isActive && sub._id && sub.name)
            .filter((sub, index, self) =>
              index === self.findIndex((t) => t && t._id === sub._id)
            )
          : [];
        setSubcategories(uniqueSubcategories);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching categories:', error);
          setCategories([]);
          setSubcategories([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, []);

  const getSubcategoriesForCategory = useCallback((categoryId, categoryName) => {
    if (!subcategories || !Array.isArray(subcategories)) {
      return [];
    }
    return subcategories.filter(sub => {
      if (!sub || !sub.category) return false;
      const match = sub.category?._id === categoryId ||
        sub.category?.name === categoryName ||
        sub.category === categoryId ||
        sub.category === categoryName;
      return match && sub.isActive;
    });
  }, [subcategories]);

  const handleSubcategoryClick = useCallback((subcategory) => {
    try {
      console.log('Subcategory clicked:', subcategory);

      if (!subcategory) {
        console.error('No subcategory data provided');
        return;
      }

      // Get the category info for the subcategory
      // Enhanced safety checks for category matching
      const categoryInfo = categories.find(cat =>
        (cat._id && subcategory.category?._id && cat._id === subcategory.category._id) ||
        (cat.name && subcategory.category?.name && cat.name === subcategory.category.name) ||
        (cat._id && subcategory.category === cat._id) ||
        (cat.name && subcategory.category === cat.name)
      );

      console.log('Category info found:', categoryInfo);

      if (categoryInfo && subcategory._id) {
        let safeCategoryName = categoryInfo.name || '';
        if (typeof safeCategoryName === 'object') {
          safeCategoryName = safeCategoryName.name || '';
        }
        const categoryName = encodeURIComponent(safeCategoryName);
        const subcategoryId = encodeURIComponent(subcategory._id || '');
        const url = `/products?category=${categoryName}&subcategory=${subcategoryId}`;
        console.log('Navigating to:', url);
        router.push(url);
      } else if (subcategory._id) {
        // Fallback: navigate with just subcategory if category not found
        console.log('Category not found, navigating with subcategory only');
        const subcategoryId = encodeURIComponent(subcategory._id || '');
        router.push(`/products?subcategory=${subcategoryId}`);
      } else {
        console.error('Unable to navigate - missing subcategory ID');
      }
    } catch (error) {
      console.error('Error in handleSubcategoryClick:', error);
      // Emergency fallback
      router.push('/products');
    }
  }, [router, categories]);

  // Get unique categories for filter buttons
  const categoryFilters = useMemo(() => {
    const filters = ['ALL'];
    categories.forEach(cat => {
      const name = typeof cat.name === 'object' ? cat.name?.name : cat.name;
      if (name && !filters.includes(name)) {
        filters.push(name);
      }
    });
    return filters;
  }, [categories]);

  // Filter subcategories based on selected category
  const filteredSubcategories = useMemo(() => {
    if (selectedCategory === 'ALL') {
      return subcategories;
    }
    // Find the selected category
    const category = categories.find(cat => (typeof cat.name === 'object' ? cat.name?.name : cat.name) === selectedCategory);
    if (!category) return [];

    return subcategories.filter(sub => {
      if (!sub) return false;
      const subCatName = typeof sub.category?.name === 'object' ? sub.category.name?.name : sub.category?.name;
      const catName = typeof category.name === 'object' ? category.name?.name : category.name;

      // Safe comparison
      const match = (sub.category?._id && category._id && sub.category._id === category._id) ||
        (subCatName && catName && subCatName === catName) ||
        (sub.category === category._id) ||
        (sub.category === catName);
      return match && sub.isActive;
    });
  }, [subcategories, selectedCategory, categories]);

  // Get displayed subcategories (limited to MAX_DISPLAYED)
  const displayedSubcategories = useMemo(() => {
    return filteredSubcategories.slice(0, MAX_DISPLAYED);
  }, [filteredSubcategories]);

  const hasMore = filteredSubcategories.length > MAX_DISPLAYED;

  // Memoize loading skeleton
  const loadingSkeleton = useMemo(() => (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
      {[...Array(12)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-800 rounded-3xl aspect-[4/3] mb-4"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  ), []);

  // Memoize rendered subcategories as cards
  const renderedSubcategories = useMemo(() => {
    return displayedSubcategories.map((subcategory, index) => (
      <motion.div
        key={`${selectedCategory}-${subcategory._id}`}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.6,
            delay: index * 0.1,
            ease: "easeOut"
          }
        }}
        exit={{
          opacity: 0,
          y: -20,
          scale: 0.95,
          transition: { duration: 0.3 }
        }}
        layout
      >
        <Card
          card={subcategory}
          index={index}
          layout={true}
          onClick={handleSubcategoryClick}
          subcategories={[]}
          onSubcategoryClick={() => { }}
        />
      </motion.div>
    ));
  }, [displayedSubcategories, selectedCategory, handleSubcategoryClick]);

  return (
    <section ref={sectionRef} className="bg-background py-8 sm:py-12 lg:py-16">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Filter Section */}
        <div className="w-full lg:w-1/5 p-4 sm:p-6 lg:p-8 xl:p-12 flex flex-col justify-start">
          {/* Added sticky positioning back with proper offset */}
          <div className="lg:sticky lg:top-24">
            <div
              className={`transform transition-all duration-1500 ease-out ${isVisible ? "translate-y-0 opacity-100" : "translate-y-[50vh] opacity-0"
                }`}
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4 sm:mb-6 lg:mb-8 hover:text-[#D4AF76] transition-all duration-300 cursor-default hover:scale-105 transform">
                Explore
                <br />
                Collections
              </h2>
            </div>

            <div
              className={`transform transition-all duration-1000 ease-out delay-500 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
            >
              {/* Category Filter Buttons */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Filter by Category
                </h3>

                {/* Desktop: Vertical layout */}
                <div className="hidden lg:flex flex-col gap-2">
                  {categoryFilters.map((filter) => {
                    const count = filter === 'ALL'
                      ? subcategories.length
                      : (() => {
                        const category = categories.find(cat => (typeof cat.name === 'object' ? cat.name?.name : cat.name) === filter);
                        if (!category) return 0;
                        return subcategories.filter(sub => {
                          const subCatName = typeof sub.category?.name === 'object' ? sub.category.name?.name : sub.category?.name;
                          const catName = typeof category.name === 'object' ? category.name?.name : category.name;

                          const match = (sub.category?._id && category._id && sub.category._id === category._id) ||
                            (subCatName && catName && subCatName === catName) ||
                            (sub.category === category._id) ||
                            (sub.category === catName);
                          return match && sub.isActive;
                        }).length;
                      })();

                    return (
                      <button
                        key={filter}
                        onClick={() => handleCategoryChange(filter)}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center justify-between group ${selectedCategory === filter
                          ? 'bg-gradient-to-r from-[#D4AF76] to-[#B8935F] text-white shadow-lg shadow-[#D4AF76]/20'
                          : 'text-gray-900 dark:text-gray-100 hover:text-[#8B6B4C] dark:hover:text-[#D4AF76] hover:bg-[#D4AF76]/5 dark:hover:bg-[#D4AF76]/10 hover:shadow-md border border-transparent hover:border-[#D4AF76]/30'
                          }`}
                      >
                        <span className="truncate">{filter}</span>
                        <span className={`ml-2 text-xs px-2 py-1 rounded-full font-semibold transition-all duration-300 ${selectedCategory === filter
                          ? 'bg-white/20 text-white backdrop-blur-sm'
                          : 'bg-[#D4AF76]/10 text-[#8B6B4C] dark:bg-[#D4AF76]/20 dark:text-[#D4AF76] group-hover:bg-[#D4AF76] group-hover:text-white'
                          }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Mobile: Horizontal scrollable layout */}
                <div className="lg:hidden overflow-x-auto">
                  <div className="flex gap-2 pb-2">
                    {categoryFilters.map((filter) => {
                      const count = filter === 'ALL'
                        ? subcategories.length
                        : (() => {
                          const category = categories.find(cat => (typeof cat.name === 'object' ? cat.name?.name : cat.name) === filter);
                          if (!category) return 0;
                          return subcategories.filter(sub => {
                            const subCatName = typeof sub.category?.name === 'object' ? sub.category.name?.name : sub.category?.name;
                            const catName = typeof category.name === 'object' ? category.name?.name : category.name;

                            const match = (sub.category?._id && category._id && sub.category._id === category._id) ||
                              (subCatName && catName && subCatName === catName) ||
                              (sub.category === category._id) ||
                              (sub.category === catName);
                            return match && sub.isActive;
                          }).length;
                        })();

                      return (
                        <button
                          key={filter}
                          onClick={() => handleCategoryChange(filter)}
                          className={`whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 group ${selectedCategory === filter
                            ? 'bg-gradient-to-r from-[#D4AF76] to-[#B8935F] text-white shadow-lg shadow-[#D4AF76]/20'
                            : 'bg-white text-gray-900 dark:bg-[#2A2520] dark:text-gray-100 hover:text-[#8B6B4C] dark:hover:text-[#D4AF76] hover:bg-[#D4AF76]/5 dark:hover:bg-[#D4AF76]/10 hover:shadow-md border border-gray-200 dark:border-gray-700 hover:border-[#D4AF76]/30'
                            }`}
                        >
                          <span>{filter}</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold transition-all duration-300 ${selectedCategory === filter
                            ? 'bg-white/20 text-white backdrop-blur-sm'
                            : 'bg-white text-[#8B6B4C] dark:bg-[#D4AF76]/20 dark:text-[#D4AF76] group-hover:bg-[#D4AF76] group-hover:text-white border border-gray-200 dark:border-transparent'
                            }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Categories Grid */}
        <div className="w-full lg:w-4/5">
          <div className="p-4 sm:p-6 lg:p-8 xl:p-12 space-y-8 sm:space-y-12">
            {/* Filter Status Indicator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4"
            >
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedCategory === 'ALL' ? 'All Collections' : selectedCategory}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredSubcategories.length <= MAX_DISPLAYED
                    ? `Showing all ${filteredSubcategories.length} collections`
                    : `Showing ${displayedSubcategories.length} of ${filteredSubcategories.length} collections`
                  }
                </p>
              </div>
              {selectedCategory !== 'ALL' && (
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className="text-sm text-gray-500 hover:text-foreground transition-colors duration-200 flex items-center gap-2"
                >
                  <span>Clear filter</span>
                  <span className="text-lg">×</span>
                </button>
              )}
            </motion.div>

            {/* Categories Grid */}
            {loading ? (
              loadingSkeleton
            ) : filteredSubcategories.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedCategory}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10"
                  >
                    {renderedSubcategories}
                  </motion.div>
                </AnimatePresence>

                {/* Show More / Explore All Button */}
                {hasMore && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex justify-center pt-8"
                  >
                    <button
                      onClick={() => {
                        // Redirect to products page with category filter if one is selected
                        if (selectedCategory !== 'ALL') {
                          router.push(`/products?category=${encodeURIComponent(selectedCategory)}`);
                        } else {
                          router.push('/products');
                        }
                      }}
                      className="group relative px-8 py-4 bg-gradient-to-r from-[#D4AF76] to-[#8B6B4C] text-white rounded-full hover:shadow-xl transition-all duration-300 font-medium tracking-wide overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        Explore All {filteredSubcategories.length} Collections
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#8B6B4C] to-[#D4AF76] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                  </motion.div>
                )}
              </>
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="text-gray-300 mb-4">
                  <Sparkles className="w-16 h-16 mx-auto opacity-40" />
                </div>
                <h3 className="text-xl font-light text-gray-600 dark:text-gray-400 mb-2">No collections available</h3>
                <p className="text-gray-500 dark:text-gray-600">Check back soon for our jewelry collections</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Styles for Performance Optimizations */}
      <style jsx global>{`
        /* Performance optimization for animations */
        .card-hover {
          will-change: transform;
          transform: translate3d(0, 0, 0);
        }

        /* Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
          .card-hover,
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Loading animation optimization */
        @keyframes skeleton-loading {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }

        .skeleton-loader {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200px 100%;
          animation: skeleton-loading 1.5s infinite;
        }

        .dark .skeleton-loader {
          background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
          background-size: 200px 100%;
        }
      `}</style>
    </section>
  );
}