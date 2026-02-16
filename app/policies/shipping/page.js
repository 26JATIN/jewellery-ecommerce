export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#0A0A0A] shadow-lg dark:shadow-none dark:border dark:border-white/[0.06] rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Shipping and Delivery Policy</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Last Updated: October 14, 2025</p>

        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">1. Shipping Coverage</h2>
            <p>
              We currently ship across India. International shipping is not available at this time. 
              We use trusted courier partners including Shiprocket, Blue Dart, Delhivery, and India Post.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">2. Processing Time</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Ready-to-Ship Items:</strong> Orders are processed within 1-2 business days</li>
              <li><strong>Custom/Made-to-Order Items:</strong> Processing may take 7-15 business days</li>
              <li>Orders placed on weekends or holidays will be processed on the next business day</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">3. Delivery Time</h2>
            <p className="mb-3">
              Delivery times vary based on your location and product availability:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Metro Cities:</strong> 3-5 business days</li>
              <li><strong>Other Cities:</strong> 5-7 business days</li>
              <li><strong>Remote Areas:</strong> 7-10 business days</li>
            </ul>
            <p className="mt-3 text-sm italic">
              *Delivery times are estimates and may vary during peak seasons, festivals, or due to unforeseen circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">4. Shipping Charges</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Free Shipping:</strong> On orders above ₹2,000</li>
              <li><strong>Standard Shipping:</strong> ₹100 for orders below ₹2,000</li>
              <li><strong>Express Shipping:</strong> ₹250 (1-3 days delivery to select locations)</li>
            </ul>
            <p className="mt-3">
              Shipping charges are calculated at checkout based on your location and order value.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">5. Order Tracking</h2>
            <p>
              Once your order is shipped, you will receive a confirmation email with a tracking number. 
              You can track your shipment using:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>The tracking link provided in the shipping confirmation email</li>
              <li>Your account dashboard on our website</li>
              <li>Courier partner&apos;s website using the tracking number</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">6. Packaging</h2>
            <p>
              All jewellery items are carefully packaged in:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Premium jewellery boxes or pouches</li>
              <li>Secure tamper-proof packaging</li>
              <li>Bubble wrap and protective materials</li>
              <li>Branded boxes for gift-worthy presentation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">7. Delivery Requirements</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>A signature is required upon delivery for security purposes</li>
              <li>Please ensure someone is available to receive the package</li>
              <li>Valid photo ID may be required for high-value orders</li>
              <li>If nobody is available, the courier will attempt redelivery or leave a notification</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">8. Failed Delivery Attempts</h2>
            <p>
              If the courier is unable to deliver your package after multiple attempts:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>You will be notified via email and SMS</li>
              <li>The package may be held at the local courier office for pickup</li>
              <li>After 7 days, unclaimed packages will be returned to us</li>
              <li>Return shipping charges may be deducted from refunds for unclaimed packages</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">9. Address Changes</h2>
            <p>
              Once an order is placed, shipping addresses cannot be changed. Please ensure your 
              address is correct before completing your purchase. If you need to change the address, 
              you must cancel the order and place a new one.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">10. Lost or Damaged Shipments</h2>
            <p>
              In the rare event that your package is lost or damaged during transit:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Contact us within 48 hours of delivery for damaged items</li>
              <li>Provide photographic evidence of damage</li>
              <li>We will file a claim with the courier and arrange for replacement or refund</li>
              <li>All shipments are insured for your protection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">11. Customs and Duties</h2>
            <p>
              For domestic shipments within India, there are no additional customs or import duties. 
              All applicable taxes are included in the product price.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">12. Contact for Shipping Queries</h2>
            <p>
              For any shipping-related questions or issues, please contact:
            </p>
            <div className="mt-2">
              <p>Email: <a href="mailto:shipping@nandikajewellers.in" className="text-blue-600 dark:text-blue-400 hover:underline">shipping@nandikajewellers.in</a></p>
              <p className="mt-1">Email: <a href="mailto:support@nandikajewellers.in" className="text-blue-600 dark:text-blue-400 hover:underline">support@nandikajewellers.in</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
