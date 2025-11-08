# Environment Variables Quick Reference

## Essential Variables

### Database
```env
MONGODB_URI=mongodb://localhost:27017/jewellery-ecommerce
```
Your MongoDB connection string.

### Authentication
```env
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
```
Secret key for JWT token signing. Must be at least 32 characters.

## Shiprocket Configuration

### API Credentials
```env
SHIPROCKET_EMAIL=your-shiprocket-email@example.com
SHIPROCKET_PASSWORD=your-shiprocket-password
```
Your Shiprocket account credentials.

### Shiprocket Settings
```env
SHIPROCKET_PICKUP_LOCATION=Primary
```
Pickup location name from Shiprocket Dashboard → Settings → Pickup Locations.

```env
SHIPROCKET_CHANNEL_ID=your-channel-id
```
Channel ID from Shiprocket Dashboard → Settings → Channel.

```env
SHIPROCKET_PICKUP_PINCODE=110001
```
Postal code of your warehouse/store (used for courier selection).

## Payment Gateway

### Razorpay
```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```
Razorpay credentials for online payments (test or live).

## Image Upload

### Cloudinary
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```
Cloudinary configuration for product image uploads.

## AI Services

### Gemini AI
```env
GEMINI_API_KEY=your-gemini-api-key
```
Google Gemini AI API key (for price scraping).

## Application

### Base URL
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```
Your application URL (production URL when deployed).

## Security

### Cron Job Protection
```env
CRON_SECRET=your-cron-secret-key
```
Secret key to protect cron job endpoints.

### Refund System
```env
AUTO_REFUND_ENABLED=true
```
Enable/disable automatic refunds.

---

## Priority by Feature

### Minimum to Run App
```env
MONGODB_URI=...
JWT_SECRET=...
```

### For Order System
```env
MONGODB_URI=...
JWT_SECRET=...
SHIPROCKET_EMAIL=...
SHIPROCKET_PASSWORD=...
SHIPROCKET_PICKUP_LOCATION=...
SHIPROCKET_CHANNEL_ID=...
SHIPROCKET_PICKUP_PINCODE=...
```

### For Online Payments
Add Razorpay credentials to above.

### For Image Uploads
Add Cloudinary credentials to above.

---

## How to Get Values

### Shiprocket
1. Sign up at https://www.shiprocket.in/
2. **Email/Password**: Your login credentials
3. **Pickup Location**: Dashboard → Settings → Pickup Locations → Add location → Note the name
4. **Channel ID**: Dashboard → Settings → Channel → View your channel ID
5. **Pickup Pincode**: Your warehouse/store postal code

### Razorpay
1. Sign up at https://razorpay.com/
2. Dashboard → Account & Settings → API Keys
3. Generate test/live keys
4. **Key ID**: Starts with `rzp_test_` or `rzp_live_`
5. **Key Secret**: Secret key (keep secure)

### Cloudinary
1. Sign up at https://cloudinary.com/
2. Dashboard shows **Cloud Name**
3. Settings → Upload → Upload Presets → Create preset
4. Settings → Access Keys → API Key & Secret

### MongoDB
1. Local: `mongodb://localhost:27017/jewellery-ecommerce`
2. MongoDB Atlas: Create cluster → Connect → Get connection string

---

## Security Best Practices

1. **Never commit `.env` file to git**
2. Use different values for development/production
3. Keep secrets secure and rotate regularly
4. Use strong JWT_SECRET (32+ characters)
5. Use test credentials during development
6. Enable 2FA on all service accounts

---

## Validation

Check if all required variables are set:

```bash
node -e "console.log(process.env.MONGODB_URI ? '✅ MongoDB' : '❌ MongoDB missing')"
node -e "console.log(process.env.JWT_SECRET ? '✅ JWT' : '❌ JWT missing')"
node -e "console.log(process.env.SHIPROCKET_EMAIL ? '✅ Shiprocket' : '❌ Shiprocket missing')"
```

---

**Last Updated**: January 28, 2025
