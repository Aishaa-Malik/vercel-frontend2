import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const BACKEND_API_URL = 'https://vercel-backend2-qj8e.vercel.app/';

const PaymentCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Get the email from localStorage
        const email = localStorage.getItem('paymentEmail');
        
        if (!email) {
          setStatus('error');
          setMessage('Email information not found. Please try again or contact support.');
          return;
        }

        // Get payment details from URL query parameters
        const searchParams = new URLSearchParams(location.search);
        const razorpay_payment_id = searchParams.get('razorpay_payment_id');
        const razorpay_order_id = searchParams.get('razorpay_order_id');
        const razorpay_signature = searchParams.get('razorpay_signature');

        // If we don't have payment details in the URL (direct access to callback page)
        // This is for development/testing - in production, these should come from Razorpay
        if (!razorpay_payment_id) {
          console.log('No payment details in URL, using test values');
          // For testing purposes only - in production these would come from Razorpay
          const testPaymentId = 'pay_' + Date.now();
          const testOrderId = 'order_' + Date.now();
          const testSignature = 'sig_' + Date.now();
          
          // Call backend API to verify payment
          const response = await axios.post(`${BACKEND_API_URL}/verify-payment`, {
            razorpay_payment_id: testPaymentId,
            razorpay_order_id: testOrderId,
            razorpay_signature: testSignature,
            email
          });

          if (response.data.success) {
            handleSuccessfulPayment();
          } else {
            handleFailedPayment(response.data.message || 'Payment verification failed');
          }
          
          return;
        }

        // Call backend API to verify payment with real Razorpay parameters
        const response = await axios.post(`${BACKEND_API_URL}/verify-payment`, {
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
          email
        });

        if (response.data.success) {
          handleSuccessfulPayment();
        } else {
          handleFailedPayment(response.data.message || 'Payment verification failed');
        }
      } catch (error: any) {
        console.error('Payment callback error:', error);
        handleFailedPayment(error.response?.data?.message || 'An error occurred while processing your payment');
      }
    };

    const handleSuccessfulPayment = () => {
      setStatus('success');
      setMessage('Payment successful! You are now registered as a Business Admin.');
      
      // Clear the email from localStorage
      localStorage.removeItem('paymentEmail');
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    };

    const handleFailedPayment = (errorMessage: string) => {
      setStatus('error');
      setMessage(errorMessage || 'Payment verification failed. Please contact support.');
    };

    processPayment();
  }, [navigate, location.search]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Payment {status === 'processing' ? 'Processing' : status === 'success' ? 'Successful' : 'Failed'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'processing' && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            )}
            
            {status === 'success' && (
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            {status === 'error' && (
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            
            <p className="mt-4 text-sm text-gray-600">{message}</p>
            
            {status === 'error' && (
              <div className="mt-6">
                <button
                  onClick={() => navigate('/')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Return to Home
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;