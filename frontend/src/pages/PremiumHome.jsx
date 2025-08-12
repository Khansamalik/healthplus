import React, { useState, useRef } from 'react'; 
import Footer from '../components/Footer';
import PricingModal from '../components/PricingModal';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from "react-router-dom";

import { 
  FaBell, 
  FaFileMedical, 
  FaQrcode, 
  FaPhoneAlt, 
  FaAmbulance,
  FaCreditCard,
  FaMobileAlt,
  FaHospital,
  FaCheckCircle
} from "react-icons/fa";
import { 
  MdLocalPharmacy, 
  MdHealthAndSafety,
  MdAccountBalance 
} from "react-icons/md";
import { SiEasyeda } from "react-icons/si";

export default function PremiumPatient() {
  const { isPremium, premiumPlan, upgradeToPremium, downgradeToBasic } = useAuth();
  const navigate = useNavigate();
  const pricingRef = useRef(null); 
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [initialPlanForModal, setInitialPlanForModal] = useState(null);
  const [devControlsOpen, setDevControlsOpen] = useState(false);
  const [showDowngradeConfirm, setShowDowngradeConfirm] = useState(false);
  const scrollToPricing = () => {
    if (pricingRef.current) {
      pricingRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Premium Features 
  const features = [
    {
      title: "Instant Alerts",
      description: "Notifications to nearby hospitals and contacts",
      icon: <FaBell className="text-4xl text-[#6C0B14]" />
    },
    {
      title: "Health Vault",
      description: "Secure cloud storage for medical documents",
      icon: <FaFileMedical className="text-4xl text-[#6C0B14]" />
    },
    {
      title: "Medi-Shop",
      description: "Convenient shopping at labs and pharmacies",
      icon: <MdLocalPharmacy className="text-4xl text-[#6C0B14]" />
    },
    {
      title: "ICE QR Card",
      description: "Emergency access when you can't use the app",
      icon: <FaQrcode className="text-4xl text-[#6C0B14]" />
    }
  ];


  // Payment Methods
  const paymentMethods = [
    { 
      name: "Credit/Debit Cards", 
      icon: <FaCreditCard className="text-3xl text-[#6C0B14]" /> 
    },
    { 
      name: "EasyPaisa", 
      icon: <SiEasyeda className="text-3xl text-[#6C0B14]" /> 
    },
    { 
      name: "JazzCash", 
      icon: <FaMobileAlt className="text-3xl text-[#6C0B14]" /> 
    },
    { 
      name: "Bank Transfer", 
      icon: <MdAccountBalance className="text-3xl text-[#6C0B14]" /> 
    }
  ];

  const handleUpgrade = (plan) => {
    upgradeToPremium(plan);
    // Navigate to premium dashboard after upgrade
    setTimeout(() => {
      navigate('/pro');
    }, 1000);
  };

  const handleDowngrade = async () => {
    try {
      await downgradeToBasic();
      setShowDowngradeConfirm(false);
      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      // Error already handled in downgradeToBasic function
    }
  };


  // DEV-ONLY: temporary test helpers (visible only in development/for testing)
  const devResetPremium = () => {
    localStorage.removeItem('isPremium');
    localStorage.removeItem('premiumPlan');
    window.location.reload();
  };

  const devOpenConfirmForPlan = (plan) => {
    setInitialPlanForModal(plan);
    setShowPricingModal(true);
  };

  return ( 
    <div>
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-poppins">
      <div className="h-24"></div>
      
      {/* Success Banner for Premium Users */}
      {isPremium && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-400 mr-2" />
              <div>
                <p className="text-green-700 font-medium">
                  Premium Active - {premiumPlan === 'pro' ? 'Pro Care' : 'Annual'} Plan
                </p>
                <p className="text-green-600 text-sm">
                  You have access to all premium features
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowDowngradeConfirm(true)}
              className="text-red-600 text-sm underline hover:text-red-800 transition"
            >
              Cancel Subscription
            </button>
          </div>
        </div>
      )}

      {/*  Banner */}
      <div className="w-full bg-[#F8F4EC] py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[#6C0B14] mb-6">
          <span className="text-[#A0153E]">Premium</span> Healthcare Plan
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto">
          Advanced protection for you and your family's medical needs
        </p>
        {!isPremium && (
          <button 
            onClick={scrollToPricing}
            className="mt-8 bg-[#6C0B14] text-white px-8 py-3 rounded-full font-bold hover:bg-[#8a0f1a] transition"
          >
            Upgrade Now
          </button>
        )}
      </div>

      {/* Premium Features Grid */}
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* DEV ONLY – quick test controls */}
        <div className="mb-6">
          <button
            onClick={() => setDevControlsOpen(!devControlsOpen)}
            className="text-xs text-gray-500 underline"
          >
            {devControlsOpen ? 'Hide' : 'Show'} Dev Test Controls
          </button>
          {devControlsOpen && (
            <div className="mt-3 p-3 border border-dashed border-gray-300 rounded bg-white/60 flex flex-wrap gap-2">
              <button onClick={devResetPremium} className="px-3 py-1 text-xs bg-gray-200 rounded">Reset Premium</button>
              <button onClick={() => devOpenConfirmForPlan('pro')} className="px-3 py-1 text-xs bg-gray-200 rounded">Open Confirm (Pro)</button>
              <button onClick={() => devOpenConfirmForPlan('annual')} className="px-3 py-1 text-xs bg-gray-200 rounded">Open Confirm (Annual)</button>
            </div>
          )}
        </div>

        <h2 className="text-3xl font-bold text-center text-[#6C0B14] mb-12">
          Premium Benefits
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition duration-300"
            >
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-[#6C0B14] mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div ref={pricingRef} className="bg-white py-16 px-4">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-3xl font-bold text-center text-[#6C0B14] mb-2">
      Choose Your Plan
    </h2>
    <p className="text-center text-gray-600 mb-12">
      Select the package that fits your healthcare needs
    </p>

    {/* Make all cards same height */}
    <div className="grid md:grid-cols-3 gap-8 items-stretch">
      {/* Basic Plan */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 flex flex-col">
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Basic</h3>
          <p className="text-3xl font-bold text-[#6C0B14] mb-4">
            Rs. 0<span className="text-sm font-normal">/month</span>
          </p>
          <ul className="space-y-3 mb-6 flex-grow">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Emergency alerts</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Hospital locator</span>
            </li>
            <li className="flex items-start text-gray-400">
              <span className="mr-2">✗</span>
              <span>Medical records</span>
            </li>
          </ul>
          <button className="mt-auto w-full bg-gray-200 text-gray-800 py-2 rounded-md">
            Current Plan
          </button>
        </div>
      </div>

      {/* Pro Plan */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-[#6C0B14] transform scale-105 z-10 flex flex-col">
        <div className="bg-[#6C0B14] text-white text-center py-2">
          <p className="font-semibold">MOST POPULAR</p>
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Pro Care</h3>
          <p className="text-3xl font-bold text-[#6C0B14] mb-4">
            Rs. 500<span className="text-sm font-normal">/month</span>
          </p>
          <ul className="space-y-3 mb-6 flex-grow">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>All Basic features</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Medical records</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Access to labs and pharmacies</span>
            </li>
          </ul>
          <button
            onClick={() => {
              setInitialPlanForModal("pro");
              setShowPricingModal(true);
            }}
            className="mt-auto w-full bg-[#6C0B14] text-white py-2 rounded-md hover:bg-[#8a0f1a] transition"
          >
            {isPremium && premiumPlan === "pro"
              ? "Current Plan"
              : "Upgrade to Pro"}
          </button>
        </div>
      </div>

      {/* Annual Plan */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 flex flex-col">
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Annual</h3>
          <p className="text-3xl font-bold text-[#6C0B14] mb-4">
            Rs. 5,000<span className="text-sm font-normal">/year</span>
          </p>
          <p className="text-sm text-green-600 mb-4">
            Save 16% compared to monthly
          </p>
          <ul className="space-y-3 mb-6 flex-grow">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>All Pro features</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Discount yearly package</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Family package</span>
            </li>
          </ul>
          <button
            onClick={() => {
              setInitialPlanForModal("annual");
              setShowPricingModal(true);
            }}
            className="mt-auto w-full bg-[#6C0B14] text-white py-2 rounded-md hover:bg-[#8a0f1a] transition"
          >
            {isPremium && premiumPlan === "annual"
              ? "Current Plan"
              : "Choose Annual"}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>


      {/* Payment Methods */}
      <div className="max-w-4xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center text-[#6C0B14] mb-12">
          We Accept
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {paymentMethods.map((method, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition min-w-[150px]"
            >
              <div className="mb-3">
                {method.icon}
              </div>
              <span className="font-medium text-center">{method.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#6C0B14] mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg">How do I upgrade my plan?</h3>
              <p className="mt-2 text-gray-600">
                Select your desired plan and complete the payment. Your account will be upgraded immediately.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg">Can I cancel anytime?</h3>
              <p className="mt-2 text-gray-600">
                Yes, you can cancel your subscription anytime. No cancellation fees.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg">Is my payment secure?</h3>
              <p className="mt-2 text-gray-600">
                We use bank-level encryption for all transactions. Your payment information is never stored.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-[#6C0B14] text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready for Premium Healthcare?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join thousands who trust us for their emergency medical needs
        </p>
        {isPremium ? (
          <Link
            to="/pro"
            className="inline-block bg-white text-[#6C0B14] font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-100 transition"
          >
            Go to Dashboard
          </Link>
        ) : (
          <button
            onClick={scrollToPricing}
            className="inline-block bg-white text-[#6C0B14] font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-100 transition"
          >
            Get Started Now
          </button>
        )}
      </div>
    </div>
  
    
    {/* Pricing Modal */}
    <PricingModal 
      isOpen={showPricingModal}
      onClose={() => setShowPricingModal(false)}
      onUpgrade={handleUpgrade}
      initialPlan={initialPlanForModal}
    />

    {/* Downgrade Confirmation Modal */}
    {showDowngradeConfirm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-[#6C0B14] mb-4">Cancel Subscription</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to cancel your premium subscription? You will lose access to:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
            <li>Medical records storage</li>
            <li>Pharmacy and lab access</li>
            <li>Advanced emergency features</li>
            <li>Priority support</li>
          </ul>
          <p className="text-sm text-gray-500 mb-6">
            You can resubscribe anytime, but your data and preferences may not be saved.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setShowDowngradeConfirm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Keep Premium
            </button>
            <button
              onClick={handleDowngrade}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Cancel Subscription
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}