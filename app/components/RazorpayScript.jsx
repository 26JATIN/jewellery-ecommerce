"use client";
import { useEffect } from 'react';

export default function RazorpayScript() {
    useEffect(() => {
        // Only load Razorpay script on client side when needed
        if (typeof window !== 'undefined' && !window.Razorpay) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    return null;
}