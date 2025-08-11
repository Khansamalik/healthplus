import { Mail, Phone, MapPin } from "lucide-react";
import React, { useState } from "react";
import Footer from "../components/Footer";
export default function ContactUs() {
  const [toast, setToast] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <div>
    <div className="bg-gray-100 font-[Poppins]">

    <div className="h-24"></div>
      {/* Top Banner */}
      <div className="bg-[#1f1f1f] py-25 text-center text-white text-4xl font-bold">
        Contact Us
      </div>

      {/*  Contact Info Icons */}
      <section className="bg-white py-16 px-6 w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <ContactCard icon={<MapPin className="w-7 h-7 text-[#6C0B14]" />} title="Address" text="SINES, NUST H-12 Campus, Islamabad" />
          <ContactCard icon={<Phone className="w-7 h-7 text-[#6C0B14]" />} title="Phone" text="+92 3185341340" />
          <ContactCard icon={<Mail className="w-7 h-7 text-[#6C0B14]" />} title="Email Us" text="support@sehatplus.com" />
        </div>
      </section>

      {/* Help Message */}
      <section className="bg-gray-100 py-16 px-6 text-center flex items-center justify-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-[#6C0B14]">We’re Here to Help!</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-base leading-relaxed">
            Have a question or need assistance? Get in touch using the form below — our team is always ready to help you with anything related to your healthcare needs.
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-white pt-8 pb-24 px-4 flex justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full md:w-[600px] bg-white/60 backdrop-blur-md border border-white/40 shadow-xl rounded-xl p-8 text-[#333]"
        >
          <h2 className="text-2xl font-semibold mb-6 text-center text-[#660000]">Get in Touch</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Name"
              className="p-3 rounded-lg bg-white/80 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#660000]"
            />
            <input
              type="email"
              placeholder="Email"
              className="p-3 rounded-lg bg-white/80 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#660000]"
            />
            <input
              type="tel"
              placeholder="Phone"
              className="p-3 rounded-lg bg-white/80 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#660000]"
            />
            <input
              type="text"
              placeholder="Subject"
              className="p-3 rounded-lg bg-white/80 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#660000]"
            />
          </div>

          <textarea
            rows="5"
            placeholder="Your Message"
            className="mt-6 w-full p-4 rounded-lg bg-white/80 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#660000]"
          ></textarea>

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="bg-gradient-to-r from-[#660000] to-[#8a0000] text-white font-semibold px-8 py-2 rounded-full hover:scale-105 transition-all duration-300 shadow-md"
            >
              Submit Now!
            </button>
          </div>

          {toast && (
            <div className="mt-6 text-center bg-green-100 text-green-700 py-2 px-4 rounded shadow-sm">
              Message sent successfully!
            </div>
          )}
        </form>
      </section>
    </div>
     <Footer />
    </div>
  );
}

function ContactCard({ icon, title, text }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="mb-2">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-600 text-sm">{text}</p>
    </div>
  );
}
