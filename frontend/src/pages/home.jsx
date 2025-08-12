import { motion } from "framer-motion";
import { PiHospitalLight, PiFirstAidKitLight } from "react-icons/pi";
import { TbEmergencyBed } from "react-icons/tb";
import { BsQrCode } from "react-icons/bs";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function HealthcareWebsite() {
  return (
  <div>
    <div className="min-h-screen bg-gray-100 font-poppins">
      <div className="h-24"></div>
      {/*banner Section */}
      <section className="w-full bg-[#F8F4EC] py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-[#6C0B14] mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Sehat ka raabta, 
              <br />
              har waqt aap ke saath.
            </motion.h1>

            <motion.p
              className="text-lg text-gray-700 mb-8 max-w-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Seamless smart care built for critical emergencies and day-to-day well-being.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link
                to="/register"
                className="inline-block bg-[#6C0B14] text-white hover:bg-[#8a0f1a] font-medium py-3 px-8 rounded-full text-lg transition-all duration-300"
              >
                Sign Up Now
              </Link>
            </motion.div>
          </div>

          <div className="flex justify-center">
            <motion.img
              src="/Ambulance.png"
              alt="Healthcare Banner"
              className="rounded-xl w-full max-w-md object-cover shadow-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-center text-3xl font-bold text-[#6C0B14] mb-4">Our Healthcare Solutions</h1>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
            Discover comprehensive emergency healthcare features
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Alert Feature */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <img src="/alert.png" alt="Alert Feature" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#6C0B14] mb-2">Emergency Alert</h3>
                <p className="text-gray-600 mb-4">Quickly notify contacts and hospitals during emergencies</p>
                <div className="bg-blue-50 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full w-fit">
                  BASIC FEATURE
                </div>
              </div>
            </div>
            
            {/* Contacts Feature */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <img src="/contact.png" alt="Contacts Feature" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#6C0B14] mb-2">Emergency Contacts</h3>
                <p className="text-gray-600 mb-4">Instant access to saved emergency contacts</p>
                <div className="bg-purple-50 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full w-fit">
                  PREMIUM FEATURE
                </div>
              </div>
            </div>
            
            {/* Records Feature */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <img src="/records.png" alt="Records Feature" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#6C0B14] mb-2">Medical Records</h3>
                <p className="text-gray-600 mb-4">Secure digital storage for health records</p>
                <div className="bg-purple-50 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full w-fit">
                  PREMIUM FEATURE
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-[#F5F5F5] py-16 px-4">
        <h2 className="text-3xl font-bold text-center text-[#6C0B14] mb-4">Our Services</h2>
        <p className="text-center text-gray-600 max-w-xl mx-auto mb-12">
          Comprehensive emergency healthcare solutions
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Service 1 */}
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <TbEmergencyBed size={40} className="text-[#6C0B14] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Emergency Connect</h3>
            <p className="text-gray-600">Direct ambulance and hospital connection</p>
          </div>
          
          {/* Service 2 */}
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <PiHospitalLight size={40} className="text-[#6C0B14] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Hospital Directory</h3>
            <p className="text-gray-600">Real-time bed and doctor availability</p>
          </div>
          
          {/* Service 3 */}
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <BsQrCode size={40} className="text-[#6C0B14] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Health ID</h3>
            <p className="text-gray-600">QR-based medical information access</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="w-full bg-[#F1ECE9] py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#6C0B14] mb-4">Why Choose Us?</h2>
            <h3 className="text-2xl font-semibold text-gray-800">
              Transforming emergency healthcare delivery
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gray-600 mb-8">
                Sehat Plus bridges the gap between patients, ambulances, and hospitals with real-time coordination and smart technology.
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-[#6C0B14] rounded-full p-2 mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800">AI-Powered Emergency Response</h4>
                    <p className="text-gray-600">Smart triage and routing for critical situations</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-[#6C0B14] rounded-full p-2 mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800">Comprehensive Hospital Network</h4>
                    <p className="text-gray-600">Direct access to 500+ partner hospitals</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-[#6C0B14] rounded-full p-2 mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800">Secure Health Identity</h4>
                    <p className="text-gray-600">Encrypted medical records with instant access</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <img
                src="/WhyUs.svg"
                alt="Healthcare Network"
                className="w-full max-w-md object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-[#6C0B14] text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8">
            Join thousands who trust Sehat Plus for their emergency healthcare needs
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-[#6C0B14] hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-lg transition-all duration-300"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
     <Footer />
    </div>
  );
}