"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const { user, triggerRegisterModal } = useAuth();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            if (user) {
                mergeGuestCartAndFetch();
            } else {
                // Load guest cart from localStorage
                loadGuestCart();
            }
        }
    }, [user, mounted]);

    const mergeGuestCartAndFetch = async () => {
        try {
            // Get guest cart from localStorage
            const savedCart = localStorage.getItem('guestCart');
            const guestItems = savedCart ? JSON.parse(savedCart) : [];

            if (guestItems.length > 0) {
                // Merge guest cart items with user cart
                for (const item of guestItems) {
                    try {
                        await fetch('/api/cart', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                product: {
                                    _id: item.id,
                                    id: item.id,
                                    name: item.name,
                                    price: item.price,
                                    sellingPrice: item.price,
                                    image: item.image
                                }
                            }),
                        });
                    } catch (error) {
                        console.error('Failed to merge cart item:', error);
                    }
                }
                // Clear guest cart after merging
                localStorage.removeItem('guestCart');
            }

            // Fetch the merged cart
            await fetchCartItems();
        } catch (error) {
            console.error('Failed to merge guest cart:', error);
            await fetchCartItems();
        }
    };

    const loadGuestCart = () => {
        try {
            const savedCart = localStorage.getItem('guestCart');
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
            } else {
                setCartItems([]);
            }
        } catch (error) {
            console.error('Failed to load guest cart:', error);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    const saveGuestCart = (items) => {
        try {
            localStorage.setItem('guestCart', JSON.stringify(items));
        } catch (error) {
            console.error('Failed to save guest cart:', error);
        }
    };

    const fetchCartItems = async () => {
        try {
            const res = await fetch('/api/cart');
            if (res.ok) {
                const data = await res.json();
                setCartItems(Array.isArray(data.items) ? data.items : []);
            } else {
                setCartItems([]);
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (product, quantity = 1) => {
        try {
            if (!user) {
                // User not authenticated - show register modal with helpful message
                toast.warning('Please sign up or log in to add items to your cart!');
                triggerRegisterModal();
                return false; // Return false to indicate cart addition failed
            }

            // Normalize product data for API
            const productData = {
                ...product,
                id: product._id || product.id,
                price: product.sellingPrice,
                quantity: quantity
            };

            // Include variant information if present
            if (product.selectedVariant) {
                productData.variantId = product.selectedVariant._id;
                productData.selectedVariant = product.selectedVariant;
                productData.cartKey = product.cartKey || `${product._id}_${product.selectedVariant._id}`;
            }

            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product: productData }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error('Cart API error:', {
                    status: res.status,
                    statusText: res.statusText,
                    error: errorData
                });
                throw new Error(errorData.error || `Failed to add to cart (${res.status})`);
            }
            const data = await res.json();
            setCartItems(data.items || []);
            
            // Trigger vibration feedback on successful add
            if (navigator.vibrate) {
                // Short double vibration: 50ms vibrate, 50ms pause, 50ms vibrate
                navigator.vibrate([50, 50, 50]);
            }
            
            // Show success feedback
            toast.success('Item added to cart!');
            return true; // Return true on success
        } catch (error) {
            console.error('Add to cart error:', error);
            // Show user-friendly error message
            toast.error('Failed to add item to cart. Please try again.');
            return false; // Return false on error
        }
    };

    const updateQuantity = async (productId, quantity) => {
        // Extract the actual ID if productId is an object
        const actualProductId = typeof productId === 'object' && productId !== null 
            ? (productId._id || productId.id) 
            : productId;

        if (!user) {
            // Handle guest cart
            setCartItems(prev => {
                const newItems = prev.map(item => {
                    const itemId = typeof item.product === 'object' 
                        ? (item.product._id || item.product.id)
                        : item.product;
                    return itemId === actualProductId
                        ? { ...item, quantity }
                        : item;
                });
                saveGuestCart(newItems);
                return newItems;
            });
            return;
        }

        try {
            console.log('Updating quantity - productId:', actualProductId, 'quantity:', quantity);
            const res = await fetch(`/api/cart/${actualProductId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity })
            });

            if (res.ok) {
                fetchCartItems();
            } else {
                const errorData = await res.json();
                console.error('Failed to update quantity - response:', res.status, errorData);
            }
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    };
    const removeFromCart = async (productId) => {
        // Extract the actual ID if productId is an object
        const actualProductId = typeof productId === 'object' && productId !== null 
            ? (productId._id || productId.id) 
            : productId;

        if (!user) {
            // Handle guest cart
            setCartItems(prev => {
                const newItems = prev.filter(item => {
                    const itemId = typeof item.product === 'object' 
                        ? (item.product._id || item.product.id)
                        : item.product;
                    return itemId !== actualProductId;
                });
                saveGuestCart(newItems);
                return newItems;
            });
            return;
        }

        try {
            console.log('Removing from cart - productId:', actualProductId);
            const res = await fetch(`/api/cart/${actualProductId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchCartItems();
            } else {
                const errorData = await res.json();
                console.error('Failed to remove item - response:', res.status, errorData);
            }
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

    const clearCart = async () => {
        if (user) {
            try {
                const res = await fetch('/api/cart/clear', {
                    method: 'DELETE'
                });
                if (!res.ok) {
                    throw new Error('Failed to clear cart');
                }
            } catch (error) {
                console.error('Clear cart error:', error);
            }
        } else {
            // Clear guest cart from localStorage
            localStorage.removeItem('guestCart');
        }
        setCartItems([]);
        setIsCartOpen(false);
    };

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <CartContext.Provider value={{
                isCartOpen: false,
                setIsCartOpen: () => {},
                cartItems: [],
                addToCart: async () => {},
                removeFromCart: async () => {},
                updateQuantity: async () => {},
                clearCart: async () => {},
                loading: true
            }}>
                {children}
            </CartContext.Provider>
        );
    }

    return (
        <CartContext.Provider value={{
            isCartOpen,
            setIsCartOpen,
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            loading
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};