export default function ContactUs() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-[#0A0A0A] shadow-lg dark:shadow-none dark:border dark:border-white/[0.06] rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Contact Us</h1>
          <p className="text-gray-700 mb-8">
            We&apos;d love to hear from you! Whether you have a question about our products, pricing, 
            or anything else, our team is ready to answer all your questions.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Get In Touch</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email</h3>
                      <p className="text-gray-600">General Inquiries:</p>
                      <a href="mailto:info@nandikajewellers.in" className="text-blue-600 dark:text-blue-400 hover:underline">
                        info@nandikajewellers.in
                      </a>
                      <p className="text-gray-600 mt-2">Customer Support:</p>
                      <a href="mailto:support@nandikajewellers.in" className="text-blue-600 dark:text-blue-400 hover:underline">
                        support@nandikajewellers.in
                      </a>
                      <p className="text-gray-600 mt-2">Orders & Shipping:</p>
                      <a href="mailto:orders@nandikajewellers.in" className="text-blue-600 dark:text-blue-400 hover:underline">
                        orders@nandikajewellers.in
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-gray-900">Phone</h3>
                      <p className="text-gray-600">Customer Care:</p>
                      <a href="tel:+911234567890" className="text-blue-600 dark:text-blue-400 hover:underline">
                        +91 123-456-7890
                      </a>
                      <p className="text-gray-600 text-sm mt-1">
                        Monday - Saturday: 10:00 AM - 7:00 PM IST
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-gray-900">Address</h3>
                      <p className="text-gray-600">
                        Nandika Jewellers<br />
                        [Your Street Address]<br />
                        [City, State - PIN Code]<br />
                        India
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Hours</h2>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p><span className="font-semibold">Monday - Friday:</span> 10:00 AM - 7:00 PM</p>
                  <p><span className="font-semibold">Saturday:</span> 10:00 AM - 6:00 PM</p>
                  <p><span className="font-semibold">Sunday:</span> Closed</p>
                  <p className="text-sm text-gray-600 mt-2">
                    *We are closed on public holidays
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Send Us a Message</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a subject</option>
                    <option value="product">Product Inquiry</option>
                    <option value="order">Order Status</option>
                    <option value="shipping">Shipping & Delivery</option>
                    <option value="return">Returns & Refunds</option>
                    <option value="custom">Custom Orders</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition duration-200 font-semibold"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-[#0A0A0A] shadow-lg dark:shadow-none dark:border dark:border-white/[0.06] rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">How can I track my order?</h3>
              <p className="text-gray-600 mt-1">
                You can track your order using the tracking link sent to your email or through your account dashboard.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">What is your return policy?</h3>
              <p className="text-gray-600 mt-1">
                We accept returns within 7 days of delivery. Please see our <a href="/policies/refund" className="text-blue-600 dark:text-blue-400 hover:underline">Refund Policy</a> for details.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Do you offer custom jewellery design?</h3>
              <p className="text-gray-600 mt-1">
                Yes! Contact us at <a href="mailto:custom@nandikajewellers.in" className="text-blue-600 dark:text-blue-400 hover:underline">custom@nandikajewellers.in</a> to discuss your custom design requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
