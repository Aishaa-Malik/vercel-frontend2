import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../services/supabaseService';

interface Appointment {
  id: string;
  customer_name: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:mm or HH:mm:ss
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  customer_email?: string;
  customer_contact?: string;
  booking_reference?: string;
  payment_id?: string;
  amount?: number;
  currency?: string;
  payment_method?: string;
  created_at?: string;
  updated_at?: string;
}

interface AppointmentLimits {
  canBook: boolean;
  remainingAppointments: number;
  totalLimit: number;
}

interface ActiveSubscription {
  id: string;
  billing_cycle_start: string; // YYYY-MM-DD
  billing_cycle_end: string;   // YYYY-MM-DD
  plans: {
    name: string;
    appointment_limit: number;
  } | any; // Allow for both object and array structures
}

interface Subscription {
  id: string;
  billing_cycle_start: string;
  billing_cycle_end: string;
  status: string;
  plans: {
    name: string;
    appointment_limit: number;
  };
}

const TurfAppointmentsPage: React.FC = () => {
  const { tenant, user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingIds, setCancellingIds] = useState<Set<string>>(new Set());
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());
  const [appointmentLimits, setAppointmentLimits] = useState<AppointmentLimits>({
    canBook: true,
    remainingAppointments: 0,
    totalLimit: 0
  });
  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscription | null>(null);
  const [allSubscriptions, setAllSubscriptions] = useState<Subscription[]>([]);


  // Check appointment limits function (also stores active subscription for filtering)
  const checkAppointmentLimit = async (tenantId: string): Promise<AppointmentLimits> => {
    try {
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select(`
          id,
          billing_cycle_start,
          billing_cycle_end,
          plans!inner (
            name,
            appointment_limit
          )
        `)
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .gte('billing_cycle_end', new Date().toISOString().split('T')[0])
        .single();

      if (subError || !subscription || !subscription.plans) {
        setActiveSubscription(null);
        return { canBook: false, remainingAppointments: 0, totalLimit: 0 };
      }

      setActiveSubscription(subscription as unknown as ActiveSubscription);

      // Count appointments in this active billing cycle
      const { count: appointmentCount, error: countError } = await supabase
        .from('TurfAppointments')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('appointment_date', subscription.billing_cycle_start)
        .lt('appointment_date', subscription.billing_cycle_end);

      if (countError) throw countError;

      const usedAppointments = appointmentCount || 0;
      
      // Handle plans data which could be in different formats
      let totalLimit = 0;
      if (subscription.plans) {
        // Use type assertion to handle the plans object
        const plansObj = subscription.plans as any;
        totalLimit = plansObj.appointment_limit || 0;
      }


      const remainingAppointments = Math.max(0, totalLimit - usedAppointments);

      return {
        canBook: remainingAppointments > 0,
        remainingAppointments,
        totalLimit
      };
    } catch (error) {
      console.error('Error checking appointment limit:', error);
      setActiveSubscription(null);
      return { canBook: false, remainingAppointments: 0, totalLimit: 0 };
    }
  };

  // Fetch appointments
  const fetchAppointments = async () => {
    if (!user?.tenantId) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('TurfAppointments')
        .select(`
          id,
          customer_name,
          customer_email,
          customer_contact,
          appointment_date,
          appointment_time,
          status,
          booking_reference,
          payment_id,
          amount,
          currency,
          payment_method,
          created_at,
          updated_at
        `)
        .eq('tenant_id', user.tenantId)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: true });

      if (error) throw error;

      setAppointments(data || []);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user?.tenantId]);

  useEffect(() => {
    if (user?.tenantId) {
      checkAppointmentLimit(user.tenantId).then(setAppointmentLimits);
    }
  }, [user?.tenantId]);

  // Cancel appointment
  const cancelAppointment = async (appointment: Appointment) => {
    try {
      setCancellingIds(prev => new Set(prev).add(appointment.id));

      const { error: updateError } = await supabase
        .from('TurfAppointments')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', appointment.id);

      if (updateError) throw updateError;

      setAppointments(prev => prev.filter(apt => apt.id !== appointment.id));

      try {
        const n8nWebhookUrl = 'https://aishaiitbombay.app.n8n.cloud/webhook/appointment-cancel';
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointment_id: appointment.id,
            appointment_date: appointment.appointment_date,
            appointment_time: appointment.appointment_time,
            customer_name: appointment.customer_name,
            action: 'cancel'
          }),
        });
      } catch (n8nError) {
        console.error('Failed to notify n8n:', n8nError);
      }

      if (user?.tenantId) {
        checkAppointmentLimit(user.tenantId).then(setAppointmentLimits);
      }
    } catch (err: any) {
      console.error('Error cancelling appointment:', err);
      setError('Failed to cancel appointment');
    } finally {
      setCancellingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(appointment.id);
        return newSet;
      });
    }
  };

  // Utility: parse date+time to timestamp
  const toTs = (d: string, t: string) => {
    const time = t?.length === 5 ? `${t}:00` : t || '00:00:00';
    return new Date(`${d}T${time}`).getTime();
  };

  // Build visible list with limit logic
// Build visible list with limit logic


