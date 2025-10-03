"use client";
import React from "react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-[#2C2C2C] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-light tracking-widest">LUXE</h3>
                        <p className="text-gray-400 font-light leading-relaxed">
                            Crafting timeless elegance through exceptional jewelry that tells your unique story.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full border border-gray-700 hover:border-[#D4AF76] flex items-center justify-center transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full border border-gray-700 hover:border-[#D4AF76] flex items-center justify-center transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="font-light text-lg mb-6 text-[#D4AF76]">Explore</h4>
                        <ul className="space-y-3">
                            <li><Link href="/" className="text-gray-400 hover:text-[#D4AF76] transition-colors font-light">Home</Link></li>
                            <li><Link href="/collections" className="text-gray-400 hover:text-[#D4AF76] transition-colors font-light">Collections</Link></li>
                            <li><Link href="/about" className="text-gray-400 hover:text-[#D4AF76] transition-colors font-light">About Us</Link></li>
                            <li><Link href="/contact" className="text-gray-400 hover:text-[#D4AF76] transition-colors font-light">Contact</Link></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="font-light text-lg mb-6 text-[#D4AF76]">Support</h4>
                        <ul className="space-y-3">
                            <li><Link href="/shipping" className="text-gray-400 hover:text-[#D4AF76] transition-colors font-light">Shipping Info</Link></li>
                            <li><Link href="/returns" className="text-gray-400 hover:text-[#D4AF76] transition-colors font-light">Returns</Link></li>
                            <li><Link href="/faq" className="text-gray-400 hover:text-[#D4AF76] transition-colors font-light">FAQ</Link></li>
                            <li><Link href="/care" className="text-gray-400 hover:text-[#D4AF76] transition-colors font-light">Care Guide</Link></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="font-light text-lg mb-6 text-[#D4AF76]">Stay Connected</h4>
                        <p className="text-gray-400 font-light mb-4 leading-relaxed">
                            Subscribe for exclusive offers and new arrivals.
                        </p>
                        <div className="flex flex-col gap-3">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF76] transition-colors font-light"
                            />
                            <button className="px-6 py-3 bg-[#D4AF76] text-[#2C2C2C] rounded-full hover:bg-[#B8956A] transition-colors font-light">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="mt-16 pt-8 border-t border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-500 font-light text-sm">
                            © 2025 LUXE. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <Link href="/privacy" className="text-gray-500 hover:text-[#D4AF76] transition-colors font-light">Privacy Policy</Link>
                            <Link href="/terms" className="text-gray-500 hover:text-[#D4AF76] transition-colors font-light">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}