import { NextResponse } from 'next/server';
import { verifyTokenEdge } from './lib/auth';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Protect admin routes
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
                // Clear any invalid cookies
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
                // Clear invalid token
                response.cookies.delete('token');
                return response;
            }

            // Token is valid, allow through (client-side HOC will check isAdmin)
            // Add security headers
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

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*']
};