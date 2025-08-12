import React from "react";
import Footer from "../components/Footer";

export default function PrivacyPolicy() {
  return (
    <div>
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="h-24"></div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#6C0B14]">Privacy Policy</h1>
          <p className="mt-3 text-gray-700 max-w-3xl mx-auto">
            Your privacy is important to us. Here’s how Sehat Plus collects, uses, and protects
            your information.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid gap-6 md:gap-8 md:grid-cols-2">
          {/* Info We Collect */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Information We Collect</h2>
            <ul className="list-disc ml-5 text-gray-700 space-y-2">
              <li>Personal details (name, contact info, etc.)</li>
              <li>Health and emergency data you provide</li>
              <li>Usage data for improving our services</li>
            </ul>
          </div>

          {/* How We Use */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">How We Use Your Information</h2>
            <ul className="list-disc ml-5 text-gray-700 space-y-2">
              <li>Provide emergency healthcare services</li>
              <li>Improve and personalize your experience</li>
              <li>Communicate important updates</li>
            </ul>
          </div>

          {/* Your Rights */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Rights</h2>
            <ul className="list-disc ml-5 text-gray-700 space-y-2">
              <li>Access, update, or delete your data</li>
              <li>Withdraw consent where applicable</li>
              <li>Contact us for privacy concerns</li>
            </ul>
          </div>

          {/* Data Security */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Security</h2>
            <p className="text-gray-700">
              We use encryption, access controls, and monitoring to protect your information.
              Only authorized personnel can access sensitive data.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-10 bg-[#F8F4EC] border border-[#E9E0D9] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#6C0B14]">Have questions?</h3>
          <p className="text-gray-700 mt-1">
            Reach us at <a href="mailto:support@sehatplus.com" className="underline">support@sehatplus.com</a>.
          </p>
        </div>
      </div>
       
    </div>
    <Footer/>
    </div>
  );
}
