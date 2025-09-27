"use client";
import React from "react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-white border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-[#8B6B4C]">JEWELRY</h3>
                        <p className="text-gray-600">
                            Crafting timeless pieces for the modern woman.
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="font-medium text-gray-900 mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="text-gray-600 hover:text-[#8B6B4C]">About Us</Link></li>
                            <li><Link href="/contact" className="text-gray-600 hover:text-[#8B6B4C]">Contact</Link></li>
                            <li><Link href="/faq" className="text-gray-600 hover:text-[#8B6B4C]">FAQ</Link></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="font-medium text-gray-900 mb-4">Collections</h4>
                        <ul className="space-y-2">
                            <li><Link href="/necklaces" className="text-gray-600 hover:text-[#8B6B4C]">Necklaces</Link></li>
                            <li><Link href="/rings" className="text-gray-600 hover:text-[#8B6B4C]">Rings</Link></li>
                            <li><Link href="/earrings" className="text-gray-600 hover:text-[#8B6B4C]">Earrings</Link></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="font-medium text-gray-900 mb-4">Newsletter</h4>
                        <p className="text-gray-600 mb-4">Subscribe to receive updates and exclusive offers.</p>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8B6B4C]"
                            />
                            <button className="px-4 py-2 bg-[#8B6B4C] text-white hover:bg-[#725939] transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-center text-gray-600">
                        © 2025 JEWELRY. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}