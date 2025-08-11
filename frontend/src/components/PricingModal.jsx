import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaMobileAlt, FaTimes } from 'react-icons/fa';
import { MdAccountBalance } from 'react-icons/md';
import { SiEasyeda } from 'react-icons/si';

const PLAN_DETAILS = {
  pro: { label: 'Pro Care', price: 'Rs. 500/month' },
  annual: { label: 'Annual', price: 'Rs. 5,000/year' }
};

const PricingModal = ({ isOpen, onClose, onUpgrade, initialPlan = null }) => {
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [step, setStep] = useState(initialPlan ? 'confirm' : 'choose');
  const [selectedPayment, setSelectedPayment] = useState('Credit/Debit Cards');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setSelectedPlan(initialPlan || null);
    setStep(initialPlan ? 'confirm' : 'choose');
  }, [initialPlan, isOpen]);

  // Payment Methods
  const paymentMethods = [
    { name: 'Credit/Debit Cards', icon: <FaCreditCard className="text-3xl text-[#6C0B14]" /> },
    { name: 'EasyPaisa', icon: <SiEasyeda className="text-3xl text-[#6C0B14]" /> },
    { name: 'JazzCash', icon: <FaMobileAlt className="text-3xl text-[#6C0B14]" /> },
    { name: 'Bank Transfer', icon: <MdAccountBalance className="text-3xl text-[#6C0B14]" /> }
  ];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);
    //  payment processing
    setTimeout(() => {
      onUpgrade(selectedPlan);
      setIsProcessing(false);
      onClose();
      setSelectedPlan(null);
      setStep('choose');
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-[#6C0B14]">
            {step === 'choose' ? 'Choose Your Plan' : 'Confirm Your Order'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition">
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="p-6">
          {step === 'choose' && (
            <>
              <p className="text-center text-gray-600 mb-8">Select the package that fits your healthcare needs</p>
              <div className="grid md:grid-cols-3 gap-8 mb-2">
                {/* Basic Plan */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Basic</h3>
                    <p className="text-3xl font-bold text-[#6C0B14] mb-4">Rs. 0<span className="text-sm font-normal">/month</span></p>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start"><span className="text-green-500 mr-2">✓</span><span>Emergency alerts</span></li>
                      <li className="flex items-start"><span className="text-green-500 mr-2">✓</span><span>Hospital locator</span></li>
                      <li className="flex items-start text-gray-400"><span className="mr-2">✗</span><span>Medical records</span></li>
                    </ul>
                    <button className="w-full bg-gray-200 text-gray-800 py-2 rounded-md cursor-not-allowed">Current Plan</button>
                  </div>
                </div>

                {/* Pro Plan */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-[#6C0B14] transform scale-105 z-10">
                  <div className="bg-[#6C0B14] text-white text-center py-2"><p className="font-semibold">MOST POPULAR</p></div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Pro Care</h3>
                    <p className="text-3xl font-bold text-[#6C0B14] mb-4">Rs. 500<span className="text-sm font-normal">/month</span></p>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start"><span className="text-green-500 mr-2">✓</span><span>All Basic features</span></li>
                      <li className="flex items-start"><span className="text-green-500 mr-2">✓</span><span>Medical records</span></li>
                      <li className="flex items-start"><span className="text-green-500 mr-2">✓</span><span>Priority support</span></li>
                    </ul>
                    <button onClick={() => handleSelectPlan('pro')} className={`w-full py-2 rounded-md transition bg-[#6C0B14] text-white hover:bg-[#8a0f1a]`}>
                      Use Pro
                    </button>
                  </div>
                </div>

                {/* Annual Plan */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Annual</h3>
                    <p className="text-3xl font-bold text-[#6C0B14] mb-4">Rs. 5,000<span className="text-sm font-normal">/year</span></p>
                    <p className="text-sm text-green-600 mb-4">Save 16% compared to monthly</p>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start"><span className="text-green-500 mr-2">✓</span><span>All Pro features</span></li>
                      <li className="flex items-start"><span className="text-green-500 mr-2">✓</span><span>Yearly health checkup</span></li>
                      <li className="flex items-start"><span className="text-green-500 mr-2">✓</span><span>Family package</span></li>
                    </ul>
                    <button onClick={() => handleSelectPlan('annual')} className={`w-full py-2 rounded-md transition bg-[#6C0B14] text-white hover:bg-[#8a0f1a]`}>
                      Use Annual
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="bg-[#F8F4EC] p-4 rounded-lg border border-[#eadfd6]">
                <p className="text-[#6C0B14] font-semibold">Order Summary</p>
                <p className="text-gray-700">Plan: {PLAN_DETAILS[selectedPlan]?.label} <span className="ml-2 text-sm text-gray-500">({PLAN_DETAILS[selectedPlan]?.price})</span></p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#6C0B14] mb-3">Select Payment Method</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.name}
                      onClick={() => setSelectedPayment(method.name)}
                      className={`flex items-center gap-3 p-4 rounded-lg border transition ${
                        selectedPayment === method.name ? 'border-[#6C0B14] bg-[#F8F4EC]' : 'border-gray-200 bg-white hover:border-[#6C0B14]'
                      }`}
                    >
                      {method.icon}
                      <span className="font-medium">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => setStep('choose')} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">Back</button>
                <button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className={`px-6 py-2 rounded-md text-white ${isProcessing ? 'bg-gray-400' : 'bg-[#6C0B14] hover:bg-[#8a0f1a]'} transition`}
                >
                  {isProcessing ? 'Processing...' : `Confirm & Pay (${PLAN_DETAILS[selectedPlan]?.price})`}
                </button>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-base font-semibold text-center text-[#6C0B14] mb-4">We Accept</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {paymentMethods.map((method) => (
                    <div key={method.name} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md">
                      {method.icon}
                      <span className="text-sm">{method.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
