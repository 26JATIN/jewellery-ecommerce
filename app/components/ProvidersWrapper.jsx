"use client";
import React from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { NavbarProvider } from '../context/NavbarContext.js';

// Wrapper component that properly connects contexts
function CartWithAuth({ children }) {
    const authContext = useAuth();
    
    // Safety check
    if (!authContext) {
        console.error('AuthContext not available in CartWithAuth');
        return <>{children}</>;
    }
    
    const { user, triggerLoginModal } = authContext;
    
    return (
        <CartProvider authUser={user} authTriggerLoginModal={triggerLoginModal}>
            {children}
        </CartProvider>
    );
}

export default function ProvidersWrapper({ children }) {
    return (
        <AuthProvider>
            <CartWithAuth>
                <NavbarProvider>
                    {children}
                </NavbarProvider>
            </CartWithAuth>
        </AuthProvider>
    );
}
