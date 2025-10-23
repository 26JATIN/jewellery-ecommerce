# Jewelry Database Seeding Documentation

## Overview
This document explains how to seed your jewelry e-commerce database with realistic data including categories, subcategories, and products with variants.

## 🗃️ What Gets Created

### Categories (6 total)
1. **Rings** - Beautiful collection of rings for all occasions
2. **Necklaces** - Elegant necklaces and chains for every style  
3. **Earrings** - Stunning earrings to complement your look
4. **Bracelets** - Fashionable bracelets and bangles
5. **Pendants** - Beautiful pendants and lockets
6. **Mangalsutras** - Traditional and modern mangalsutras

### Subcategories (23 total)
Each category has 3-4 relevant subcategories:

**Rings:**
- Wedding Rings
- Engagement Rings  
- Fashion Rings
- Couple Rings

**Necklaces:**
- Gold Chains
- Pearl Necklaces
- Diamond Necklaces
- Temple Jewelry

**Earrings:**
- Stud Earrings
- Drop Earrings
- Hoop Earrings  
- Chandbali

**Bracelets:**
- Gold Bracelets
- Silver Bracelets
- Diamond Bracelets
- Bangles

**Pendants:**
- Religious Pendants
- Heart Pendants
- Stone Pendants
- Lockets

**Mangalsutras:**
- Traditional Mangalsutras
- Modern Mangalsutras
- Diamond Mangalsutras

### Products (8 total with variants)

#### 1. Classic Gold Wedding Band
- **Category:** Rings → Wedding Rings
- **Variants:** Size (6, 7, 8, 9, 10)
- **Price Range:** ₹22,500 - ₹24,000
- **Features:** Dynamic pricing, 22K gold, size-based pricing

#### 2. Solitaire Diamond Engagement Ring
- **Category:** Rings → Engagement Rings
- **Variants:** Size (6, 7, 8) × Metal Type (White/Yellow/Rose Gold)
- **Price Range:** ₹174,000 - ₹176,000
- **Features:** 1 carat diamond, VS1 quality, multiple metal options

#### 3. Traditional Gold Chain
- **Category:** Necklaces → Gold Chains
- **Variants:** None (traditional product)
- **Price:** ₹42,000
- **Features:** 22K gold, dynamic pricing, rope design

#### 4. Fresh Water Pearl Necklace
- **Category:** Necklaces → Pearl Necklaces
- **Variants:** Color (White/Cream/Pink/Black) × Length (16"/18"/20")
- **Price Range:** ₹9,500 - ₹13,000
- **Features:** Natural pearls, multiple colors and lengths

#### 5. Diamond Stud Earrings
- **Category:** Earrings → Stud Earrings
- **Variants:** Carat (0.25/0.5/0.75/1.0) × Metal (White/Yellow/Rose Gold)
- **Price Range:** ₹37,000 - ₹97,000
- **Features:** VS2 diamonds, multiple sizes

#### 6. Sterling Silver Bracelet
- **Category:** Bracelets → Silver Bracelets
- **Variants:** None (traditional product)
- **Price:** ₹3,200
- **Features:** Pure silver, dynamic pricing

#### 7. Om Pendant
- **Category:** Pendants → Religious Pendants
- **Variants:** Material (Gold/Silver) × Size (Small/Medium/Large)
- **Price Range:** ₹2,800 - ₹9,300
- **Features:** Religious symbol, multiple materials and sizes

#### 8. Classic Black Bead Mangalsutra
- **Category:** Mangalsutras → Traditional Mangalsutras
- **Variants:** None (traditional product)
- **Price:** ₹32,000
- **Features:** 22K gold, traditional design, dynamic pricing

## 🚀 How to Run

### Option 1: Quick Run
```bash
npm run seed-jewelry
```

### Option 2: With Logging
```bash
npm run seed-all
```

### Option 3: Direct Execution
```bash
node scripts/seedJewelryData.js
```

## 📋 Prerequisites

1. **MongoDB Connection**: Ensure your MongoDB is running and accessible
2. **Environment Variables**: Make sure your `.env.local` contains:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```
3. **Dependencies**: All required packages should be installed via `npm install`

## ⚠️ Important Notes

### Data Clearing
⚠️ **WARNING**: The script will clear all existing data from:
- Products collection
- Subcategories collection  
- Categories collection

### Backup Recommendation
Before running the script, consider backing up your existing data:
```bash
mongodump --uri="your_mongodb_uri" --out=./backup
```

### Environment
- The script works with both development and production environments
- It automatically detects the environment from your `.env.local` file

## 🎯 Variant System Features

### Automatic SKU Generation
- Categories: `RI` (Rings), `NE` (Necklaces), etc.
- Format: `{CategoryCode}{SubcategoryCode}{ProductNumber}-V{VariantNumber}`
- Example: `RIWE001-V01` (Ring → Wedding Ring → Product 1 → Variant 1)

### Intelligent Stock Assignment
- Variants get random stock between 5-20 units
- Non-variant products get fixed stock amounts
- Realistic inventory distribution

### Price Calculations
- Base prices from product data
- Variant adjustments applied automatically
- Cost prices calculated proportionally

### Option Types Supported
1. **Size**: Ring sizes, necklace lengths
2. **Color**: Pearl colors, metal colors with hex codes
3. **Select**: General dropdowns for materials, carat weights

## 📊 Expected Output

After successful seeding, you should see:
```
🎉 Database seeding completed successfully!
📊 Summary:
   Categories: 6
   Subcategories: 23
   Products: 8
   Total Variants: 47
```

## 🔧 Customization

### Adding More Products
Edit `scripts/seedJewelryData.js` and add new entries to the `productsData` array.

### Modifying Variants
Update the `variantOptions` section in any product to change:
- Option types (size, color, select)
- Available values
- Price adjustments
- Availability

### Changing Categories
Modify the `categoriesData` and `subcategoriesData` arrays to add/remove categories.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your `MONGODB_URI` in `.env.local`
   - Ensure MongoDB service is running

2. **Duplicate Key Errors**
   - The script clears existing data, but if it fails midway, manually clear collections
   - Run: `db.products.deleteMany({})` in MongoDB shell

3. **Module Import Errors**
   - Ensure your project uses `"type": "module"` in `package.json`
   - Check that all import paths are correct

### Debug Mode
Add logging to see detailed variant generation:
```javascript
console.log('Generated variant:', variant);
```

## 🎨 Styling Integration

The seeded data works perfectly with your existing:
- ✅ Variant selector components
- ✅ Admin product management
- ✅ Cart system with variants
- ✅ Order processing
- ✅ Dynamic pricing system
- ✅ Image management

## 🔄 Next Steps

After seeding:
1. Start your development server: `npm run dev`
2. Check admin panel for product management
3. Browse frontend to see variant selectors
4. Test cart functionality with different variants
5. Verify order processing with variant tracking