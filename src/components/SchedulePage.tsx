import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseService';

interface TenantIntegration {
  id: string;
  tenant_id: string;
  provider: string;
  integration_data: {
    calendar_id?: string;
    access_token?: string;
    refresh_token?: string;
  };
}

const SchedulePage: React.FC = () => {
  const { tenant, user } = useAuth();
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalendarId = async () => {
      if (!tenant?.id) {
        setError('No tenant information available');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('tenant_integrations')
          .select('integration_data')
          .eq('tenant_id', tenant.id)
          .single();

        if (error) throw error;

        if (data && data.integration_data && data.integration_data.calendar_id) {
          setCalendarId(data.integration_data.calendar_id);
        } else {
          setError('No Google Calendar integration found. Please connect your Google Calendar in Settings.');
        }
      } catch (err: any) {
        console.error('Error fetching calendar ID:', err.message || err);
        setError('Failed to fetch calendar ID. Please check your Google Calendar integration in Settings.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarId();
  }, [tenant?.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading calendar...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  const calendarSrc = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId || '')}&ctz=Asia%2FKolkata`;
  const openCalendarUrl = `https://calendar.google.com/calendar/u/0/r?cid=${calendarId}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Schedule</h1>
          <p className="text-gray-600">View and manage your calendar </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="responsive-calendar-container" style={{ position: 'relative', paddingBottom: '75%', height: 0, overflow: 'hidden' }}>
          <iframe 
            src={calendarSrc}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            frameBorder="0"
            scrolling="no"
            title="Google Calendar"
          ></iframe>
        </div>
      </div>

      <div className="flex justify-end">
        <a 
          href={openCalendarUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          Open in Google Calendar ↗
          <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default SchedulePage;