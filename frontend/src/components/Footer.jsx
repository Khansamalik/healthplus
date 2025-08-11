import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#F8F9FA] text-black pt-12 pb-6 px-6 md:px-16 lg:px-24 xl:px-32 font-[Poppins]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-gray-300 pb-8">

        {/* Logo and About */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <img src="/logo.png" alt="SehatPlus Logo" className="h-10 w-auto" />
            <span className="text-lg font-semibold tracking-wide">SehatPlus</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            SehatPlus simplifies emergency healthcare access by connecting patients with hospitals and smart services—anytime, anywhere.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-10 md:justify-center">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li><a href="/" className="hover:underline">Home</a></li>
              <li><a href="/about" className="hover:underline">About Us</a></li>
              <li><a href="/contact" className="hover:underline">Contact</a></li>
              <li><a href="/privacy" className="hover:underline">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Stay Connected</h3>
          <p className="text-sm text-gray-700 mb-3">
            Get updates and insights right to your inbox.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#7B1E22]"
            />
            <button className="bg-[#7B1E22] text-white text-sm px-4 py-2 rounded hover:bg-[#5f1316] transition">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Note */}
      <div className="mt-6 text-center text-xs text-gray-600">
        &copy; {new Date().getFullYear()} SehatPlus. All rights reserved.
      </div>
    </footer>
  );
}
