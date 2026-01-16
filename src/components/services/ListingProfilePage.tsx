import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ImageCarousel from './ImageCarousel';
import { useCart } from '../../context/CartContext';
import { Star, MapPin, ExternalLink, Map as MapIcon } from 'lucide-react';
import { supabase } from '../../services/supabaseService';

type Profile = {
  name: string;
  images: string[];
  description: string;
  facilities: string[];
  hours: string;
  pricing: string;
  contact: { phone?: string; email?: string; address?: string };
  ratingScore?: number;
  ratingCount?: number;
  mapUrl?: string;
};

const sampleProfiles: Record<string, Record<string, Record<string, Profile>>> = {
  'sports-venues': {
    'cricket-pitch': {
      'cp-1': {
        name: 'Tiento Sports',
        images: ['/tiento.png'],
        description: 'Multi-sport venue with bookable slots.',
        facilities: ['Floodlights', 'Locker Rooms'],
        hours: '6 AM – 10 PM',
        pricing: '₹700 per hour',
        contact: { phone: '+91 8619439126', address: 'Mission Road · 1.1 km' },
        ratingScore: 4.5,
        ratingCount: 120,
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Tiento+Sports+Mission+Road+Bengaluru',
      },
      'cp-2': {
        name: 'Fusion – The Turf',
        images: ['c2.png'],
        description: 'Synthetic turf venue for games and practice.',
        facilities: ['Floodlights'],
        hours: '7 AM – 9 PM',
        pricing: '₹600 per hour',
        contact: { phone: '+91 8619439126', address: 'Next to KSH · 1.1 km' },
        ratingScore: 4.3,
        ratingCount: 85,
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Fusion+The+Turf+Bengaluru',
      },
      'cp-3': {
        name: 'Karnataka Sharks Cricket',
        images: ['c3.png'],
        description: 'Cricket facility with bookable nets and training.',
        facilities: ['Coaching'],
        hours: '6 AM – 9 PM',
        pricing: '₹650 per hour',
        contact: { phone: '+91 8619439126', address: 'BCVL · 1.4 km' },
        ratingScore: 4.7,
        ratingCount: 42,
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Karnataka+Sharks+Cricket+Bengaluru',
      },
      'cp-4': {
        name: 'Basecamp by Push Sports – Bengaluru',
        images: ['c4.png'],
        description: 'Sports venue offering bookable practice slots.',
        facilities: ['Parking', 'Water'],
        hours: '6 AM – 10 PM',
        pricing: '₹500 per hour',
        contact: { phone: '+91 8619439126', address: 'Palace Road · 1.4 km' },
        ratingScore: 4.6,
        ratingCount: 95,
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Basecamp+by+Push+Sports+Bengaluru',
      },
      'cp-5': {
        name: 'Basecamp Football by Rush Arena',
        images: ['c5.png'],
        description: 'Football turf at Bengaluru City University.',
        facilities: ['Locker Rooms', 'Floodlights'],
        hours: '6 AM – 11 PM',
        pricing: '₹900 per hour',
        contact: { phone: '+91 8619439126', address: 'Bengaluru City Univ · 1.5 km' },
        ratingScore: 4.4,
        ratingCount: 110,
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Basecamp+Football+Rush+Arena+Bengaluru',
      },
    },
    'football-turf': {
      'ft-1': {
        name: 'Bangalore Football Turf',
        images: ['f1.png'],
        description: 'Soccer field with bookable slots.',
        facilities: ['Night Lighting'],
        hours: '7 AM – 11 PM',
        pricing: '₹1200 per hour',
        contact: { phone: '+91 8619439126', address: 'Royal Towers, Hennur Ring' },
        ratingScore: 4.5,
        ratingCount: 230,
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Bangalore+Football+Turf+Hennur+Ring',
      },
      'ft-2': {
        name: 'Bangalore Turf Club Ltd.',
        images: ['f2.png'],
        description: 'Racecourse venue.',
        facilities: ['Locker Rooms'],
        hours: '7 AM – 11 PM',
        pricing: '₹1500 per hour',
        contact: { phone: '+91 8619439126', address: 'Race Course Rd' },
        ratingScore: 4.1,
        ratingCount: 340,
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Bangalore+Turf+Club+Race+Course+Rd',
      },
      'ft-3': {
        name: 'Turf City Sports',
        images: ['f3.png'],
        description: 'Sports complex turf.',
        facilities: ['Night Lighting', 'Parking'],
        hours: '8 AM – 10 PM',
        pricing: '₹1300 per hour',
        contact: { phone: '+91 8619439126', address: 'BBL Layout Main Rd' },
        ratingScore: 4.2,
        ratingCount: 88,
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Turf+City+Sports+Bengaluru',
      },
    },
    'pickleball': {
      'pb-1': {
        name: 'PicknPadel Arena – Padel & Pickleball',
        images: ['p1.png'],
        description: 'Padel & Pickleball sports complex.',
        facilities: ['Coaching', 'Pro Shop'],
        hours: '8 AM – 10 PM',
        pricing: '₹800 per hour',
        contact: { phone: '+91 8619439126', address: 'Begur' },
        ratingScore: 4.8,
        ratingCount: 45,
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=PicknPadel+Arena+Begur',
      },
      'pb-2': {
        name: 'PowerPickle',
        images: ['p2.png'],
        description: 'Pickleball courts with equipment rental.',
        facilities: ['Equipment Rental', 'Parking'],
        hours: '8 AM – 10 PM',
        pricing: '₹850 per hour',
        contact: { phone: '+91 8619439126', address: 'Vistar Resorts & Hotels' },
        ratingScore: 4.7,
        ratingCount: 32,
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=PowerPickle+Bengaluru',
      },
      'pb-3': {
        name: 'Go Picklers',
        images: ['p3.png'],
        description: 'Pickleball courts with coaching.',
        facilities: ['Coaching', 'Parking'],
        hours: '8 AM – 10 PM',
        pricing: '₹800 per hour',
        contact: { phone: '+91 8619439126', address: '2nd Main Rd' },
        ratingScore: 4.6,
        ratingCount: 28,
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Go+Picklers+Bengaluru',
      },
    },
  },
  gyms: {
    'fun-workout': {
      'fw-1': {
        name: 'Fit and Gold Gym',
        images: ['/fng.png'],
        description: 'Neighborhood gym with weights and cardio equipment.',
        facilities: ['Zumba', 'Floor exercise', 'Weights', 'Cardio', 'Trainer'],
        hours: '6 AM – 10 PM',
        pricing: '₹130 per session',
        contact: { phone: '+91 96605 55556', address: 'Raja Park, Jaipur' },
        ratingScore: 4.6,
        ratingCount: 62,
        mapUrl: 'https://maps.app.goo.gl/UQ23zD8tttmBw7a59',
      },
      'fw-2': {
        name: 'Group NATURE Fun workout',
        images: ['/parkyoga.jpg'],
        description: 'Outdoor group workout in nature at Bhagat Singh Park.',
        facilities: ['Outdoor', 'Group workout', 'Bodyweight', 'REFRESHMENTS'],
        hours: '7 AM – 9 AM',
        pricing: '₹99 per session [2 hrs]',
        contact: { phone: '+91 96605 55556', address: 'Bhagat Singh Park · Raja Park, Jaipur' },
        ratingScore: 4.6,
        ratingCount: 124,
        mapUrl: 'https://maps.app.goo.gl/ZEN5VZiqNUvffwBY6',
      },
      'fw-3': {
        name: 'Group workout & MUSICAL YOGA',
        images: ['/images/services/service-2.jpg', '/parkyoga.jpg'],
        description: 'Group workout and musical yoga at Central Park.',
        facilities: ['Yoga Mats', 'Music', 'Instructor'],
        hours: '6 AM – 9 AM',
        pricing: '₹99 per session',
        contact: { phone: '+91 8619439126', address: 'Central Park, Jaipur' },
        ratingScore: 4.7,
        ratingCount: 45,
        mapUrl: 'https://maps.app.goo.gl/q98nuD9JkPzT4yFJA',
      },
      'fw-4': {
        name: 'Eco Fitness dance',
        images: ['/dancecp.png'],
        description: 'Eco-friendly fitness dance session in the park.',
        facilities: ['Dance', 'Outdoor', 'Music'],
        hours: '5 PM – 7 PM',
        pricing: '₹99 per session',
        contact: { phone: '+91 8619439126', address: 'Central Park, Jaipur' },
        ratingScore: 4.6,
        ratingCount: 24878,
        mapUrl: 'https://maps.app.goo.gl/q98nuD9JkPzT4yFJA',
      },
      'fw-5': {
        name: 'RELAXING MEDITATION IN NATURE',
        images: ['/meditation.png'],
        description: 'Relaxing guided meditation in nature at Central Park.',
        facilities: ['Guided Meditation', 'Outdoor'],
        hours: '6 AM – 7 AM',
        pricing: '₹99 per session',
        contact: { phone: '+91 8619439126', address: 'Central Park, Jaipur' },
        ratingScore: 4.5,
        ratingCount: 24878,
        mapUrl: 'https://maps.app.goo.gl/q98nuD9JkPzT4yFJA',
      },
      'fw-6': {
        name: 'Sweatbox Gym',
        images: ['https://lh3.googleusercontent.com/p/AF1QipN4ORSvcvxZBpkSg9dTOlbslHFrhRgmKH1CVwgl=s1360-w1360-h1020-rw'],
        description: 'Local gym with functional training and machines.',
        facilities: ['Weights', 'Cross-training', 'Trainer'],
        hours: '6 AM – 10 PM',
        pricing: '₹130 per session',
        contact: { phone: '+91 8619439126', address: 'Raja Park, Jaipur' },
        ratingScore: 4.8,
        ratingCount: 74,
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Sweatbox+Gym+Raja+Park+Jaipur',
      },
      'fw-7': {
        name: 'Fit Arena Gym',
        images: ['https://img.fitimg.in/studio_profile_46256E619E41BE.png'],
        description: 'Gym with modern equipment and spacious floor.',
        facilities: ['Weights', 'Cardio', 'Lockers'],
        hours: '6 AM – 10 PM',
        pricing: '₹80 per session',
        contact: { phone: '+91 8619439126', address: 'Vidyadarnagar, Jaipur' },
        ratingScore: 4.5,
        ratingCount: 56,
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Fit+Arena+Gym+Vidyadarnagar+Jaipur',
      },
      'fw-8': {
        name: 'Fitness Connection',
        images: ['https://lh3.googleusercontent.com/p/AF1QipMCJ78ZGMoyZ-1lCdTqN3Hij82Y0vPL-j0NtlfR=s1360-w1360-h1020-rw'],
        description: 'Gym with modern equipment and spacious floor.',
        facilities: ['Weights', 'Cardio', 'Lockers'],
        hours: '6 AM – 10 PM',
        pricing: '₹120 per session',
        contact: { phone: '+91 8619439126', address: 'Rajapark, Jaipur' },
        ratingScore: 4.3,
        ratingCount: 29,
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Fitness+Connection+Rajapark+Jaipur',
      },
      'fw-9': {
        name: 'One Rule Gym',
        images: ['https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwhMp7yBIEdzNXrD6TIROue5d4wwUJS57bAtLj1KEdo3jwi_T1A3C2Sgsd3cCktzEm_BYVmq1-iyINNyIghEY8x3NQmyRfIcP2tGeFi88yztsgeJpWsGSEX-SJw1OSS6mPQtTMnvpK-90r8=s1360-w1360-h1020-rw'],
        description: 'Gym with modern equipment and spacious floor.',
        facilities: ['Weights', 'Cardio', 'Lockers'],
        hours: '6 AM – 10 PM',
        pricing: '₹120 per session',
        contact: { phone: '+91 8619439126', address: 'Raja Park, Jaipur' },
        ratingScore: 4.4,
        ratingCount: 41,
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=One+Rule+Gym+Raja+Park+Jaipur',
      },
    },
  },
  doctors: {
    'general-physician': {
      'dr-vijay-pathak': {
        name: 'Dr. Vijay Pathak',
        images: ['/doctor.jpg'],
        description: 'Cardiac surgeon and general physician consultations.',
        facilities: ['Consultation'],
        hours: '5 PM – 7 PM (varies by day)',
        pricing: 'Consultation on request',
        contact: { phone: '+91 8619439126', address: 'Tilak Nagar, Jaipur' },
        ratingScore: 4.3,
        ratingCount: 195,
        mapUrl: 'https://maps.app.goo.gl/7V5rqCSH9QRqyQY57',
      },
      'agarwal-clinic': {
        name: 'Agarwal Clinic',
        images: ['/doctor.jpg'],
        description: 'Clinic offering OB/GYN and general physician services.',
        facilities: ['Consultation'],
        hours: '6 PM – 9 PM (varies)',
        pricing: 'Consultation on request',
        contact: { phone: '+91 8619439126', address: 'Tilak Nagar · Guru Nanak Pura, Jaipur' },
        ratingScore: 5.0,
        ratingCount: 116,
        mapUrl: 'https://maps.app.goo.gl/Gam4Qqp9cP83srqd6',
      },
    },
    physiotherapy: {
      'physio-home-jawahar-nagar': {
        name: 'Physiotherapy at home',
        images: ['/homephysio.png'],
        description: 'Home physiotherapy service at Jawahar Nagar.',
        facilities: ['Home Visit', 'Pain Management'],
        hours: '10 AM – 8 PM',
        pricing: '₹200 per session',
        contact: { phone: '+91 8619439126', address: 'Jawahar Nagar' },
        mapUrl: 'https://maps.app.goo.gl/QGzfpXzkxgQ8MKE46',
      },
      'kritikas-physiotherapy-clinic': {
        name: "Kritika's Physiotherapy Clinic",
        images: ['/kritika.png'],
        description: 'Physiotherapy & wellness center with modern treatments.',
        facilities: ['Needle Therapy', 'Cupping', 'Stone Therapy'],
        hours: '10 AM – 8:30 PM',
        pricing: '₹200 per session',
        contact: { phone: '+91 8619439126', address: 'Tilak Nagar' },
        ratingScore: 5.0,
        ratingCount: 66,
        mapUrl: 'https://maps.app.goo.gl/wwZSpiW7U9tGiXaH7',
      },
    },
    'mental-health-session': {
      'art-of-living-tilak-nagar': {
        name: 'Art of Living Happiness Center',
        images: ['/images/services/service-4.jpg'],
        description: 'Meditation and wellness center offering the Happiness Course and guided practices.',
        facilities: ['Meditation', 'Guided Practices'],
        hours: '6 AM – 8 PM',
        pricing: 'Session fees on request',
        contact: { phone: '+91 8619439126', address: 'Tilak Nagar' },
        ratingScore: 5.0,
        ratingCount: 55,
        mapUrl: 'https://maps.app.goo.gl/RCcsrytoN69HXN6x6',
      },
    },
    ayurveda: {
      'aarohan-ayurveda-hospital': {
        name: 'AAROHAN AYURVEDA Hospital',
        images: ['/arohanayur.png'],
        description: 'Ayurvedic hospital offering authentic therapies and care.',
        facilities: ['Panchakarma', 'Therapies'],
        hours: '9 AM – 7 PM',
        pricing: 'Therapies on request',
        contact: { phone: '+91 8619439126', address: 'Jaipur' },
        ratingScore: 5.0,
        ratingCount: 227,
        mapUrl: 'https://maps.app.goo.gl/g2Q6XyoVhPRdhsgU6',
      },
    },
    'emergency-ambulance-booking': {
      'yadav-ambulance-service': {
        name: 'Yadav Ambulance service',
        images: ['/images/services/service-3.jpg'],
        description: '24x7 ambulance service in Jaipur.',
        facilities: ['24x7 Service'],
        hours: 'Open 24 hours',
        pricing: 'On request',
        contact: { phone: '+91 8619439126', address: 'Jaipur' },
        ratingScore: 5.0,
        ratingCount: 4,
        mapUrl: 'https://maps.app.goo.gl/mrYyVEMx6kfQoa1N7',
      },
    },
  },
};

