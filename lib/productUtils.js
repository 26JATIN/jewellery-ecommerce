// Utility functions for product stock and variant handling

/**
 * Check if a product is out of stock (considering variants)
 * @param {Object} product - The product object
 * @returns {boolean} - True if product is out of stock
 */
export const isProductOutOfStock = (product) => {
    if (product.hasVariants) {
        // For variant products, check totalStock or calculate from variants
        if (product.totalStock !== undefined) {
            return product.totalStock <= 0;
        }
        if (product.variants && product.variants.length > 0) {
            return !product.variants.some(v => v.isActive && v.stock > 0);
        }
        return !product.stock || product.stock <= 0;
    } else {
        // For regular products, check stock directly
        return !product.stock || product.stock <= 0;
    }
};

/**
 * Get the effective stock count for a product (considering variants)
 * @param {Object} product - The product object
 * @returns {number} - The total available stock
 */
export const getEffectiveStock = (product) => {
    if (product.hasVariants) {
        if (product.totalStock !== undefined) {
            return product.totalStock;
        }
        if (product.variants && product.variants.length > 0) {
            return product.variants.reduce((total, v) => 
                total + (v.isActive && v.stock ? v.stock : 0), 0);
        }
        return product.stock || 0;
    } else {
        return product.stock || 0;
    }
};

/**
 * Check if a product has low stock (5 or less items)
 * @param {Object} product - The product object
 * @returns {boolean} - True if product has low stock
 */
export const hasLowStock = (product) => {
    const stock = getEffectiveStock(product);
    return stock > 0 && stock <= 5;
};

/**
 * Get appropriate button text for add to cart based on product type
 * @param {Object} product - The product object
 * @param {string} defaultText - Default text for regular products
 * @param {string} variantText - Text for variant products
 * @param {string} unavailableText - Text for out of stock products
 * @returns {string} - Appropriate button text
 */
export const getAddToCartButtonText = (product, defaultText = 'Add to Cart', variantText = 'Select Options', unavailableText = 'Unavailable') => {
    if (isProductOutOfStock(product)) {
        return unavailableText;
    }
    return product.hasVariants ? variantText : defaultText;
};