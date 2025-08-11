import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseService';

interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  startAmPm: 'AM' | 'PM';
  endAmPm: 'AM' | 'PM';
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const OnboardingForm: React.FC = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'doctor' | 'turf' | null>(null);
  const [turfName, setTurfName] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: 1, startTime: '', endTime: '', startAmPm: 'AM', endAmPm: 'AM' }
  ]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUserTypeSelect = (type: 'doctor' | 'turf') => {
    setUserType(type);
  };

  const addTimeSlot = () => {
    const newId = timeSlots.length > 0 ? Math.max(...timeSlots.map(slot => slot.id)) + 1 : 1;
    setTimeSlots([...timeSlots, { id: newId, startTime: '', endTime: '', startAmPm: 'AM', endAmPm: 'AM' }]);
  };

  const updateTimeSlot = (id: number, field: keyof TimeSlot, value: string | 'AM' | 'PM') => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };

  const handleNext = () => {
    // Validate current step
    if (step === 1 && !userType) {
      setError('Please select your business type');
      return;
    }
    
    if (step === 2 && userType === 'turf' && !turfName.trim()) {
      setError('Please enter your turf name');
      return;
    }
    
    if (step === 3 && timeSlots.some(slot => !slot.startTime || !slot.endTime)) {
      setError('Please fill in all time slots or remove empty ones');
      return;
    }
    
    if (step === 4 && selectedDays.length === 0) {
      setError('Please select at least one day');
      return;
    }
    
    setError(null);
    setStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Format time slots for storage
      const formattedTimeSlots = timeSlots.map(slot => ({
        start_time: `${slot.startTime} ${slot.startAmPm}`,
        end_time: `${slot.endTime} ${slot.endAmPm}`
      }));
      
      // Store data in Supabase
      const { error: saveError } = await supabase
        .from('business_profiles')
        .upsert({
          user_id: user.id,
          tenant_id: user.tenantId,
          business_type: userType,
          business_name: userType === 'turf' ? turfName : null,
          time_slots: formattedTimeSlots,
          operating_days: selectedDays,
          onboarding_completed: true
        });
      
      if (saveError) throw saveError;
      
      // Redirect based on user type
      window.location.href = userType === 'doctor' 
        ? '/dashboard' 
        : '/turf-dashboard';
        
    } catch (err: any) {
      console.error('Error saving onboarding data:', err);
      setError('Failed to save your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">What type of business do you own?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                className={`p-6 border rounded-lg text-left ${
                  userType === 'doctor' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handleUserTypeSelect('doctor')}
              >
                <div className="font-medium text-lg">Doctor / Hospital Owner</div>
                <p className="text-gray-600 mt-2">Manage patient appointments and medical records</p>
              </button>
              
              <button
                className={`p-6 border rounded-lg text-left ${
                  userType === 'turf' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handleUserTypeSelect('turf')}
              >
                <div className="font-medium text-lg">Turf Owner</div>
                <p className="text-gray-600 mt-2">Manage sports bookings and facility schedules</p>
              </button>
            </div>
          </div>
        );
        
      case 2:
        return userType === 'turf' ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">What's your turf's name?</h2>
            <div>
              <input
                type="text"
                value={turfName}
                onChange={(e) => setTurfName(e.target.value)}
                placeholder="Enter your turf name"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        ) : (
          // Skip this step for doctors and move to the next
          <>{setStep(3)}</>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">What are your booking time slots?</h2>
            <div className="space-y-4">
              {timeSlots.map((slot) => (
                <div key={slot.id} className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={slot.startTime}
                      onChange={(e) => updateTimeSlot(slot.id, 'startTime', e.target.value)}
                      placeholder="Start Time"
                      className="w-24 p-2 border border-gray-300 rounded-md"
                    />
                    <select
                      value={slot.startAmPm}
                      onChange={(e) => updateTimeSlot(slot.id, 'startAmPm', e.target.value as 'AM' | 'PM')}
                      className="ml-1 p-2 border border-gray-300 rounded-md"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                  
                  <span className="mx-2">to</span>
                  
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={slot.endTime}
                      onChange={(e) => updateTimeSlot(slot.id, 'endTime', e.target.value)}
                      placeholder="End Time"
                      className="w-24 p-2 border border-gray-300 rounded-md"
                    />
                    <select
                      value={slot.endAmPm}
                      onChange={(e) => updateTimeSlot(slot.id, 'endAmPm', e.target.value as 'AM' | 'PM')}
                      className="ml-1 p-2 border border-gray-300 rounded-md"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addTimeSlot}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add New Time Slot
              </button>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">
              How many days in a week do you want to let customers book appointments?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`p-3 border rounded-md ${
                    selectedDays.includes(day)
                      ? 'bg-blue-100 border-blue-500 text-blue-800'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Review Your Information</h2>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="mb-4">
                <div className="font-medium">Business Type:</div>
                <div>{userType === 'doctor' ? 'Doctor / Hospital Owner' : 'Turf Owner'}</div>
              </div>
              
              {userType === 'turf' && (
                <div className="mb-4">
                  <div className="font-medium">Turf Name:</div>
                  <div>{turfName}</div>
                </div>
              )}
              
              <div className="mb-4">
                <div className="font-medium">Time Slots:</div>
                <ul className="list-disc list-inside">
                  {timeSlots.map((slot, index) => (
                    <li key={index}>
                      {slot.startTime} {slot.startAmPm} - {slot.endTime} {slot.endAmPm}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-4">
                <div className="font-medium">Operating Days:</div>
                <div>{selectedDays.join(', ')}</div>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Complete Setup'}
            </button>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">
          Welcome to Your Business Setup
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Let's get your account set up in just a few steps
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4, 5].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    stepNumber === step
                      ? 'bg-blue-600 text-white'
                      : stepNumber < step
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {stepNumber}
                </div>
              ))}
            </div>
            <div className="overflow-hidden h-2 rounded-full bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((step - 1) / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
              {error}
            </div>
          )}

          {renderStep()}

          {step < 5 && (
            <div className="mt-6 flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(prev => prev - 1)}
                  className="text-gray-700 hover:text-gray-900"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="ml-auto bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;
