import { NextResponse } from 'next/server';
import { verifyTokenEdge } from './lib/auth';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Check if it's an admin route
    if (pathname.startsWith('/admin')) {
        try {
            const token = request.cookies.get('token')?.value;

            if (!token) {
                const homeUrl = new URL('/', request.url);
                homeUrl.searchParams.set('login', 'required');
                homeUrl.searchParams.set('redirect', pathname);
                return NextResponse.redirect(homeUrl);
            }

            const decoded = await verifyTokenEdge(token);
            if (!decoded) {
                const homeUrl = new URL('/', request.url);
                homeUrl.searchParams.set('login', 'required');
                homeUrl.searchParams.set('redirect', pathname);
                return NextResponse.redirect(homeUrl);
            }

            // We can't check user.isAdmin here without a database connection
            // So we'll rely on the client-side and API-side protection
            // The client-side HOC will handle the admin role check

            return NextResponse.next();
        } catch (error) {
            console.error('Middleware auth error:', error);
            const homeUrl = new URL('/', request.url);
            homeUrl.searchParams.set('login', 'required');
            homeUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(homeUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*']
};