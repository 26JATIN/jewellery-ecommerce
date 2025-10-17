# Next.js 15 Dynamic Params Fix

## Issue
In Next.js 15, the `params` object in route handlers must be `await`ed before accessing its properties.

**Error:**
```
Error: Route "/api/cart/[productId]" used `params.productId`. 
`params` should be awaited before using its properties.
```

## Root Cause
Next.js 15 changed the API for dynamic route parameters. Previously they were synchronous, now they're asynchronous Promises.

### Before (Next.js 14):
```javascript
export async function DELETE(req, { params }) {
    const { productId } = params;  // ❌ Sync access
}
```

### After (Next.js 15):
```javascript
export async function DELETE(req, { params }) {
    const { productId } = await params;  // ✅ Await params
}
```

## Files Fixed

### ✅ Completed
1. `/app/api/cart/[productId]/route.js`
   - PATCH method - Line 20
   - DELETE method - Line 70
   
2. `/app/api/categories/[slug]/route.js`
   - GET method - Line 11
   - PUT method - Line 44
   - DELETE method - Line 75

## Files That Need Fixing

### High Priority (Frequently Used)
- [ ] `/app/api/admin/orders/[orderId]/route.js`
- [ ] `/app/api/admin/returns/[returnId]/route.js`
- [ ] `/app/api/admin/returns/[returnId]/pickup/route.js`
- [ ] `/app/api/admin/products/[productId]/route.js`
- [ ] `/app/api/admin/users/[id]/route.js`

### Medium Priority
- [ ] `/app/api/shipping/track/[orderId]/route.js`
- [ ] `/app/api/shipping/track/order/[orderId]/route.js`
- [ ] `/app/api/shipping/track/awb/[awbCode]/route.js`
- [ ] `/app/api/shipping/track/shipment/[id]/route.js`

## Quick Fix Command

Run this command to find all occurrences that need fixing:

```bash
# Find all route files with params destructuring
grep -rn "const { .* } = params;" app/api --include="route.js"
```

## Manual Fix Steps

For each file found:

1. Open the file
2. Find lines with `const { xxx } = params;`
3. Change to `const { xxx } = await params;`
4. Save

### Example:

**Find:**
```javascript
const { orderId } = params;
const { returnId } = params;
const { productId } = params;
const { id } = params;
const { slug } = params;
const { awbCode } = params;
```

**Replace with:**
```javascript
const { orderId } = await params;
const { returnId } = await params;
const { productId } = await params;
const { id } = await params;
const { slug } = await params;
const { awbCode } = await params;
```

## Automated Fix Script

You can use this bash script to fix all files at once:

```bash
#!/bin/bash

# Find and fix all params destructuring in route files
find app/api -name "route.js" -type f | while read file; do
    # Check if file contains params destructuring
    if grep -q "const { .* } = params;" "$file"; then
        echo "Fixing $file"
        # Replace params destructuring with await params
        sed -i 's/const { \(.*\) } = params;/const { \1 } = await params;/g' "$file"
    fi
done

echo "Done! All route files fixed."
```

Save as `fix-params.sh`, make executable, and run:
```bash
chmod +x fix-params.sh
./fix-params.sh
```

## Verification

After fixing, check the terminal for errors. The error should disappear:
```
✅ Before: Error: Route used `params.productId`
✅ After: No error, route works normally
```

## Why This Change?

Next.js 15 made params async to:
1. Enable better streaming and performance
2. Support React Server Components better
3. Align with future React patterns
4. Enable better caching strategies

## Related Documentation
- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/messages/sync-dynamic-apis)
- [Dynamic Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)

## Status
- ✅ Cart API - Fixed
- ✅ Categories API - Fixed  
- ⏳ Admin APIs - Needs fixing
- ⏳ Shipping APIs - Needs fixing

## Impact
- **Severity**: Warning (doesn't break functionality but should be fixed)
- **User Impact**: None (works despite warning)
- **Developer Impact**: Console warnings during development
