import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseService';

interface TimeSlot {
  start_time: string;
  end_time: string;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const OnboardingForm: React.FC = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'doctor' | 'turf' | 'workout' | 'spa' | null>(null);
  const [bookingSystemType, setBookingSystemType] = useState<'1' | '2' | null>(null);
  const [turfName, setTurfName] = useState('');
  const [slotPrice, setSlotPrice] = useState<number>(0);
  
  // New availability schedule state
  const [availabilitySchedule, setAvailabilitySchedule] = useState<{
    [key: string]: Array<{ start_time: string; end_time: string }>;
  }>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  });
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUserTypeSelect = (type: 'doctor' | 'turf' | 'workout' | 'spa') => {
    setUserType(type);
  };

  // Add time slot to selected day
  const addTimeSlot = (day: string) => {
    setAvailabilitySchedule(prev => ({
      ...prev,
      [day]: [...prev[day], { start_time: '', end_time: '' }]
    }));
  };

  // Update time slot
  const updateTimeSlot = (
    day: string, 
    index: number, 
    field: 'start_time' | 'end_time', 
    value: string
  ) => {
    setAvailabilitySchedule(prev => ({
      ...prev,
      [day]: prev[day].map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  // Remove time slot
  const removeTimeSlot = (day: string, index: number) => {
    setAvailabilitySchedule(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }));
  };

  // Check if day has slots
  const isDayActive = (day: string) => {
    return availabilitySchedule[day]?.length > 0;
  };

  const handleNext = () => {
    // Validate current step
    if (step === 1 && !userType) {
      setError('Please select your business type');
      return;
    }
    
    if (step === 2 && !bookingSystemType) {
      setError('Please select how your booking system should handle time slots');
      return;
    }
    
    if (step === 3 && userType === 'turf' && !turfName.trim()) {
      setError('Please enter your turf name');
      return;
    }
    
    if (step === 4 && slotPrice <= 0) {
      setError('Please enter a valid slot price');
      return;
    }
    
    if (step === 5) {
      // Check if at least one day has time slots
      const hasAnySlots = Object.values(availabilitySchedule).some(slots => slots.length > 0);
      if (!hasAnySlots) {
        setError('Please add at least one time slot for any day');
        return;
      }
      
      // Check if all time slots are properly filled
      const hasIncompleteSlots = Object.values(availabilitySchedule).some(slots => 
        slots.some(slot => !slot.start_time || !slot.end_time)
      );
      if (hasIncompleteSlots) {
        setError('Please fill in all time slots or remove empty ones');
        return;
      }
    }
    
    setError(null);
    setStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Format time slots as object with day keys (NEW FORMAT)
      const timeSlotsObject: { [key: string]: TimeSlot[] } = {};
      const operatingDays: string[] = [];
      
      Object.entries(availabilitySchedule).forEach(([day, slots]) => {
        if (slots.length > 0) {
          operatingDays.push(day);
          timeSlotsObject[day] = slots;
        }
      });
      
      // Call the backend API to save onboarding data
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/onboarding/save-onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          email: user.email,
          tenantId: user.tenantId,
          businessType: userType,
          businessName: userType === 'turf' ? turfName : null,
          timeSlots: timeSlotsObject,
          operatingDays: operatingDays,
          slotPrice: slotPrice,
          bookingSystemType: bookingSystemType
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save onboarding data');
      }
      
      // Also store data in Supabase directly as a fallback
      const { error: saveError } = await supabase
        .from('business_profiles')
        .upsert({
          email: user.email,
          tenant_id: user.tenantId,
          business_type: userType,
          business_name: userType === 'turf' ? turfName : null,
          time_slots: timeSlotsObject, // Now stored as object instead of array
          operating_days: operatingDays,
          multiorsinglebooking: bookingSystemType === '1' ? 'single' : 'multi',
          slot_price: slotPrice,
          onboarding_completed: true
        }, { 
          onConflict: 'email'
        });
      
      if (saveError) throw saveError;
      
      // Also save to availability_slots table if needed - COMMENTED OUT DUE TO CONSTRAINT VIOLATION
      /*
      const availabilitySlots = Object.entries(availabilitySchedule)
        .filter(([_, slots]) => slots.length > 0)
        .flatMap(([day, slots]) => 
          slots.map(slot => ({
            tenant_id: user.tenantId,
            day_of_week: day.toLowerCase(),
            start_time: slot.start_time,
            end_time: slot.end_time,
            slot_price: slotPrice,
            is_active: true
          }))
        );
      
      if (availabilitySlots.length > 0) {
        const { error: slotsError } = await supabase
          .from('availability_slots')
          .insert(availabilitySlots);
        
        if (slotsError) throw slotsError;
      }
      */
      
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

              <button
                className={`p-6 border rounded-lg text-left ${
                  userType === 'workout' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handleUserTypeSelect('workout')}
              >
                <div className="font-medium text-lg">Health Workout Session</div>
                <p className="text-gray-600 mt-2">Manage fitness classes and workout schedules</p>
              </button>

              <button
                className={`p-6 border rounded-lg text-left ${
                  userType === 'spa' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handleUserTypeSelect('spa')}
              >
                <div className="font-medium text-lg">Spa</div>
                <p className="text-gray-600 mt-2">Manage spa treatments and wellness appointments</p>
              </button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">How should your booking system handle time slot availability?</h2>
            <div className="grid grid-cols-1 gap-4">
              <button
                className={`p-6 border rounded-lg text-left ${
                  bookingSystemType === '1' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setBookingSystemType('1')}
              >
                <div className="font-medium text-lg">1. Single Booking (Exclusive Time Slots)</div>
                <p className="text-gray-600 mt-2">Only ONE person/customer can book each time slot</p>
              </button>
              
              <button
                className={`p-6 border rounded-lg text-left ${
                  bookingSystemType === '2' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setBookingSystemType('2')}
              >
                <div className="font-medium text-lg">2. Multiple Bookings (Shared Time Slots)</div>
                <p className="text-gray-600 mt-2">MULTIPLE people/customers can book the SAME time slot</p>
              </button>
            </div>
          </div>
        );
        
      case 3:
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
          <>{setStep(4)}</>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Set Your Slot Price</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slot Price (₹)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={slotPrice}
                onChange={(e) => setSlotPrice(Number(e.target.value))}
                placeholder="Enter price per slot"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                This is the amount you'll charge for one booking slot
              </p>
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Set Your Availability</h3>
            
            {/* Day selection */}
            <div className="grid grid-cols-7 gap-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedDay === day
                      ? 'border-blue-500 bg-blue-50'
                      : isDayActive(day)
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-xs font-semibold">
                    {day.substring(0, 3)}
                  </div>
                  {isDayActive(day) && (
                    <div className="text-xs text-green-600 mt-1">
                      {availabilitySchedule[day].length} slots
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Time slots for selected day */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900">
                  {selectedDay} Time Slots
                </h4>
                <button
                  onClick={() => addTimeSlot(selectedDay)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                >
                  <span className="text-xl">+</span>
                  Add Slot
                </button>
              </div>

              {availabilitySchedule[selectedDay].length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No time slots added for {selectedDay}. Click "Add Slot" to get started.
                </p>
              ) : (
                <div className="space-y-3">
                  {availabilitySchedule[selectedDay].map((slot, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <input
                        type="time"
                        value={slot.start_time}
                        onChange={(e) => updateTimeSlot(selectedDay, index, 'start_time', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={slot.end_time}
                        onChange={(e) => updateTimeSlot(selectedDay, index, 'end_time', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg"
                      />
                      <button
                        onClick={() => removeTimeSlot(selectedDay, index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary of all days */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Summary</h5>
              <div className="text-sm text-blue-800">
                {Object.entries(availabilitySchedule)
                  .filter(([_, slots]) => slots.length > 0)
                  .map(([day, slots]) => (
                    <div key={day}>
                      <strong>{day}:</strong> {slots.length} slot(s)
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        );
        
      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Review Your Information</h2>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="mb-4">
                <div className="font-medium">Business Type:</div>
                <div>{userType === 'doctor' ? 'Doctor / Hospital Owner' : 'Turf Owner'}</div>
              </div>
              
              <div className="mb-4">
                <div className="font-medium">Booking System Type:</div>
                <div>{bookingSystemType === '1' ? 'Single Booking (Exclusive Time Slots)' : 'Multiple Bookings (Shared Time Slots)'}</div>
              </div>
              
              {userType === 'turf' && (
                <div className="mb-4">
                  <div className="font-medium">Turf Name:</div>
                  <div>{turfName}</div>
                </div>
              )}
              
              <div className="mb-4">
                <div className="font-medium">Slot Price:</div>
                <div>₹{slotPrice}</div>
              </div>
              
              <div className="mb-4">
                <div className="font-medium">Availability Schedule:</div>
                <div className="text-sm">
                  {Object.entries(availabilitySchedule)
                    .filter(([_, slots]) => slots.length > 0)
                    .map(([day, slots]) => (
                      <div key={day} className="mb-2">
                        <strong>{day}:</strong>
                        <ul className="list-disc list-inside ml-4">
                          {slots.map((slot, index) => (
                            <li key={index}>
                              {slot.start_time} - {slot.end_time}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  }
                </div>
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
              {[1, 2, 3, 4, 5, 6].map((stepNumber) => (
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
                style={{ width: `${((step - 1) / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
              {error}
            </div>
          )}

          {renderStep()}

          {step < 6 && (
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
