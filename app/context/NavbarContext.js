"use client";
import { createContext, useContext, useState } from 'react';

const NavbarContext = createContext();

export function NavbarProvider({ children }) {
    const [isNavbarHidden, setIsNavbarHidden] = useState(false);

    const hideNavbar = () => setIsNavbarHidden(true);
    const showNavbar = () => setIsNavbarHidden(false);

    return (
        <NavbarContext.Provider value={{
            isNavbarHidden,
            hideNavbar,
            showNavbar
        }}>
            {children}
        </NavbarContext.Provider>
    );
}

export function useNavbar() {
    const context = useContext(NavbarContext);
    if (!context) {
        throw new Error('useNavbar must be used within a NavbarProvider');
    }
    return context;
}