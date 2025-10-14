import Link from 'next/link';

export default function PoliciesIndex() {
  const policies = [
    {
      title: 'Privacy Policy',
      description: 'Learn how we collect, use, and protect your personal information.',
      icon: '🔒',
      href: '/policies/privacy',
    },
    {
      title: 'Terms and Conditions',
      description: 'Read our terms of service and usage guidelines for our website.',
      icon: '📜',
      href: '/policies/terms',
    },
    {
      title: 'Cancellation & Refund Policy',
      description: 'Understand our cancellation, return, and refund procedures.',
      icon: '↩️',
      href: '/policies/refund',
    },
    {
      title: 'Shipping & Delivery',
      description: 'Information about shipping charges, delivery times, and tracking.',
      icon: '📦',
      href: '/policies/shipping',
    },
    {
      title: 'Contact Us',
      description: 'Get in touch with our customer support team.',
      icon: '📞',
      href: '/policies/contact',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Policies & Information</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about shopping with Nandika Jewellers, 
            from privacy to shipping and returns.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((policy) => (
            <Link
              key={policy.href}
              href={policy.href}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 group"
            >
              <div className="text-4xl mb-4">{policy.icon}</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {policy.title}
              </h2>
              <p className="text-gray-600">{policy.description}</p>
              <div className="mt-4 text-blue-600 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center">
                Read More
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Links Section */}
        <div className="mt-16 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Links</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Customer Service</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="mailto:support@nandikajewellers.in" className="hover:text-blue-600">
                    Email: support@nandikajewellers.in
                  </a>
                </li>
                <li>
                  <a href="tel:+911234567890" className="hover:text-blue-600">
                    Phone: +91 123-456-7890
                  </a>
                </li>
                <li className="text-sm text-gray-500">
                  Monday - Saturday: 10:00 AM - 7:00 PM IST
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Important Information</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/policies/refund" className="text-gray-600 hover:text-blue-600">
                    Returns within 7 days
                  </Link>
                </li>
                <li>
                  <Link href="/policies/shipping" className="text-gray-600 hover:text-blue-600">
                    Free shipping on orders above ₹2,000
                  </Link>
                </li>
                <li>
                  <Link href="/policies/privacy" className="text-gray-600 hover:text-blue-600">
                    Your data is secure with us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