const visibleAppointments = useMemo(() => {
  if (!appointments.length) return [];

  // If no subscriptions, show no appointments
  if (!allSubscriptions?.length) return [];

  // Sort subscriptions by start date for efficient lookup
  const sortedSubscriptions = [...allSubscriptions].sort((a, b) => 
    a.billing_cycle_start.localeCompare(b.billing_cycle_start)
  );

  // Helper function to find subscription that covers a date
  const findCoveringSubscription = (date: string) => {
    return sortedSubscriptions.find(sub => 
      date >= sub.billing_cycle_start && date < sub.billing_cycle_end
    );
  };

  // First, determine which appointments are covered by any subscription
  const appointmentsWithSubs = appointments.map(appointment => {
    const coveringSub = findCoveringSubscription(appointment.appointment_date);
    return { appointment, subscription: coveringSub };
  });

  // Filter out appointments with no subscription coverage
  const validAppointments = appointmentsWithSubs.filter(item => item.subscription);

  // If no active subscription, show all valid appointments
  if (!activeSubscription) {
    return validAppointments
      .map(item => item.appointment)
      .sort((a, b) => {
        const ta = toTs(a.appointment_date, a.appointment_time);
        const tb = toTs(b.appointment_date, b.appointment_time);
        return tb - ta;
      });
  }

  // Get current subscription details
  const { billing_cycle_start, billing_cycle_end, plans } = activeSubscription;
  const totalLimit = plans.appointment_limit || 0;

  // Separate current cycle and previous cycles
  const currentCycleAppointments = validAppointments.filter(
    item => item.appointment.appointment_date >= billing_cycle_start && 
            item.appointment.appointment_date < billing_cycle_end
  ).map(item => item.appointment);

  const previousCycleAppointments = validAppointments.filter(
    item => item.appointment.appointment_date < billing_cycle_start
  ).map(item => item.appointment);

  // Apply limit only to current cycle appointments
  const limitedCurrentCycle = totalLimit > 0 
    ? currentCycleAppointments.slice(0, totalLimit) 
    : [];

  // Combine and sort all visible appointments
  return [...previousCycleAppointments, ...limitedCurrentCycle].sort((a, b) => {
    const ta = toTs(a.appointment_date, a.appointment_time);
    const tb = toTs(b.appointment_date, b.appointment_time);
    return tb - ta;
  });

}, [appointments, allSubscriptions, activeSubscription]);

  // Apply filter/search on visibleAppointments
  const filteredAppointments = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return visibleAppointments.filter(appointment => {
      const matchesFilter = filter === 'all' || appointment.status === filter;
      const matchesSearch = 
        appointment.customer_name.toLowerCase().includes(q) ||
        (appointment.customer_contact && appointment.customer_contact.toLowerCase().includes(q)) ||
        (appointment.booking_reference && appointment.booking_reference.toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    });
  }, [visibleAppointments, filter, searchQuery]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading appointments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
          <p className="text-gray-600">Manage customer appointments for {tenant?.name || 'your organization'}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={() => fetchAppointments()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors mr-2"
          >
            Refresh
          </button>
          <button 
            className={`px-4 py-2 rounded-md transition-colors ${
              appointmentLimits.canBook 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!appointmentLimits.canBook}
          >
            + New Appointment
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Monthly Booking Usage
            </h3>
            <p className="text-sm text-blue-600">
              {appointmentLimits.totalLimit - appointmentLimits.remainingAppointments} / {appointmentLimits.totalLimit} Bookings used this month
            </p>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${appointmentLimits.canBook ? 'text-green-600' : 'text-red-600'}`}>
              {appointmentLimits.remainingAppointments} remaining
            </div>
          </div>
        </div>
        {!appointmentLimits.canBook && (
          <div className="mt-2 text-sm text-red-600">
            You've reached your monthly booking limit. Please upgrade your plan to book more bookings.
          </div>
        )}
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${appointmentLimits.canBook ? 'bg-blue-600' : 'bg-red-600'}`}
              style={{ 
                width: `${appointmentLimits.totalLimit ? ((appointmentLimits.totalLimit - appointmentLimits.remainingAppointments) / appointmentLimits.totalLimit) * 100 : 0}%` 
              }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">{error}</div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search by customer name, contact, or booking reference"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'scheduled', 'completed', 'cancelled', 'no-show'].map((status) => (
              <button 
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filter === status 
                    ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                    : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  customer
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    {searchQuery || filter !== 'all' ? 'No matching bookings found' : 'No bookings found'}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{appointment.customer_name}</div>
                      {appointment.customer_contact && (
                        <div className="text-sm text-gray-500">{appointment.customer_contact}</div>
                      )}
                      {appointment.customer_email && (
                        <div className="text-sm text-gray-500">{appointment.customer_email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(appointment.appointment_date)}</div>
                      <div className="text-sm text-gray-500">{formatTime(appointment.appointment_time)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {appointment.amount && (
                        <div className="text-sm text-gray-900">
                          {appointment.currency || 'INR'} {appointment.amount}
                        </div>
                      )}
                      {appointment.payment_method && (
                        <div className="text-sm text-gray-500">{appointment.payment_method.toUpperCase()}</div>
                      )}
                      {appointment.payment_id && (
                        <div className="text-xs text-gray-400">
                          ID: {appointment.payment_id.substring(0, 8)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                     
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {appointment.booking_reference && (
                        <div className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                          {appointment.booking_reference}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 hover:underline transition-colors">
                        View
                      </button>
                      {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                        <button 
                          onClick={() => cancelAppointment(appointment)}
                          disabled={cancellingIds.has(appointment.id)}
                          className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingIds.has(appointment.id) ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Cancelling...
                            </>
                          ) : (
                            'Cancel'
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TurfAppointmentsPage;