const ListingProfilePage: React.FC = () => {
  const { category, subcategory, id } = useParams<{ category: string; subcategory?: string; id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const initialProfile = category && id ? (subcategory ? sampleProfiles[category]?.[subcategory!]?.[id] : undefined) : undefined;
  
  const [dbProfile, setDbProfile] = useState<Partial<Profile> | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('business_profiles')
          .select('google_maps_profile, rating, review_count')
          .eq('id', id)
          .maybeSingle();
        
        if (data) {
          setDbProfile({
            mapUrl: data.google_maps_profile,
            ratingScore: data.rating,
            ratingCount: data.review_count
          });
        }
      } catch (err) {
        console.error('Error fetching business profile:', err);
      }
    };
    fetchProfile();
  }, [id]);

  const profile = initialProfile ? { ...initialProfile, ...dbProfile } : undefined;

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleAddToCart = () => {
    if (!profile || !id) return;
    if (!selectedDate || !selectedTime) {
      alert('Please select a date and time slot.');
      return;
    }

    addToCart({
      id,
      name: profile.name,
      price: profile.pricing,
      date: selectedDate,
      time: selectedTime,
      image: profile.images[0],
      category: category!,
      subcategory
    });

    navigate('/checkout');
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 animate-fade-in">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-lg bg-white border border-gray-200 p-6">
            <p className="text-gray-700">Profile not found or not yet available.</p>
            <div className="mt-4 flex gap-4">
              <Link to={subcategory ? `/services/${category}/${subcategory}` : `/services/${category || ''}`} className="text-teal-600">Back to listings</Link>
              <Link to="/services" className="text-teal-600">All services</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-bold">{profile.name}</h1>
        {typeof profile.ratingScore === 'number' && typeof profile.ratingCount === 'number' && (
          <p className="mt-2 text-lg text-gray-800">{profile.ratingScore.toFixed(1)} ★ ({profile.ratingCount})</p>
        )}
        <div className="mt-6">
          <ImageCarousel images={profile.images} />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-xl bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-semibold">Description</h2>
              <p className="mt-2 text-gray-700">{profile.description}</p>
            </section>
            <section className="rounded-xl bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-semibold">Facilities</h2>
              <ul className="mt-2 list-disc list-inside text-gray-700">
                {profile.facilities.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </section>
            <section className="rounded-xl bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-semibold">Operating Hours</h2>
              <p className="mt-2 text-gray-700">{profile.hours}</p>
            </section>
            <section className="rounded-xl bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-semibold">Pricing</h2>
              <p className="mt-2 text-gray-700">{profile.pricing}</p>
            </section>
          </div>
          <aside className="space-y-6">
            {/* Location / Map Section */}
            <section className="rounded-xl bg-white border border-gray-200 overflow-hidden">
              <div className="p-6 pb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-600" />
                  Location
                </h2>
                <p className="mt-2 text-gray-600 text-sm">{profile.contact.address}</p>
              </div>
              
              {profile.mapUrl && (
                <div className="relative h-48 bg-gray-100 border-t border-gray-100">
                  <a 
                    href={profile.mapUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full h-full relative hover:opacity-90 transition-opacity group"
                  >
                     {/* Map Placeholder */}
                     <div className="absolute inset-0 bg-teal-50 flex items-center justify-center">
                        <MapIcon className="w-12 h-12 text-teal-200" />
                     </div>
                     
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm text-sm font-medium text-teal-700 group-hover:bg-white transition-colors flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Open in Maps
                        </div>
                     </div>
                     
                     {/* Rating Overlay */}
                     {(profile.ratingScore || 0) > 0 && (
                       <div className="absolute bottom-3 left-3 bg-white px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
                         <span className="font-bold text-gray-900">{profile.ratingScore}</span>
                         <div className="flex text-yellow-400">
                           {[...Array(5)].map((_, i) => (
                             <Star 
                               key={i} 
                               className={`w-3.5 h-3.5 ${i < Math.round(profile.ratingScore!) ? 'fill-current' : 'text-gray-300'}`} 
                             />
                           ))}
                         </div>
                         <span className="text-xs text-gray-500">({profile.ratingCount})</span>
                       </div>
                     )}
                  </a>
                </div>
              )}
            </section>

            <section className="rounded-xl bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-semibold">Contact</h2>
              <div className="mt-2 text-gray-700 space-y-1">
                {profile.contact.phone && <p>Phone: {profile.contact.phone}</p>}
                {profile.contact.email && <p>Email: {profile.contact.email}</p>}
              </div>
              <div className="mt-6 border-t pt-4">
                <h3 className="font-semibold mb-2">Book Appointment</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                    <input 
                      type="date" 
                      className="w-full border border-gray-300 rounded-md p-2"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Time Slot</label>
                    <select 
                      className="w-full border border-gray-300 rounded-md p-2"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                    >
                      <option value="">Select a time</option>
                      {['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'].map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center rounded-md bg-teal-600 px-4 py-3 text-white font-medium hover:bg-teal-700 transition-colors"
                  >
                    Add to Cart
                  </button>
                  
                  <div className="text-center text-sm text-gray-500 my-2">- OR -</div>

                  <a
                    href={`https://api.whatsapp.com/send/?phone=919351504729&text=${encodeURIComponent(`Book ${profile.name}`)}&type=phone_number&app_absent=0`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center rounded-md border border-teal-600 px-4 py-3 text-teal-600 font-medium hover:bg-teal-50 transition-colors"
                  >
                    Book on WhatsApp
                  </a>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ListingProfilePage;
