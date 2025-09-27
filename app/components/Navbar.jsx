"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-white fixed w-full z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-2xl font-semibold text-[#8B6B4C]">
                            LUXE
                        </Link>
                    </div>
                    
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className="text-gray-700 hover:text-[#8B6B4C] transition-colors">
                            Home
                        </Link>
                        <Link href="/collections" className="text-gray-700 hover:text-[#8B6B4C] transition-colors">
                            Collections
                        </Link>
                        <Link href="/new-arrivals" className="text-gray-700 hover:text-[#8B6B4C] transition-colors">
                            New Arrivals
                        </Link>
                        <Link href="/about" className="text-gray-700 hover:text-[#8B6B4C] transition-colors">
                            About
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="text-gray-700 hover:text-[#8B6B4C]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                        <button className="text-gray-700 hover:text-[#8B6B4C]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}