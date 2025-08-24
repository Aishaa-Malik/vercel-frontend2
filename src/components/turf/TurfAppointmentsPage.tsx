import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../services/supabaseService';
import NewAppointmentForm from '../NewAppointmentForm';




interface Appointment {
  id: string;
  customer_name: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:mm or HH:mm:ss
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'no-show';
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
  }[];
}

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}



const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 float-right"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Booking Detail Modal Component
interface BookingDetailModalProps {
  booking: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({ booking, isOpen, onClose }) => {
  if (!booking) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="sm:flex sm:items-start">
        <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
            Booking Details
          </h3>
          
          <div className="overflow-hidden bg-white dark:bg-gray-800 shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 w-1/3">
                    Booking Reference
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                    {booking.booking_reference || 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700">
                    Customer Name
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                    {booking.customer_name}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700">
                    Customer Email
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                    {booking.customer_email || 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700">
                    Customer Contact
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {booking.customer_contact || 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                    Date & Time
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatDate(booking.appointment_date)} at {formatTime(booking.appointment_time)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                    Status
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      booking.status === 'no-show' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                    Payment Amount
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {booking.amount ? `${booking.currency || 'INR'} ${booking.amount}` : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                    Payment Method
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {booking.payment_method ? booking.payment_method.toUpperCase() : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                    Payment ID
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {booking.payment_id || 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                    Created At
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {booking.created_at ? new Date(booking.created_at).toLocaleString() : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                    Last Updated
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {booking.updated_at ? new Date(booking.updated_at).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const TurfAppointmentsPage: React.FC = () => {
  const { tenant, user } = useAuth();
  const [filter, setFilter] = useState('all');
  // Status options with proper capitalization
  const statusOptions = ['all', 'Scheduled', 'Completed', 'Cancelled', 'No-show'];
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
  
  // Modal state
  const [selectedBooking, setSelectedBooking] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

   // Function to trigger refresh
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

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
        .maybeSingle();

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

  // Add this new function
  const fetchAllSubscriptions = async () => {
    if (!user?.tenantId) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          id,
          billing_cycle_start,
          billing_cycle_end,
          status,
          plans!inner (
            name,
            appointment_limit
          )
        `)
        .eq('tenant_id', user.tenantId)
        .order('billing_cycle_start', { ascending: true });

      if (error) throw error;
      
      console.log('All subscriptions:', data);
      setAllSubscriptions(data);
    } catch (err: any) {
      console.error('Error fetching subscriptions:', err);
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

        console.log('hooo data', data);

      if (error) throw error;
      console.log('Fetched appointment data:', data); // ✅ Log the fetched data

      setAppointments(data || []);
      console.log('Appointments', appointments);

    } catch (err: any) {
      console.log('Error fetching appointments:', err);
      console.log('Here');
      setError('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

useEffect(() => {
  console.log('Setting up realtime subscription for tenant:', user?.tenantId);
  
  if (!user?.tenantId) {
    console.log('No tenantId available, skipping subscription');
    return;
  }

  fetchAppointments();
  fetchAllSubscriptions();

  // Set up real-time subscription
  const appointmentsSubscription = supabase
    .channel('turf-appointments-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public', 
        table: 'TurfAppointments',
        filter: `tenant_id=eq.${user.tenantId}`
      },
      (payload) => {
        console.log('🔥 Realtime event received:', payload);
        console.log('Event type:', payload.eventType);
        console.log('Table:', payload.table);
        console.log('New data:', payload.new);
        console.log('Old data:', payload.old);
        
        // Refresh data when any change occurs
        fetchAppointments();
      }
    )
    .subscribe((status, err) => {
      console.log('Subscription status:', status);
      if (err) console.error('Subscription error:', err);
    });

  // Cleanup subscription
  return () => {
    console.log('Cleaning up realtime subscription');
    supabase.removeChannel(appointmentsSubscription);
  };
}, [user?.tenantId, refreshTrigger]);


  useEffect(() => {
    if (user?.tenantId) {
      checkAppointmentLimit(user.tenantId).then(setAppointmentLimits);
    }
  }, [user?.tenantId, refreshTrigger]);

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
        const n8nWebhookUrl = 'https://aishaa01.app.n8n.cloud/webhook/appointment-cancel';
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

  console.log('error', error);

  // Utility: parse date+time to timestamp
  const toTs = (d: string, t: string) => {
    const time = t?.length === 5 ? `${t}:00` : t || '00:00:00';
    return new Date(`${d}T${time}`).getTime();
  };

  // Build visible list with limit logic
  const visibleAppointments = useMemo(() => {
    if (!appointments.length) return [];

    console.log('Computing visibleAppointments:', {
      appointmentsLength: appointments.length,
      allSubscriptionsLength: allSubscriptions?.length,
      activeSubscription: activeSubscription
    });

    // If no subscriptions, show no appointments
    if (!allSubscriptions?.length) {
      console.log('No subscriptions found - showing no appointments');
      return [];
    }

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
      // Case insensitive filter matching
      const matchesFilter = filter === 'all' || 
        appointment.status.toLowerCase() === filter.toLowerCase();
      const matchesSearch = 
        appointment.customer_name.toLowerCase().includes(q) ||
        (appointment.customer_contact && appointment.customer_contact.toLowerCase().includes(q)) ||
        (appointment.booking_reference && appointment.booking_reference.toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    });
  }, [visibleAppointments, filter, searchQuery]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
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
  try {
    if (!timeString || typeof timeString !== 'string') {
      return 'N/A';
    }
    
    const parts = timeString.split(':');
    if (parts.length < 2) {
      return timeString; // Return original if it can't be parsed
    }
    
    const [hours, minutes] = parts;
    const hourNum = parseInt(hours, 10);
    const minuteStr = minutes || '00';
    
    if (isNaN(hourNum)) {
      return timeString; // Return original if hours is not a number
    }
    
    const hour12 = hourNum % 12 || 12;
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minuteStr} ${ampm}`;
  } catch (error) {
    console.error('Error formatting time:', timeString, error);
    return 'N/A';
  }
};



  // Handle view booking function
  const handleViewBooking = (appointment: Appointment) => {
    setSelectedBooking(appointment);
    setShowModal(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bookings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage Customer Bookings</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button 
           onClick={triggerRefresh} // Use triggerRefresh instead of fetchAppointments
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors mr-2"
          >
            Refresh
          </button>
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setShowNewAppointmentForm(true)}
          >
            + New Appointment
          </button>
        </div>
      </div>

      {/* Monthly booking usage box removed as requested */}

      {showNewAppointmentForm && (
        <NewAppointmentForm 
          onClose={() => setShowNewAppointmentForm(false)}
          onSuccess={() => {
            setShowNewAppointmentForm(false);
          }}
          onRefresh={triggerRefresh}
        />
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">{error}</div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex bg-red-50 dark:bg-red-900/50 rounded-md p-1.5 text-red-500 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800/50"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-200 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search by customer name, contact, or booking reference"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button 
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filter === status 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
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
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
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
                      {appointment.booking_reference && (
                        <div className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                          {appointment.booking_reference}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button 
                        onClick={() => handleViewBooking(appointment)} 
                        className="text-blue-600 hover:text-blue-900 hover:underline transition-colors"
                      >
                        View
                      </button>
                      {appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
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

      {/* Booking Detail Modal */}
      <BookingDetailModal 
        booking={selectedBooking}
        isOpen={showModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default TurfAppointmentsPage;
