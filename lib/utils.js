import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format price in Indian Rupees with proper formatting
 * @param {number} price - The price to format
 * @returns {string} Formatted price string
 */
export function formatPrice(price) {
  if (typeof price !== 'number' || isNaN(price)) return '₹0.00';
  return `₹${price.toLocaleString('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

/**
 * Format price in compact form (e.g., ₹1.5L, ₹50K)
 * @param {number} price - The price to format
 * @returns {string} Compact formatted price string
 */
export function formatPriceCompact(price) {
  if (typeof price !== 'number' || isNaN(price)) return '₹0';
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(1)}L`;
  } else if (price >= 1000) {
    return `₹${(price / 1000).toFixed(1)}K`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
}

/**
 * Format price without decimals for whole numbers
 * @param {number} price - The price to format
 * @returns {string} Formatted price string
 */
export function formatPriceWhole(price) {
  if (typeof price !== 'number' || isNaN(price)) return '₹0';
  return `₹${Math.round(price).toLocaleString('en-IN')}`;
}