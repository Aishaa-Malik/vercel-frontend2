import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const PrivacyPolicy: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg">
        <div className="px-8 py-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-600">
              Effective Date: September 9, 2025
            </p>
            <p className="text-sm text-gray-600">
              Last Updated: September 9, 2025
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                This Privacy Policy describes how Crackiit ("we," "our," or "us") collects, 
                uses, and shares information about you when you use our appointment booking 
                and management platform. By using our service, you agree to the collection 
                and use of information in accordance with this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                2. Information We Collect
              </h2>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">
                2.1 Information You Provide
              </h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, phone number, password</li>
                {/* <li><strong>Profile Information:</strong> Business details, location, services offered</li> */}
                <li><strong>Appointment Data:</strong> Booking details</li>
                <li><strong>Payment Information:</strong> Payment method details (processed securely)</li>
                {/* <li><strong>Communications:</strong> Messages, support requests, feedback</li> */}
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">
                2.2 Information Collected Automatically
              </h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                {/* <li><strong>Usage Data:</strong> How you interact with our service, features used, time spent</li> */}
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Location Data:</strong> General location based on IP address (with your consent)</li>
                <li><strong>Cookies and Tracking:</strong> Session data, preferences, analytics information</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">
                2.3 Information from Third Parties
              </h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                {/* <li>Social media login information (if you choose to connect social accounts)</li> */}
                {/* <li>Payment processor information for transaction processing</li> */}
                <li>Integration partners (google calendar, communication tools)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-gray-600 mb-4">We use collected information for:</p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li><strong>Service Provision:</strong> Managing appointments, processing bookings, facilitating communications</li>
                <li><strong>Account Management:</strong> Creating and maintaining your account, authentication, support</li>
                <li><strong>Payment Processing:</strong> Processing transactions, managing subscriptions, billing</li>
                <li><strong>Communications:</strong> Sending confirmations, reminders, updates, marketing (with consent)</li>
                <li><strong>Analytics:</strong> Understanding usage patterns, improving our service, troubleshooting</li>
                <li><strong>Legal Compliance:</strong> Meeting regulatory requirements, preventing fraud, enforcing terms</li>
                <li><strong>Business Operations:</strong> Customer support, security monitoring, service improvements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                4. Information Sharing and Disclosure
              </h2>
              <p className="text-gray-600 mb-4">We may share your information in the following circumstances:</p>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">
                4.1 Service Providers
              </h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Supabase (database and authentication services)</li>
                <li>Payment processors (for transaction handling)</li>
                <li>Email service providers (for communications)</li>
                <li>Analytics providers (for service improvement)</li>
                <li>Hosting and infrastructure providers</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">
                4.2 Business Transfers
              </h3>
              <p className="text-gray-600 mb-4">
                In connection with any merger, acquisition, or sale of company assets, 
                your information may be transferred as part of that transaction.
              </p>

              <h3 className="text-xl font-medium text-gray-700 mb-3">
                4.3 Legal Requirements
              </h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>When required by law or legal process</li>
                <li>To protect our rights, property, or safety</li>
                <li>To prevent fraud or security threats</li>
                <li>With your explicit consent</li>
              </ul>

              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <p className="text-blue-800 font-medium">
                  We do not sell, rent, or trade your personal information to third parties 
                  for their marketing purposes.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                5. Data Security
              </h2>
              <p className="text-gray-600 mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li><strong>Encryption:</strong> Data encrypted in transit (HTTPS) and at rest</li>
                <li><strong>Access Controls:</strong> Limited employee access on need-to-know basis</li>
                <li><strong>Authentication:</strong> Secure login mechanisms and session management</li>
                <li><strong>Monitoring:</strong> Regular security audits and threat monitoring</li>
                <li><strong>Infrastructure:</strong> Secure cloud hosting with enterprise-grade security</li>
              </ul>
              <div className="bg-yellow-50 p-4 rounded-lg mt-4">
                <p className="text-yellow-800 text-sm">
                  While we use reasonable measures to protect your information, no method 
                  of transmission over the internet is 100% secure.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                6. Your Rights and Choices
              </h2>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">
                6.1 Account Information
              </h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li><strong>Access:</strong> View and download your personal data</li>
                <li><strong>Update:</strong> Modify your account and profile information</li>
                <li><strong>Delete:</strong> Request deletion of your account and data</li>
                <li><strong>Export:</strong> Obtain a copy of your data in portable format</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">
                6.2 Communication Preferences
              </h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Opt out of marketing communications</li>
                <li>Manage notification settings</li>
                <li>Control email preferences</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">
                6.3 Cookies and Tracking
              </h3>
              <p className="text-gray-600 mb-4">
                You can control cookies through your browser settings. Note that disabling 
                certain cookies may affect service functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                7. Data Retention
              </h2>
              <p className="text-gray-600 mb-4">We retain your information:</p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li><strong>Active Accounts:</strong> For as long as your account is active</li>
                <li><strong>Legal Requirements:</strong> As required by applicable laws</li>
                <li><strong>Business Purposes:</strong> For legitimate business needs (customer service, analytics)</li>
                <li><strong>Deleted Accounts:</strong> Up to 30 days after deletion for recovery purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                8. International Data Transfers
              </h2>
              <p className="text-gray-600 mb-4">
                Your information may be processed in countries other than your country of residence. 
                We ensure appropriate safeguards are in place to protect your data in accordance 
                with this Privacy Policy and applicable laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                9. Children's Privacy
              </h2>
              <p className="text-gray-600 mb-4">
                Our service is not intended for children under 13 years of age. We do not 
                knowingly collect personal information from children under 13. If we become 
                aware that we have collected such information, we will take steps to delete it.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                10. Third-Party Services
              </h2>
              <p className="text-gray-600 mb-4">
                Our service may contain links to third-party websites or services. This Privacy 
                Policy does not apply to those third-party services. We encourage you to review 
                their privacy policies before providing any information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                11. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-600 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of 
                material changes by email or through a prominent notice on our service. 
                Your continued use of the service after changes become effective constitutes 
                acceptance of the revised policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                12. Contact Information
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-600 mb-4">
                  If you have questions about this Privacy Policy or our data practices, 
                  please contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> ayush.faang@gmail.com</p>
                  <p><strong>Company:</strong> Crackiit</p>
                  <p><strong>Address:</strong> India</p>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    For data protection inquiries or to exercise your rights under applicable 
                    privacy laws, please use the contact information above.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {user && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800 text-sm">
                  ✓ You are logged in as {user.email}. This privacy policy 
                  applies to your account and all data associated with it.
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
