import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price, currencyCode = 'INR') {
  const currencySymbols = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'AUD': 'A$',
    'CAD': 'C$',
    'JPY': '¥'
  };
  
  const symbol = currencySymbols[currencyCode] || '₹';
  
  return `${symbol}${price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}
