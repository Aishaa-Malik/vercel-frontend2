import React, { useState } from 'react';
import { format, differenceInHours, parseISO } from 'date-fns';
import { AlertCircle, Clock, Calendar } from 'lucide-react';

interface Booking {
  id: string;
  payment_id: string;
  service_name: string;
  tenant_name: string;
  date: string;
  time: string;
  status: string;
}

const BookingCard = ({ booking }: { booking: Booking }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(booking.status); // e.g., 'confirmed', 'cancelled'

  // 1. Combine Date & Time into a single Object
  // Assuming booking.date is "2025-10-18" and booking.time is "14:00:00"
  const appointmentDateTime = parseISO(`${booking.date}T${booking.time}`);
  const currentDateTime = new Date();

  // 2. Calculate the difference in hours
  const hoursUntilAppointment = differenceInHours(appointmentDateTime, currentDateTime);
  
  // 3. Define Policy Rule: Must be > 24 hours
  const isCancellable = hoursUntilAppointment >= 24 && status !== 'cancelled';

  const handleCancel = async () => {
    if (!window.confirm("Are you sure? You will be fully refunded.")) return;

    setLoading(true);
    try {
      // 4. Call your N8N Webhook or Supabase Edge Function
      const response = await fetch('https://your-n8n-webhook-url/cancel-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: booking.id,
          payment_id: booking.payment_id, // Needed for Stripe/Razorpay refund
          reason: "User requested cancellation"
        }),
      });

      if (response.ok) {
        setStatus('cancelled');
        alert("Booking cancelled! Your refund is processing.");
      } else {
        // Mocking success for demo purposes since the webhook URL is placeholder
        setStatus('cancelled');
        alert("Booking cancelled! Your refund is processing. (Demo mode)");
        // In real app: alert("Error cancelling. Please contact support.");
      }
    } catch (error) {
      console.error("Cancellation failed", error);
      // Mocking success for demo purposes
      setStatus('cancelled');
      alert("Booking cancelled! Your refund is processing. (Demo mode)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white w-full hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
            <h3 className="font-bold text-lg text-gray-900">{booking.service_name}</h3>
            <p className="text-sm text-gray-500 mt-1 flex items-center">
                <span className="mr-1">📍</span> {booking.tenant_name}
            </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {status.toUpperCase()}
        </span>
      </div>

      {/* Details */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <p className="text-gray-700 flex items-center mb-1">
          <Calendar className="w-4 h-4 mr-2 text-gray-500" /> 
          {format(appointmentDateTime, 'PPP')}
        </p>
        <p className="text-gray-700 flex items-center">
          <Clock className="w-4 h-4 mr-2 text-gray-500" />
          {format(appointmentDateTime, 'p')}
        </p>
      </div>

      {/* Cancellation Section */}
      <div className="border-t pt-4">
        {status === 'cancelled' ? (
          <p className="text-red-500 text-sm italic flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            This booking has been cancelled.
          </p>
        ) : isCancellable ? (
          <div className="flex justify-between items-center">
            <p className="text-green-600 text-xs font-medium">Free cancellation available</p>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="bg-white text-red-600 px-4 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {loading ? "Processing..." : "Cancel Booking"}
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
             <p className="text-gray-400 text-xs flex items-center">
                <Clock className="w-3 h-3 mr-1" /> Less than 24h away
             </p>
             <button disabled className="bg-gray-100 text-gray-400 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed border border-gray-200">
               Non-refundable
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CancellationPolicy = () => {
    // Example booking data for demonstration
    const exampleBookings = [
        {
            id: '1',
            payment_id: 'pay_123',
            service_name: 'Physiotherapy Session',
            tenant_name: 'City Wellness Center',
            date: '2025-10-20', // Future date > 24h
            time: '14:00:00',
            status: 'confirmed'
        },
        {
            id: '2',
            payment_id: 'pay_456',
            service_name: 'Dental Checkup',
            tenant_name: 'Bright Smiles Clinic',
            date: '2025-12-21', // Today/Tomorrow < 24h depending on current date, let's assume it's close
            time: '09:00:00',
            status: 'confirmed'
        }
    ];

    return (
        <div className="min-h-screen relative bg-gray-50">
            {/* Background Image - matching Contact Us style */}
            <div className="fixed inset-0 z-0">
                <img src="/toriateBack.png" alt="Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">Cancellation Policy</h1>
                    <p className="mt-4 text-lg text-gray-200">Manage your bookings and understand our cancellation terms.</p>
                </div>

                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Policy Information Card */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-white shadow-xl h-fit">
                        <h2 className="text-2xl font-bold mb-6">Cancellation Terms</h2>
                        
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="bg-teal-500/20 p-3 rounded-full">
                                    <Clock className="h-6 w-6 text-teal-300" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">24-Hour Notice</h3>
                                    <p className="text-gray-200 mt-1">Cancellations made more than 24 hours before the appointment time are eligible for a full refund.</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-teal-500/20 p-3 rounded-full">
                                    <AlertCircle className="h-6 w-6 text-teal-300" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Late Cancellations</h3>
                                    <p className="text-gray-200 mt-1">Cancellations within 24 hours of the appointment are non-refundable as providers reserve this time for you.</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10 mt-6">
                                <p className="text-sm text-gray-300 italic">
                                    * Refunds are processed automatically to the original payment method within 5-7 business days.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Manage Bookings Section (Demo) */}
                    {/* <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-xl">
                            <h2 className="text-xl font-bold mb-4 text-gray-900">Manage Your Bookings</h2>
                            <p className="text-gray-600 mb-6 text-sm">Below are examples of how you can manage your active bookings based on the policy.</p>
                            
                            <div className="space-y-4">
                                {exampleBookings.map(booking => (
                                    <BookingCard key={booking.id} booking={booking} />
                                ))}
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default CancellationPolicy;
