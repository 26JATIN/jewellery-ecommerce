"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);  // Initialize as empty array
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchCartItems();
        } else {
            // Initialize empty cart for non-logged in users
            setCartItems([]);
            setLoading(false);
        }
    }, [user]);

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

    const addToCart = async (product) => {
        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product }),
            });

            if (!res.ok) {
                throw new Error('Failed to add to cart');
            }
            const data = await res.json();
            setCartItems(data.items);
        } catch (error) {
            console.error('Add to cart error:', error);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (!user) {
            // Handle guest cart
            setCartItems(prev =>
                prev.map(item =>
                    item.id === productId
                        ? { ...item, quantity }
                        : item
                )
            );
            return;
        }

        try {
            const res = await fetch(`/api/cart/${productId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity })
            });

            if (res.ok) {
                fetchCartItems();
            }
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    };

    const removeFromCart = async (productId) => {
        if (!user) {
            // Handle guest cart
            setCartItems(prev => prev.filter(item => item.id !== productId));
            return;
        }

        try {
            const res = await fetch(`/api/cart/${productId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchCartItems();
            }
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

    return (
        <CartContext.Provider value={{
            isCartOpen,
            setIsCartOpen,
            cartItems: cartItems || [], // Ensure we always return an array
            addToCart,
            removeFromCart,
            updateQuantity,
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