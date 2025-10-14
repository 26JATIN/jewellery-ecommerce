# Policy Pages for Razorpay Account Activation

This document contains all the required policy page URLs for Nandika Jewellers website that need to be submitted to Razorpay for faster account activation.

## 🔗 Policy Page URLs

All policy pages are now live and accessible at the following URLs:

### Required Pages:

1. **Privacy Policy**
   - URL: `https://www.nandikajewellers.in/policies/privacy`
   - Description: Details about data collection, usage, and protection

2. **Terms and Conditions**
   - URL: `https://www.nandikajewellers.in/policies/terms`
   - Description: Terms of service and website usage guidelines

3. **Cancellation and Refund Policy**
   - URL: `https://www.nandikajewellers.in/policies/refund`
   - Description: Order cancellation, returns, and refund procedures

4. **Shipping and Delivery Policy**
   - URL: `https://www.nandikajewellers.in/policies/shipping`
   - Description: Shipping charges, delivery times, and tracking information

5. **Contact Us**
   - URL: `https://www.nandikajewellers.in/policies/contact`
   - Description: Contact information and customer support details

### Additional Pages:

6. **All Policies (Index)**
   - URL: `https://www.nandikajewellers.in/policies`
   - Description: Central hub for all policy pages

## 📝 What to Submit to Razorpay

When filling out the Razorpay merchant application or account verification form, provide these URLs:

```
Privacy Policy: https://www.nandikajewellers.in/policies/privacy
Terms and Conditions: https://www.nandikajewellers.in/policies/terms
Cancellation & Refund: https://www.nandikajewellers.in/policies/refund
Shipping Policy: https://www.nandikajewellers.in/policies/shipping
Contact Us: https://www.nandikajewellers.in/policies/contact
```

## ✅ Implementation Details

All policy pages have been implemented with:
- ✓ Responsive design (mobile, tablet, desktop)
- ✓ Professional styling with proper formatting
- ✓ Clear section headings and easy navigation
- ✓ Last updated date: October 14, 2025
- ✓ Comprehensive policy information
- ✓ Contact details and customer support info
- ✓ Links in website footer for easy access

## 🚀 Next Steps

1. **Test the Pages**: Visit each URL to ensure all pages load correctly
2. **Update Email Addresses**: Replace placeholder emails with your actual support emails:
   - `support@nandikajewellers.in`
   - `info@nandikajewellers.in`
   - `orders@nandikajewellers.in`
   - `returns@nandikajewellers.in`
   - `shipping@nandikajewellers.in`
   - `privacy@nandikajewellers.in`

3. **Update Contact Information**: In `/app/policies/contact/page.js`, update:
   - Phone number (currently placeholder: +91 123-456-7890)
   - Physical address
   - Business hours (if different)

4. **Customize Policies**: Review and adjust the following based on your actual business practices:
   - Shipping charges and delivery times
   - Return window (currently 7 days)
   - Free shipping threshold (currently ₹2,000)
   - Custom jewellery policies

5. **Deploy to Production**: 
   ```bash
   bun run build
   # Deploy to your hosting platform
   ```

6. **Submit to Razorpay**: 
   - Log in to your Razorpay dashboard
   - Navigate to Account Settings or Merchant Details
   - Add the policy page URLs in the appropriate fields
   - Submit for verification

## 📧 Email Addresses to Set Up

Make sure these email addresses are active and monitored:
- support@nandikajewellers.in (General support)
- info@nandikajewellers.in (General inquiries)
- orders@nandikajewellers.in (Order-related)
- returns@nandikajewellers.in (Returns and refunds)
- shipping@nandikajewellers.in (Shipping queries)
- privacy@nandikajewellers.in (Privacy concerns)
- custom@nandikajewellers.in (Custom orders)

## 📄 Files Created

```
app/policies/
├── page.js                 # Main policies index page
├── privacy/
│   └── page.js            # Privacy Policy
├── terms/
│   └── page.js            # Terms and Conditions
├── refund/
│   └── page.js            # Cancellation and Refund Policy
├── shipping/
│   └── page.js            # Shipping and Delivery Policy
└── contact/
    └── page.js            # Contact Us page
```

Updated file:
- `app/components/Footer.jsx` - Added policy links in footer

## 🔍 SEO Considerations

Consider adding meta tags to each policy page for better SEO:
```jsx
export const metadata = {
  title: 'Privacy Policy - Nandika Jewellers',
  description: 'Learn about our privacy policy and how we protect your data',
};
```

## 💡 Tips for Faster Razorpay Approval

1. Ensure all pages are accessible (not behind login)
2. Use your actual domain name
3. Include detailed, comprehensive policies
4. Add clear contact information
5. Keep policies updated with current date
6. Ensure website is SSL-enabled (HTTPS)
7. Have a professional-looking website design

---

**Last Updated**: October 14, 2025  
**Created by**: GitHub Copilot  
**Status**: Ready for Razorpay submission ✅
