import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const PrivacyPolicy: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg">
        <div className="px-8 py-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-600">
              Last updated: September 8, 2025
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Welcome to Crackiit ("we," "our," or "us"). We provide appointment 
                booking and management services through our web application. This 
                Privacy Policy explains how we collect, use, disclose, and safeguard 
                your information when you use our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                2. Information We Collect
              </h2>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">
                Personal Information You Provide:
              </h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Name and contact information (email address, phone number)</li>
                <li>Account credentials and profile information</li>
                <li>Appointment details and scheduling preferences</li>
                <li>Payment information and billing address</li>
                <li>Business information (for service providers)</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">
                Information Collected Automatically:
              </h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>IP address and location data</li>
                <li>Device and browser information</li>
                <li>Usage data and service interactions</li>
                <li>Session data and preferences</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-gray-600 mb-4">We use your information to:</p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Provide and maintain our appointment booking services</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send appointment confirmations and reminders</li>
                <li>Improve our services and user experience</li>
                <li>Provide customer support</li>
                <li>Comply with legal obligations</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                4. Information Sharing and Disclosure
              </h2>
              <p className="text-gray-600 mb-4">We may share your information with:</p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Service providers (Supabase for data storage, payment processors)</li>
                <li>Healthcare providers (for appointment-related services)</li>
                <li>Legal authorities when required by law</li>
                <li>Third parties with your explicit consent</li>
              </ul>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 font-medium">
                  We do not sell or rent your personal information to third parties.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                5. Data Security
              </h2>
              <p className="text-gray-600 mb-4">
                We implement appropriate security measures including:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure server infrastructure through Supabase</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and authentication measures</li>
                <li>Secure payment processing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                6. Your Rights
              </h2>
              <p className="text-gray-600 mb-4">You have the right to:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Access your personal data</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your data</li>
                </ul>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Withdraw consent for data processing</li>
                  <li>Data portability</li>
                  <li>Object to certain processing activities</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                7. Data Retention
              </h2>
              <p className="text-gray-600 mb-4">
                We retain your information for as long as:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Your account remains active</li>
                <li>Required to provide our services</li>
                <li>Necessary for legal compliance</li>
                <li>Legitimate business purposes require</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                8. Changes to This Policy
              </h2>
              <p className="text-gray-600 mb-4">
                We may update this Privacy Policy periodically. We will notify you 
                of material changes through email or prominent notices on our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                9. Contact Information
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-600 mb-2">
                  For questions about this Privacy Policy, contact us at:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> privacy@crackiit.com</p>
                  <p><strong>Address:</strong> [Your Business Address]</p>
                  <p><strong>Phone:</strong> [Your Contact Number]</p>
                </div>
              </div>
            </section>
          </div>

          {user && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800 text-sm">
                  ✓ You are logged in as {user.email}. This privacy policy 
                  applies to your account and data.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
