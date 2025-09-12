import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseService';

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
  const { user } = useAuth();

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.tenantId || !user?.id) return;
      try {
        setIsLoading(true);
        // Today's YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];

        // Fetch total appointments for doctor
        const { count: totalCount, error: totalError } = await supabase
          .from('Appointments')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenantId)
          .eq('doctor_id', user.id);
        if (totalError) throw totalError;
        setTotalAppointments(totalCount || 0);

        // Fetch total revenue for doctor
        const { data: revenueData, error: revenueError } = await supabase
          .from('Appointments')
          .select('amount')
          .eq('tenant_id', user.tenantId)
          .eq('doctor_id', user.id);
        if (revenueError) throw revenueError;
        const revenue = revenueData?.reduce((sum, a) => sum + (a.amount || 0), 0) || 0;
        setTotalRevenue(revenue);

        // Fetch staff count for tenant (doctors + employees)
        const { count: staffCountResult, error: staffError } = await supabase
          .from('Users')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenantId)
          .in('role', ['DOCTOR', 'EMPLOYEE']);
        if (staffError) throw staffError;
        setStaffCount(staffCountResult || 0);

        // Dummy transactions and appointments
        const sampleTransactions = [
          { patient: 'Patient 1', timestamp: '12/09/2025', amount: 500 },
          { patient: 'Patient 2', timestamp: '12/09/2025', amount: 1000 },
          { patient: 'Patient 3', timestamp: '12/09/2025', amount: 1500 }
        ];
        setTransactions(sampleTransactions);

        const sampleAppointments = [
          { patient: 'Patient 1', time: 'Today, 2:00 PM', status: 'Confirmed' },
          { patient: 'Patient 2', time: 'Today, 2:00 PM', status: 'Confirmed' },
          { patient: 'Patient 3', time: 'Today, 2:00 PM', status: 'Confirmed' }
        ];
        setAppointments(sampleAppointments);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [user?.tenantId, user?.id]);

  return (
    <div className="grid grid-cols-12 gap-3 max-w-6xl mx-auto w-full">
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
            {isLoading ? <div className="animate-pulse h-12 w-24 bg-gray-700 rounded"></div> : totalAppointments}
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
            {isLoading ? <div className="animate-pulse h-12 w-24 bg-gray-700 rounded"></div> : staffCount}
          </div>
        </div>
      </div>

      <div className="col-span-12 sm:col-span-6 md:col-span-3 h-40 bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 flex items-center justify-center cursor-pointer hover:bg-white hover:bg-opacity-20 transition-all">
        <div className="relative w-20 h-20">
          <div className="absolute top-1/2 left-0 w-full h-2 bg-white transform -translate-y-1/2"></div>
          <div className="absolute left-1/2 top-0 w-2 h-full bg-white transform -translate-x-1/2"></div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="col-span-6">
        <div className="bg-black bg-opacity-60 backdrop-blur-md rounded-xl p-5 h-full">
          <div className="flex justify-between items-center mb-2">
            <div className="text-lg font-medium text-white">Recent Transactions</div>
            <div className="text-sm text-gray-400">View All</div>
          </div>
          <div className="space-y-3">
            {isLoading ? (
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

      {/* UPCOMING APPOINTMENTS */}
      <div className="col-span-6">
        <div className="bg-white bg-opacity-60 backdrop-blur-md rounded-xl p-4 h-full">
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-medium text-black">Upcoming Appointments</div>
            <div className="text-sm text-gray-400">View All</div>
          </div>
          {isLoading ? (
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
