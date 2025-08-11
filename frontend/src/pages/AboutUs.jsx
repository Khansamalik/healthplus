import React from "react";
import Footer from "../components/Footer";
export default function AboutUs() {
  return (
    <div>
    <div className="bg-gray-100 font-poppins">
      {/* Top Banner */}
      <div className="h-24"></div>
      <div className="bg-[#1f1f1f] py-25 text-center text-white text-4xl font-bold">
        About Us
      </div>

      {/* Intro Section */}
      <section className="bg-white py-20 px-6 w-full">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-1/2">
            <img
              src="/AboutUs.svg"
              alt="About Sehat Plus"
              className="w-full h-auto object-contain"
            />
          </div>
          <div className="w-full lg:w-1/2">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">ABOUT US</h3>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#6C0B14] mb-6">
              Sehat Plus is a smart emergency healthcare platform
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We connect patients, hospitals, ambulances, and labs in real-time. Built for critical
              moments, Sehat Plus ensures that medical help reaches you even when you can’t ask for it.
            </p>
            <ul className="list-disc list-inside text-gray-500 text-base space-y-1">
              <li>AI-based triage system</li>
              <li>ICE (In Case of Emergency) tools</li>
              <li>Offline fallback support</li>
              <li>Emergency alert system</li>
              <li>Digital health record integration</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-gray-100 py-20 px-6">
        <h2 className="text-3xl lg:text-4xl font-bold text-center text-[#6C0B14] mb-12">
          Mission and Vision
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto text-center">
          <Card
            title="Vision"
            text="To revolutionize emergency healthcare in Pakistan through AI and real-time access."
          />
          <Card
            title="Mission"
            text="To provide fast, smart, and accessible emergency care through one unified platform."
          />
          <Card
            title="Values"
            text="Compassion, Innovation, Speed, Data Security, Patient-first mindset."
          />
        </div>
      </section>

      {/* Challenges We Help Solve */}
      <section className="bg-white py-20 px-6">
        <h2 className="text-3xl lg:text-4xl font-bold text-center text-[#6C0B14] mb-12">
          Challenges We Help to Solve
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto text-center">
          <Card
            title="Coordination Gaps"
            text="We fix delayed communication between patients, hospitals, and ambulances."
          />
          <Card
            title="Medical Data Access"
            text="We ensure critical medical history is accessible in real-time and offline."
          />
          <Card
            title="Time Wastage"
            text="We eliminate waiting lines through virtual OPD and smart triage suggestions."
          />
        </div>
      </section>
    </div>
     <Footer />
    </div>
  );
}

// Card Component
function Card({ title, text }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-start">
      <h3 className="text-2xl font-semibold text-gray-800 mb-3">{title}</h3>
      <p className="text-base text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}
