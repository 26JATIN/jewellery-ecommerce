"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Read from localStorage — default to light if no preference stored
        const stored = localStorage.getItem('theme');
        if (stored === 'dark') {
            setTheme('dark');
            applyTheme('dark');
        } else {
            setTheme('light');
            applyTheme('light');
        }
    }, []);

    const applyTheme = (newTheme, animate = false) => {
        const root = document.documentElement;

        if (animate) {
            // Add transition class to enable smooth theme switch
            root.classList.add('theme-transitioning');
        }

        if (newTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Update theme-color meta to match navbar bg
        const meta = document.getElementById('theme-color-meta');
        if (meta) {
            meta.content = newTheme === 'dark' ? '#000000' : '#ffffff';
        }

        if (animate) {
            // Remove transition class after animation completes
            setTimeout(() => {
                root.classList.remove('theme-transitioning');
            }, 350);
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme, true);
    };

    const isDark = theme === 'dark';

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark, mounted }}>
            {children}
        </ThemeContext.Provider>
    );
}
