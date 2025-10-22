import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseService';
import NewAppointmentForm from '../NewAppointmentForm';

// Data Interfaces
interface Transaction {
  patient: string;
  timestamp: string;
  amount: number;
}
interface Appointment {
  patient: string;
  time: string;
  status: string;
}

const DoctorDashboard: React.FC = () => {
  const { user, tenant } = useAuth();

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalappointments, setTotalappointments] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [appointments, setappointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.tenantId || !user?.id) return;
      try {
        setIsLoading(true);
        // Today's YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];

        // Fetch total appointments for entire tenant from both tables
        // First, get count from appointments table
        const { count: doctorappointmentsCount, error: doctorappointmentsError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenantId);
        if (doctorappointmentsError) throw doctorappointmentsError;
        
        // Then, get count from TurfAppointments table
        const { count: TurfAppointmentsCount, error: TurfAppointmentsError } = await supabase
          .from('TurfAppointments')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenantId);
        if (TurfAppointmentsError) throw TurfAppointmentsError;
        
        // Calculate total appointments from both sources
        const totalTenantappointments = (doctorappointmentsCount || 0);
        setTotalappointments(totalTenantappointments);

        // Fetch total revenue for entire tenant from both appointments and TurfAppointments tables
        // First, get revenue from appointments table
        const { data: doctorRevenueData, error: doctorRevenueError } = await supabase
          .from('appointments')
          .select('amount')
          .eq('tenant_id', user.tenantId);
        if (doctorRevenueError) throw doctorRevenueError;
        
        // Then, get revenue from TurfAppointments table
        // const { data: turfRevenueData, error: turfRevenueError } = await supabase
        //   .from('TurfAppointments')
        //   .select('amount')
        //   .eq('tenant_id', user.tenantId);
        // if (turfRevenueError) throw turfRevenueError;
        
        // Calculate total revenue from both sources
        const doctorRevenue = doctorRevenueData?.reduce((sum, a) => sum + (a.amount || 0), 0) || 0;
        // const turfRevenue = turfRevenueData?.reduce((sum, a) => sum + (a.amount || 0), 0) || 0;
        const totalTenantRevenue = doctorRevenue ;
        
        setTotalRevenue(totalTenantRevenue);

        // Fetch staff count for tenant (doctors + employees)
        const { count: staffCountResult, error: staffError } = await supabase
          .from('approved_users')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenantId)
          .in('role', ['DOCTOR', 'EMPLOYEE']);
        if (staffError) throw staffError;
        setStaffCount(staffCountResult || 0);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [user?.tenantId, user?.id]);
  
  // Fetch recent transactions
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      if (!user?.tenantId) return;
      
      try {
        setTransactionsLoading(true);
        
        const { data, error } = await supabase
          .from('appointments')
          .select('id, patient_name, appointment_date, amount, status')
          .eq('tenant_id', user.tenantId)
          .not('amount', 'is', null)
          .order('appointment_date', { ascending: false })
          .limit(3);
        
        if (error) throw error;
        
        // Format the data for display
        const formattedTransactions = data?.map(item => {
          // Convert UTC date to IST for display
          const date = new Date(item.appointment_date);
          const istOffset = 5.5 * 60 * 60 * 1000;
          const istDate = new Date(date.getTime() + istOffset);
          
          const formattedDate = istDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          
          return {
            patient: item.patient_name,
            timestamp: formattedDate,
            amount: item.amount || 0
          };
        }) || [];
        
        setTransactions(formattedTransactions);
      } catch (err: any) {
        console.error('Error fetching recent transactions:', err);
      } finally {
        setTransactionsLoading(false);
      }
    };
    
    fetchRecentTransactions();
  }, [user?.tenantId]);
  
  // Fetch upcoming appointments
  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      if (!user?.tenantId) return;
      
      try {
        setAppointmentsLoading(true);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data, error } = await supabase
          .from('appointments')
          .select('id, patient_name, appointment_date, appointment_time, status')
          .eq('tenant_id', user.tenantId)
          .gte('appointment_date', today.toISOString().split('T')[0])
          .eq('status', 'Scheduled')
          .order('appointment_date', { ascending: true })
          .order('appointment_time', { ascending: true })
          .limit(3);
        
        if (error) throw error;
        
        // Format the data for display
        const formattedAppointments = data?.map(item => {
          // Check if the appointment is today
          const appointmentDate = new Date(item.appointment_date);
          const isToday = appointmentDate.toDateString() === today.toDateString();
          
          // Format the time (assuming appointment_time is in HH:MM format)
          const timeParts = item.appointment_time.split(':');
          const hours = parseInt(timeParts[0]);
          const minutes = timeParts[1];
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const formattedHours = hours % 12 || 12;
          const formattedTime = `${formattedHours}:${minutes} ${ampm}`;
          
          // Format the date display
          const dateDisplay = isToday ? 'Today' : appointmentDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          
          return {
            patient: item.patient_name,
            time: `${dateDisplay}, ${formattedTime}`,
            status: 'Confirmed'
          };
        }) || [];
        
        setappointments(formattedAppointments);
      } catch (err: any) {
        console.error('Error fetching upcoming appointments:', err);
      } finally {
        setAppointmentsLoading(false);
      }
    };
    
    fetchUpcomingAppointments();
  }, [user?.tenantId]);

  return (
    <div className="grid grid-cols-12 gap-3 max-w-6xl mx-auto w-full">
      {/* Welcome Message */}
      <div className="col-span-12 mb-4">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold text-white">Welcome back,</h1>
          <h1 className="text-3xl font-bold text-white ml-2">{user?.name || 'Aisha'}</h1>
          <span className="text-3xl ml-2">👋🏻</span>
        </div>
      </div>
      {/* STATS CARDS */}
      <div className="col-span-12 sm:col-span-6 md:col-span-3 h-40 bg-white bg-opacity-60 backdrop-blur-md rounded-xl p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-medium text-black">Revenue</div>
          <div className="bg-white bg-opacity-10 px-2 py-1 rounded-full text-xs text-gray-300">Total earnings</div>
        </div>
        <div className="mt-auto mb-2 self-start">
          <div className="text-6xl font-bold text-black">
            {isLoading ? <div className="animate-pulse h-12 w-32 bg-gray-700 rounded"></div> : `₹${totalRevenue.toLocaleString()}`}
          </div>
        </div>
      </div>

      <div className="col-span-12 sm:col-span-6 md:col-span-3 h-40 bg-black bg-opacity-60 backdrop-blur-md rounded-xl p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-medium text-white">Bookings</div>
          <div className="bg-white bg-opacity-10 px-2 py-1 rounded-full text-xs text-gray-300">All time</div>
        </div>
        <div className="mt-auto mb-2 self-start">
          <div className="text-6xl font-bold text-white">
            {isLoading ? <div className="animate-pulse h-12 w-24 bg-gray-700 rounded"></div> : totalappointments}
          </div>
        </div>
      </div>

      <div className="col-span-12 sm:col-span-6 md:col-span-3 h-40 bg-black bg-opacity-60 backdrop-blur-md rounded-xl p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-medium text-white">Staff</div>
          <div className="bg-white bg-opacity-10 px-2 py-1 rounded-full text-xs text-gray-300">Total</div>
        </div>
        <div className="mt-auto mb-2 self-start">
          <div className="text-6xl font-bold text-white">
            {isLoading ? <div className="animate-pulse h-12 w-24 bg-gray-700 rounded"></div> : 3}
          </div>
        </div>
      </div>

      <div 
        className="col-span-12 sm:col-span-6 md:col-span-3 h-40 bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 flex items-center justify-center cursor-pointer hover:bg-white hover:bg-opacity-20 transition-all"
        onClick={() => setShowNewAppointmentForm(true)}
      >
        <div className="relative w-20 h-20">
          <div className="absolute top-1/2 left-0 w-full h-2 bg-white transform -translate-y-1/2"></div>
          <div className="absolute left-1/2 top-0 w-2 h-full bg-white transform -translate-x-1/2"></div>
        </div>
      </div>
      
      {showNewAppointmentForm && (
        <NewAppointmentForm
          onClose={() => setShowNewAppointmentForm(false)}
          onSuccess={() => {
            setShowNewAppointmentForm(false);
            // Refresh appointments after adding a new one
            const fetchUpcomingAppointments = async () => {
              if (!user?.tenantId) return;
              
              try {
                setAppointmentsLoading(true);
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const { data, error } = await supabase
                  .from('appointments')
                  .select('id, patient_name, appointment_date, appointment_time, status')
                  .eq('tenant_id', user.tenantId)
                  .gte('appointment_date', today.toISOString().split('T')[0])
                  .eq('status', 'Scheduled')
                  .order('appointment_date', { ascending: true })
                  .order('appointment_time', { ascending: true })
                  .limit(3);
                
                if (error) throw error;
                
                // Format the data for display
                const formattedAppointments = data?.map(item => {
                  // Check if the appointment is today
                  const appointmentDate = new Date(item.appointment_date);
                  const isToday = appointmentDate.toDateString() === today.toDateString();
                  
                  // Format the time (assuming appointment_time is in HH:MM format)
                  const timeParts = item.appointment_time.split(':');
                  const hours = parseInt(timeParts[0]);
                  const minutes = timeParts[1];
                  const ampm = hours >= 12 ? 'PM' : 'AM';
                  const formattedHours = hours % 12 || 12;
                  const formattedTime = `${formattedHours}:${minutes} ${ampm}`;
                  
                  // Format the date display
                  const dateDisplay = isToday ? 'Today' : appointmentDate.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  });
                  
                  return {
                    patient: item.patient_name,
                    time: `${dateDisplay}, ${formattedTime}`,
                    status: 'Confirmed'
                  };
                }) || [];
                
                setappointments(formattedAppointments);
              } catch (err: any) {
                console.error('Error fetching upcoming appointments:', err);
              } finally {
                setAppointmentsLoading(false);
              }
            };
            
            fetchUpcomingAppointments();
          }}
        />
      )}

      {/* RECENT TRANSACTIONS */}
      <div className="col-span-6">
        <div className="bg-black bg-opacity-60 backdrop-blur-md rounded-xl p-5 h-full">
          <div className="flex justify-between items-center mb-2">
            <div className="text-lg font-medium text-white">Recent Transactions</div>
            <div className="text-sm text-gray-400">View All</div>
          </div>
          <div className="space-y-3">
            {transactionsLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-700 mr-3"></div>
                    <div>
                      <div className="h-4 w-24 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 w-16 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                  <div className="h-4 w-16 bg-gray-700 rounded"></div>
                </div>
              ))
            ) : transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs mr-3">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div>
                      <div className="text-xl text-white">{transaction.patient}</div>
                      <div className="text-sm text-gray-400">{transaction.timestamp}</div>
                    </div>
                  </div>
                  <div className="text-xl text-white">₹{transaction.amount}</div>
                </div>
              ))
            ) : (
              <div className="text-gray-400">No transactions found</div>
            )}
          </div>
        </div>
      </div>

      {/* UPCOMING appointments */}
      <div className="col-span-6">
        <div className="bg-white bg-opacity-60 backdrop-blur-md rounded-xl p-4 h-full">
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-medium text-black">Upcoming Appointments</div>
            <div className="text-sm text-gray-400">View All</div>
          </div>
          {appointmentsLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : appointments.length > 0 ? (
            appointments.map((appointment, index) => (
              <div key={index} className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xl text-black">{appointment.patient}</div>
                  <div className="text-sm text-gray-500">{appointment.time}</div>
                </div>
                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {appointment.status}
                </div>
              </div>
            ))
          ) : (
            <div className="h-[calc(100%-2rem)] flex items-center justify-center">
              <div className="text-gray-500 text-xl">No appointments scheduled</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
