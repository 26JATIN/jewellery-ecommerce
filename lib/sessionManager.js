/**
 * Session Manager Utility
 * Handles secure session management, token validation, and cleanup
 */

/**
 * Clear all authentication data from client
 */
export function clearAuthData() {
    if (typeof window === 'undefined') return;
    
    try {
        // Clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        // Clear any cached data
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    if (name.includes('auth') || name.includes('user')) {
                        caches.delete(name);
                    }
                });
            });
        }
        
        console.log('Auth data cleared successfully');
    } catch (error) {
        console.error('Error clearing auth data:', error);
    }
}

/**
 * Check if user session is valid
 */
export async function validateSession() {
    try {
        const response = await fetch('/api/auth/check', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Cache-Control': 'no-cache',
            },
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.authenticated) {
            console.log('Session validation failed:', data.reason);
            clearAuthData();
            return null;
        }
        
        return data.user;
    } catch (error) {
        console.error('Session validation error:', error);
        clearAuthData();
        return null;
    }
}

/**
 * Force logout and cleanup
 */
export async function forceLogout() {
    try {
        // Call logout API
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });
    } catch (error) {
        console.error('Logout API error:', error);
    } finally {
        // Always clear client data
        clearAuthData();
        
        // Force redirect to home
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    }
}

/**
 * Check if current user has admin privileges
 */
export async function checkAdminAccess() {
    const user = await validateSession();
    
    if (!user) {
        return { hasAccess: false, reason: 'Not authenticated' };
    }
    
    if (!user.isAdmin) {
        return { hasAccess: false, reason: 'Not an administrator' };
    }
    
    return { hasAccess: true, user };
}

/**
 * Setup session timeout handler
 */
export function setupSessionTimeout(callback, timeoutMs = 7 * 24 * 60 * 60 * 1000) {
    if (typeof window === 'undefined') return null;
    
    let timeoutId;
    let lastActivity = Date.now();
    
    const resetTimer = () => {
        lastActivity = Date.now();
        clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
            console.log('Session timeout reached');
            callback();
        }, timeoutMs);
    };
    
    // Activity events
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
        window.addEventListener(event, resetTimer);
    });
    
    resetTimer();
    
    // Cleanup function
    return () => {
        clearTimeout(timeoutId);
        events.forEach(event => {
            window.removeEventListener(event, resetTimer);
        });
    };
}

/**
 * Get session info
 */
export function getSessionInfo() {
    if (typeof window === 'undefined') return null;
    
    try {
        // Try to get any stored session info
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
    } catch (error) {
        console.error('Error reading session info:', error);
    }
    
    return null;
}

/**
 * Secure cookie helper (for client-side cookie reading)
 */
export function getCookie(name) {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    
    return null;
}

/**
 * Check if cookies are enabled
 */
export function areCookiesEnabled() {
    if (typeof navigator === 'undefined') return false;
    return navigator.cookieEnabled;
}

export default {
    clearAuthData,
    validateSession,
    forceLogout,
    checkAdminAccess,
    setupSessionTimeout,
    getSessionInfo,
    getCookie,
    areCookiesEnabled
};
