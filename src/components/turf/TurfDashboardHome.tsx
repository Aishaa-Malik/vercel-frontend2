import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseService';

interface BookingStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}

interface BusinessProfile {
  business_name: string;
  time_slots: Array<{
    start_time: string;
    end_time: string;
  }>;
  operating_days: string[];
}

const TurfDashboardHome: React.FC = () => {
  const { user, tenant } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingStats, setBookingStats] = useState<BookingStats>({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0
  });
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.tenantId) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch business profile
        const { data: profileData, error: profileError } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('tenant_id', user.tenantId)
          .single();

        if (profileError) throw profileError;
        setBusinessProfile(profileData);

        // Get today's date
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Get first day of week (Sunday)
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - today.getDay());
        const weekStartStr = firstDayOfWeek.toISOString().split('T')[0];
        
        // Get first day of month
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthStartStr = firstDayOfMonth.toISOString().split('T')[0];

        // Fetch booking stats
        const { count: todayCount, error: todayError } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenantId)
          .eq('booking_date', todayStr);

        const { count: weekCount, error: weekError } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenantId)
          .gte('booking_date', weekStartStr);

        const { count: monthCount, error: monthError } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenantId)
          .gte('booking_date', monthStartStr);

        const { count: totalCount, error: totalError } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenantId);

        if (todayError || weekError || monthError || totalError) {
          throw new Error('Error fetching booking statistics');
        }

        setBookingStats({
          today: todayCount || 0,
          thisWeek: weekCount || 0,
          thisMonth: monthCount || 0,
          total: totalCount || 0
        });

        // Fetch recent bookings
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            customer_name,
            customer_email,
            customer_phone,
            booking_date,
            time_slot,
            status,
            payment_status,
            amount,
            created_at
          `)
          .eq('tenant_id', user.tenantId)
          .order('booking_date', { ascending: false })
          .limit(5);

        if (bookingsError) throw bookingsError;
        setRecentBookings(bookingsData || []);

      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.tenantId]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Turf Dashboard</h1>
        
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
            {error}
          </div>
        )}
        
        <div className="mt-6">
          <div className="text-lg font-medium text-gray-900">
            Welcome to {businessProfile?.business_name || tenant?.name || 'Your Turf'}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your turf bookings today
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Today's Bookings</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{bookingStats.today}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">This Week</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{bookingStats.thisWeek}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">This Month</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{bookingStats.thisMonth}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{bookingStats.total}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Info */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Turf Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Your turf details and operating schedule</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Turf name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {businessProfile?.business_name || 'Not set'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Operating days</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {businessProfile?.operating_days?.join(', ') || 'Not set'}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Time slots</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {businessProfile?.time_slots?.map((slot, index) => (
                      <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <span className="ml-2 flex-1 w-0 truncate">
                            {slot.start_time} - {slot.end_time}
                          </span>
                        </div>
                      </li>
                    )) || <li className="pl-3 pr-4 py-3 text-sm text-gray-500">No time slots set</li>}
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Recent Bookings</h2>
          <div className="mt-4 flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentBookings.length > 0 ? (
                        recentBookings.map((booking) => (
                          <tr key={booking.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{booking.customer_name}</div>
                              <div className="text-sm text-gray-500">{booking.customer_email}</div>
                              {booking.customer_phone && (
                                <div className="text-sm text-gray-500">{booking.customer_phone}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(booking.booking_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="text-sm text-gray-500">{booking.time_slot}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className={`${
                                booking.payment_status === 'paid' ? 'text-green-600' :
                                booking.payment_status === 'pending' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                              </div>
                              {booking.amount && (
                                <div>₹{booking.amount}</div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                            No recent bookings found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurfDashboardHome;
