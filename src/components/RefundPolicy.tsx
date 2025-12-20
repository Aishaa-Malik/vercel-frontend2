import React from 'react';
import { AlertCircle, ArrowRight, MessageSquare, ShieldAlert } from 'lucide-react';

const RefundPolicy = () => {
  const lastUpdated = "December 20, 2025";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 p-8 text-white text-center">
          <h1 className="text-3xl font-bold">Refund & Dispute Policy</h1>
          <p className="mt-2 opacity-90 text-sm">Last Updated: {lastUpdated}</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Intro */}
          <section>
            <p className="text-gray-600 leading-relaxed text-center italic">
              "At TORI, our goal is to make booking as fast as messaging. To maintain this speed and transparency, we want to be clear about how payments and disputes are handled."
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 1: The Core Policy */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <ShieldAlert className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Refund Framework</h2>
              <p className="mt-2 text-gray-600">
                TORI facilitates the connection between you and your chosen service provider.
                Because the service is delivered by the Business (e.g., a clinic or gym),
                <strong> TORI does not process or issue refunds directly.</strong>
              </p>
            </div>
          </div>

          {/* Section 2: How to Handle Disputes */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Resolving Disputes</h2>
              <p className="mt-2 text-gray-600">
                If there is a disagreement regarding a booking, payment, or service quality:
              </p>
              <ul className="mt-4 space-y-3">
                <li className="flex items-center text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <ArrowRight className="w-4 h-4 mr-2 text-blue-400" />
                  Contact the Service Provider/Business directly.
                </li>
                <li className="flex items-center text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <ArrowRight className="w-4 h-4 mr-2 text-blue-400" />
                  Present your WhatsApp booking confirmation as proof.
                </li>
                <li className="flex items-center text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <ArrowRight className="w-4 h-4 mr-2 text-blue-400" />
                  Refer to the specific Business’s internal refund policy.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 3: Liability Note */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Notice of Liability</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  TORI is not responsible for any disputes, no-shows, or service issues.
                  We are a booking platform and are not liable for the financial or
                  operational actions of the independent businesses listed on our platform.
                </p>
              </div>
            </div>
          </div>

          {/* Support Footer */}
          <div className="pt-6 text-center border-t border-gray-100">
            <p className="text-gray-500 text-sm">
              Need technical help with a booking? <br />
              <a 
                href="https://api.whatsapp.com/send/?phone=918619439126&text=Hi&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-medium cursor-pointer hover:underline"
              >
                Connect with the TORI Team
              </a>
            </p>
          </div>
        </div>
      </div>
      <p className="text-center mt-8 text-gray-400 text-xs tracking-widest uppercase">
        Tori - The Amazon of Booking
      </p>
    </div>
  );
};

export default RefundPolicy;
