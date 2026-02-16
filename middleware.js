import { NextResponse } from 'next/server';
import { verifyTokenEdge } from './lib/auth-edge';

// Routes that require the user to be logged in (not admin, just authenticated)
const PROTECTED_ROUTES = ['/checkout', '/orders', '/returns'];

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Skip middleware for webhook routes - they need to be publicly accessible
    if (pathname.startsWith('/api/webhooks/')) {
        return NextResponse.next();
    }

    // Protect admin routes (requires admin role)
    if (pathname.startsWith('/admin')) {
        try {
            const token = request.cookies.get('token')?.value;

            // No token - redirect to home with login prompt
            if (!token) {
                console.log(`Admin access denied: No token for ${pathname}`);
                const homeUrl = new URL('/', request.url);
                homeUrl.searchParams.set('login', 'required');
                homeUrl.searchParams.set('redirect', pathname);
                homeUrl.searchParams.set('message', 'Admin access requires authentication');
                
                const response = NextResponse.redirect(homeUrl);
                response.cookies.delete('token');
                return response;
            }

            // Verify token
            const decoded = await verifyTokenEdge(token);
            if (!decoded || !decoded.userId) {
                console.log(`Admin access denied: Invalid token for ${pathname}`);
                const homeUrl = new URL('/', request.url);
                homeUrl.searchParams.set('login', 'required');
                homeUrl.searchParams.set('redirect', pathname);
                homeUrl.searchParams.set('message', 'Session expired. Please login again');
                
                const response = NextResponse.redirect(homeUrl);
                response.cookies.delete('token');
                return response;
            }

            // Token is valid, allow through (client-side HOC will check isAdmin)
            const response = NextResponse.next();
            response.headers.set('X-Frame-Options', 'DENY');
            response.headers.set('X-Content-Type-Options', 'nosniff');
            response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
            
            return response;
        } catch (error) {
            console.error('Middleware auth error:', error);
            const homeUrl = new URL('/', request.url);
            homeUrl.searchParams.set('login', 'required');
            homeUrl.searchParams.set('redirect', pathname);
            homeUrl.searchParams.set('message', 'Authentication error occurred');
            
            const response = NextResponse.redirect(homeUrl);
            response.cookies.delete('token');
            return response;
        }
    }

    // Protect authenticated-only routes (checkout, orders, returns)
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
        pathname === route || pathname.startsWith(route + '/')
    );

    if (isProtectedRoute) {
        try {
            const token = request.cookies.get('token')?.value;

            if (!token) {
                const homeUrl = new URL('/', request.url);
                homeUrl.searchParams.set('login', 'required');
                homeUrl.searchParams.set('redirect', pathname);
                homeUrl.searchParams.set('message', 'Please sign in to continue');
                
                const response = NextResponse.redirect(homeUrl);
                response.cookies.delete('token');
                return response;
            }

            const decoded = await verifyTokenEdge(token);
            if (!decoded || !decoded.userId) {
                const homeUrl = new URL('/', request.url);
                homeUrl.searchParams.set('login', 'required');
                homeUrl.searchParams.set('redirect', pathname);
                homeUrl.searchParams.set('message', 'Session expired. Please sign in again');
                
                const response = NextResponse.redirect(homeUrl);
                response.cookies.delete('token');
                return response;
            }

            // Authenticated — allow through
            return NextResponse.next();
        } catch (error) {
            console.error('Auth middleware error for protected route:', error);
            const homeUrl = new URL('/', request.url);
            homeUrl.searchParams.set('login', 'required');
            homeUrl.searchParams.set('redirect', pathname);
            homeUrl.searchParams.set('message', 'Authentication error. Please sign in again');
            
            const response = NextResponse.redirect(homeUrl);
            response.cookies.delete('token');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/checkout',
        '/orders',
        '/orders/:path*',
        '/returns',
        '/returns/:path*',
    ]
};

