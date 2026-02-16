export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#0A0A0A] shadow-lg dark:shadow-none dark:border dark:border-white/[0.06] rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Last Updated: October 14, 2025</p>

        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">1. Information We Collect</h2>
            <p className="mb-2">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Name, email address, phone number, and shipping address</li>
              <li>Payment information (processed securely through Razorpay)</li>
              <li>Order history and preferences</li>
              <li>Communication preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">2. How We Use Your Information</h2>
            <p className="mb-2">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your orders</li>
              <li>Send you promotional materials (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Detect and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">3. Information Sharing</h2>
            <p>
              We do not sell or rent your personal information to third parties. We may share your 
              information with trusted service providers who assist us in operating our website, 
              conducting our business, or servicing you, including:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Payment processors (Razorpay)</li>
              <li>Shipping partners</li>
              <li>Email service providers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. 
              All payment transactions are encrypted and processed through secure payment gateways.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">5. Cookies</h2>
            <p>
              We use cookies to enhance your browsing experience, analyze site traffic, and 
              personalize content. You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">6. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2">
              Email: <a href="mailto:privacy@nandikajewellers.in" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@nandikajewellers.in</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
