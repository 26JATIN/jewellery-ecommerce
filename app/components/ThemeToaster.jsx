"use client";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";

export default function ThemeToaster() {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        // Check initial theme
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(isDark ? 'dark' : 'light');

        // Watch for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const isDark = document.documentElement.classList.contains('dark');
                    setTheme(isDark ? 'dark' : 'light');
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    return <Toaster position="top-right" richColors theme={theme} />;
}
