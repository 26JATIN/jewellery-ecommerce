# Nandika Jewellers - E-commerce Platform

A Bond of trust & Quality - Premium jewelry e-commerce platform built with Next.js.

## Features

### 🛒 Complete E-commerce System
- Product catalog with variants and pricing
- Shopping cart with real-time updates
- Image galleries and product showcases
- Category and collection management

### 📦 Advanced Order Management
- Complete checkout system with saved addresses
- COD and Online payment options
- Automatic Shiprocket integration
- **Auto-select cheapest courier partner**
- Real-time order tracking
- Webhook-based status updates
- Admin order management dashboard
- **Returns & Refunds system**
- **Automatic COD payment marking on delivery**

### 🔄 Returns & Refunds
- Customer return requests for delivered orders
- Bank details collection for refunds
- Shiprocket return shipment integration
- Admin returns management panel
- Manual refund processing workflow
- Automatic status updates via webhooks
- Green status indicator for completed refunds

### 💳 Payment Integration
- Cash on Delivery (COD)
- Online Payments (Razorpay ready)
- Secure payment processing
- Payment status tracking

### 🚚 Shipping Integration
- Full Shiprocket API integration
- Automatic courier selection based on lowest price
- AWB (Airway Bill) generation
- Real-time tracking updates
- Multi-courier support

### 👤 User Management
- JWT-based authentication
- Saved shipping addresses
- Order history
- Profile management

### 🔧 Admin Panel
- Product management
- Category management
- Order management
- **Returns management**
- User management
- Gold price updates
- Gallery management
- Coupon management

## Documentation

- **[ORDER_SYSTEM.md](./ORDER_SYSTEM.md)** - Complete order & checkout system guide
- **[COURIER_SELECTION.md](./COURIER_SELECTION.md)** - Automatic courier selection documentation

## Quick Start

### 1. Installation

```bash
npm install
# or
yarn install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```env
# Required
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret

# Shiprocket (for shipping)
SHIPROCKET_EMAIL=your-shiprocket-email
SHIPROCKET_PASSWORD=your-shiprocket-password
SHIPROCKET_PICKUP_LOCATION=Primary
SHIPROCKET_CHANNEL_ID=your-channel-id
SHIPROCKET_PICKUP_PINCODE=110001

# Razorpay (for online payments)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Configure Shiprocket Webhook

In your Shiprocket dashboard, set webhook URL:

```
https://your-domain.com/api/webhooks/shiprocket
```

## Tech Stack

- **Framework**: Next.js 15.5.4
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (Custom implementation)
- **Payments**: Razorpay
- **Shipping**: Shiprocket API
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Image Management**: Cloudinary

## Key Features Explained

### Automatic Courier Selection

When an order is placed, the system:
1. Creates order in Shiprocket
2. Checks all available couriers for delivery pincode
3. Compares pricing (including COD charges)
4. **Automatically selects the cheapest courier**
5. Generates AWB with selected courier
6. Updates order with tracking details

See [COURIER_SELECTION.md](./COURIER_SELECTION.md) for details.

### Saved Addresses

- Customers' shipping addresses are automatically saved
- First-time entry, then select from dropdown
- Support for multiple addresses
- Default address functionality

### Real-time Order Tracking

- Webhook integration with Shiprocket
- Automatic status updates
- Tracking URLs provided
- Email/SMS notifications (coming soon)

## API Endpoints

### Customer APIs
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/addresses` - Get saved addresses
- `POST /api/addresses` - Add new address

### Admin APIs
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders?id=...` - Update order
- `POST /api/admin/products` - Create product
- `GET /api/admin/users` - Get users

### Webhooks
- `POST /api/webhooks/shiprocket` - Shiprocket updates

## Project Structure

```
app/
  ├── checkout/          # Checkout page
  ├── orders/            # Customer order history
  ├── admin/             # Admin dashboard
  │   ├── orders/        # Order management
  │   ├── products/      # Product management
  │   └── ...
  └── api/               # API routes
      ├── orders/        # Order APIs
      ├── addresses/     # Address APIs
      ├── webhooks/      # Webhook handlers
      └── ...

lib/
  ├── shiprocket.js      # Shiprocket integration
  ├── auth.js            # Authentication
  ├── mongodb.js         # Database connection
  └── ...

models/
  ├── Order.js           # Order schema
  ├── User.js            # User schema
  ├── Product.js         # Product schema
  └── ...
```

## Development

### Adding New Features

1. Review existing documentation
2. Follow established patterns
3. Update relevant docs
4. Test thoroughly

### Testing Order Flow

1. Login/Register
2. Add items to cart
3. Go to checkout
4. Enter shipping address
5. Select payment method
6. Place order
7. Check "My Orders"
8. Verify in admin panel

## Deployment

### Vercel Deployment

```bash
vercel deploy
```

### Environment Variables

Ensure all required environment variables are set in your deployment platform.

### Webhook Configuration

Update Shiprocket webhook URL to production URL after deployment.

## Support

For issues or questions:
- Review [ORDER_SYSTEM.md](./ORDER_SYSTEM.md)
- Check [COURIER_SELECTION.md](./COURIER_SELECTION.md)
- Review API documentation above

## License

Private - All rights reserved

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

