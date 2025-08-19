import React, { useState, useEffect } from 'react';
// Adjust these paths based on your actual project structure
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseService';

interface Transaction {
  id: string;
  customer_name: string;
  appointment_date: string;
  payment_method: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  customer_contact?: string;
  booking_reference?: string;
}

interface RevenueMetrics {
  revenue: number;
  bookings: number;
  period: string;
  dateRange: string;
}

type FilterType = 'daily' | 'weekly' | 'monthly' | 'custom';

const TurfRevenuePage: React.FC = () => {
  const { tenant, user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    revenue: 0,
    bookings: 0,
    period: 'Today',
    dateRange: ''
  });
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('daily');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRevenueData();
  }, [selectedFilter, customDateRange]);

  const getDateRange = () => {
    const now = new Date();
    
    switch (selectedFilter) {
      case 'daily':
        // Today from 00:00:00 to 23:59:59
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        return {
          startDate: todayStart,
          endDate: todayEnd,
          label: 'Today',
          dateRange: `${todayStart.toLocaleDateString('en-IN')}`
        };
        
      case 'weekly':
        // Last 7 days including today
        const weekStart = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000); // 6 days ago + today = 7 days
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(now);
        weekEnd.setHours(23, 59, 59, 999);
        return {
          startDate: weekStart,
          endDate: weekEnd,
          label: 'Last 7 Days',
          dateRange: `${weekStart.toLocaleDateString('en-IN')} - ${weekEnd.toLocaleDateString('en-IN')}`
        };
        
      case 'monthly':
        // Last 30 days including today
        const monthStart = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000); // 29 days ago + today = 30 days
        monthStart.setHours(0, 0, 0, 0);
        const monthEnd = new Date(now);
        monthEnd.setHours(23, 59, 59, 999);
        return {
          startDate: monthStart,
          endDate: monthEnd,
          label: 'Last 30 Days',
          dateRange: `${monthStart.toLocaleDateString('en-IN')} - ${monthEnd.toLocaleDateString('en-IN')}`
        };
        
      case 'custom':
        if (customDateRange.startDate && customDateRange.endDate) {
          const start = new Date(customDateRange.startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(customDateRange.endDate);
          end.setHours(23, 59, 59, 999);
          return {
            startDate: start,
            endDate: end,
            label: 'Custom Range',
            dateRange: `${customDateRange.startDate} - ${customDateRange.endDate}`
          };
        }
        // Fallback to today
        const fallbackStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const fallbackEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        return {
          startDate: fallbackStart,
          endDate: fallbackEnd,
          label: 'Custom Range (Select Dates)',
          dateRange: 'Please select dates'
        };
        
      default:
        const defaultStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const defaultEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        return {
          startDate: defaultStart,
          endDate: defaultEnd,
          label: 'Today',
          dateRange: `${defaultStart.toLocaleDateString('en-IN')}`
        };
    }
  };

  const fetchRevenueData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const dateRange = getDateRange();
      
      // Debug logging (remove in production)
      console.log('Revenue Query Debug:', {
        filter: selectedFilter,
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
        label: dateRange.label
      });
      
      const { data: periodTransactions, error: transactionError } = await supabase
  .from('TurfAppointments')
  .select(`
    id,
    customer_name,
    customer_contact,
    appointment_date,
    payment_method,
    amount,
    currency,
    status,
    created_at,
    booking_reference
  `).gte('appointment_date', dateRange.startDate.toISOString()) // Filter by booking_date instead of created_at
    .lte('appointment_date', dateRange.endDate.toISOString())
    .not('amount', 'is', null)
    .order('appointment_date', { ascending: false }); // Remove date and status filters temporarily

      // Fetch all transactions for the selected period
      // const { data: periodTransactions, error: transactionError } = await supabase
      //   .from('bookings')
      //   .select(`
      //     id,
      //     customer_name,
      //     customer_contact,
      //     booking_date,
      //     payment_method,
      //     amount,
      //     currency,
      //     status,
      //     created_at,
      //     booking_reference
      //   `)
      //   .in('status', ['scheduled', 'completed', 'paid']) // Include all relevant statuses
      //   .not('amount', 'is', null)
      //   .gte('booking_date', dateRange.startDate.toISOString()) // Filter by booking_date instead of created_at
      //   .lte('booking_date', dateRange.endDate.toISOString())
      //   .order('booking_date', { ascending: false });

      console.log('periodTransactions:', periodTransactions);

      if (transactionError) {
        console.error('Supabase Query Error:', transactionError);
        throw transactionError;
      }

      console.log('Query Results:', {
        totalFound: periodTransactions?.length || 0,
        transactions: periodTransactions,
        query: {
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString(),
          statuses: ['scheduled', 'completed', 'paid']
        }
      });

      // Additional debug for each transaction
      if (periodTransactions && periodTransactions.length > 0) {
        console.log('First transaction:', {
          id: periodTransactions[0].id,
          date: periodTransactions[0].appointment_date,
          amount: periodTransactions[0].amount,
          status: periodTransactions[0].status
        });
      } else {
        console.log('No transactions found. Checking for any bookings in the table...');
        
        // Try a broader query to see if there are any bookings at all
        const { data: anyTurfAppointments } = await supabase
          .from('TurfAppointments')
          .select('id, appointment_date, amount, status')
          .not('amount', 'is', null)
          .limit(5);
          
        console.log('Sample of available bookings:', anyTurfAppointments);
      }


      // Set all transactions for the period
      setAllTransactions(periodTransactions || []);

      console.log('allTransactions:', allTransactions);
      
      // Set recent transactions (all transactions for the period, not limited to 5)
      setTransactions(periodTransactions || []);

      // Calculate metrics for the selected period
      calculateMetrics(periodTransactions || [], dateRange);

    } catch (err: any) {
      console.error('Error fetching revenue data:', err);
      setError(`Failed to load revenue data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMetrics = (data: Transaction[], dateRange: any) => {
    const totalRevenue = data.reduce((sum: number, item: Transaction) => sum + (item.amount || 0), 0);
    const totalbookings = data.length;

    setMetrics({
      revenue: totalRevenue,
      bookings: totalbookings,
      period: dateRange.label,
      dateRange: dateRange.dateRange
    });
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSourceBadge = (method: string) => {
    const methodLower = method?.toLowerCase() || '';
    if (methodLower.includes('upi')) return 'UPI';
    if (methodLower.includes('card')) return 'Card';
    if (methodLower.includes('netbanking')) return 'Net Banking';
    if (methodLower.includes('wallet')) return 'Wallet';
    if (methodLower.includes('cash')) return 'Cash';
    return 'Online';
  };

  const getSourceColor = (method: string) => {
    const methodLower = method?.toLowerCase() || '';
    if (methodLower.includes('upi')) return 'bg-blue-100 text-blue-800';
    if (methodLower.includes('card')) return 'bg-green-100 text-green-800';
    if (methodLower.includes('netbanking')) return 'bg-purple-100 text-purple-800';
    if (methodLower.includes('wallet')) return 'bg-yellow-100 text-yellow-800';
    if (methodLower.includes('cash')) return 'bg-gray-100 text-gray-800';
    return 'bg-blue-100 text-blue-800';
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setCustomDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilterChange = (filter: FilterType) => {
    setSelectedFilter(filter);
    if (filter !== 'custom') {
      setCustomDateRange({ startDate: '', endDate: '' });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="ml-4 text-gray-600">Loading revenue data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Revenue Dashboard</h1>
          <p className="text-gray-600">Track revenue and financial metrics for {tenant?.name || 'your organization'}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={() => fetchRevenueData()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <div className="flex">
            <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Date Filter Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-3 block">Filter by Period</label>
            <div className="flex flex-wrap gap-3">
              {(['daily', 'weekly', 'monthly', 'custom'] as FilterType[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterChange(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedFilter === filter
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  {filter === 'daily' && ' (Today)'}
                  {filter === 'weekly' && ' (7 Days)'}
                  {filter === 'monthly' && ' (30 Days)'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Custom Date Range Inputs */}
          {selectedFilter === 'custom' && (
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Start Date</label>
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">End Date</label>
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                  min={customDateRange.startDate}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Revenue Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue for Selected Period */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue - {metrics.period}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(metrics.revenue)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                From {metrics.bookings} bookings
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {metrics.dateRange}
              </p>
            </div>
            <div className="flex items-center text-green-600">
              <svg className="w-6 h-6 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Average per appointment */}
        <div className="bg-white rounded-lg shadow p-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Average per appointment</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {metrics.bookings > 0 
                ? formatCurrency(Math.round(metrics.revenue / metrics.bookings))
                : formatCurrency(0)
              }
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {selectedFilter} average
            </p>
          </div>
        </div>

        {/* Transaction Count */}
        <div className="bg-white rounded-lg shadow p-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {metrics.bookings}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {metrics.period}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Transactions - {metrics.period}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {metrics.dateRange}
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500">
                Showing all {transactions.length} transactions
              </span>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(metrics.revenue)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">No transactions found for the selected period</p>
                      <p className="text-xs text-gray-400 mt-1">{metrics.dateRange}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((transaction, index) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">
                        {formatDateOnly(transaction.appointment_date)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.appointment_date).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.customer_name}
                      </div>
                      {transaction.customer_contact && (
                        <div className="text-xs text-gray-500">
                          {transaction.customer_contact}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      General Consultation
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSourceColor(transaction.payment_method)}`}>
                        {getSourceBadge(transaction.payment_method)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      <div className="font-semibold">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs text-gray-500">
                      {transaction.booking_reference && (
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {transaction.booking_reference.substring(0, 12)}...
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      {metrics.bookings > 0 && (
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Period</p>
              <p className="text-lg font-semibold text-gray-900">{metrics.period}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total bookings</p>
              <p className="text-lg font-semibold text-gray-900">{metrics.bookings}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(metrics.revenue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average per Transaction</p>
              <p className="text-lg font-semibold text-gray-900">
                {metrics.bookings > 0 ? formatCurrency(Math.round(metrics.revenue / metrics.bookings)) : '₹0'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TurfRevenuePage;
