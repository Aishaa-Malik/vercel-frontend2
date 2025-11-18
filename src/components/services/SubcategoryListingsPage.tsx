import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ListingCard, { Listing } from './ListingCard';

const subcategoryListings: Record<string, Record<string, Listing[]>> = {
  'sports-venues': {
    'cricket-pitch': [
      { id: 'cp-1', name: 'Tiento Sports', location: 'Mission Road · 1.1 km', thumb: '/tiento.png', details: 'Bookable' },
      { id: 'cp-2', name: 'Fusion – The Turf', location: 'Next to KSH · 1.1 km', thumb: '/c2.png', details: 'Bookable' },
      { id: 'cp-3', name: 'Karnataka Sharks Cricket', location: 'BCVL · 1.4 km', thumb: '/c3.png', details: 'Bookable' },
      { id: 'cp-4', name: 'Basecamp by Push Sports – Bengaluru', location: 'Palace Road · 1.4 km', thumb: '/c4.png', details: 'Bookable' },
      { id: 'cp-5', name: 'Basecamp Football by Rush Arena', location: 'Bengaluru City Univ · 1.5 km', thumb: '/c5.png', details: 'Bookable' },
    ],
    'football-turf': [
      { id: 'ft-1', name: 'Bangalore Football Turf', location: 'Hennur Ring · Royal Towers', thumb: '/f1.png', details: 'Soccer field' },
      { id: 'ft-2', name: 'Bangalore Turf Club Ltd.', location: 'Race Course Rd', thumb: '/f2.png', details: 'Racecourse' },
      { id: 'ft-3', name: 'Turf City Sports', location: 'BBL Layout Main Rd', thumb: '/f3.png', details: 'Sports complex' },
    ],
    pickleball: [
      { id: 'pb-1', name: 'PicknPadel Arena – Padel & Pickleball', location: 'Begur', thumb: '/p1.png', details: 'Sports complex' },
      { id: 'pb-2', name: 'PowerPickle', location: 'Vistar Resorts & Hotels', thumb: '/p2.png', details: 'Pickleball court' },
      { id: 'pb-3', name: 'Go Picklers', location: '2nd Main Rd', thumb: '/p3.png', details: 'Pickleball court' },
    ],
  },
  gyms: {
    'fun-workout': [
      { id: 'fw-1', name: 'Fit and Gold Gym', location: 'Raja Park', thumb: '/fng.png', details: 'Gym' },
      { id: 'fw-2', name: 'Group NATURE Fun workout', location: 'Bhagat Singh Park · Raja Park', thumb: '/parkyoga.jpg', details: 'Group workout' },
      { id: 'fw-3', name: 'Group workout & MUSICAL YOGA', location: 'Central Park', thumb: '/yoga.png', details: 'Musical yoga' },
      { id: 'fw-4', name: 'Eco Fitness dance', location: 'Central Park', thumb: '/dancecp.png', details: 'Eco fitness dance' },
      { id: 'fw-5', name: 'RELAXING MEDITATION IN NATURE', location: 'Central Park', thumb: '/meditation.png', details: 'Meditation' },
      { id: 'fw-6', name: 'Sweatbox Gym', location: 'Raja Park', thumb: 'https://lh3.googleusercontent.com/p/AF1QipN4ORSvcvxZBpkSg9dTOlbslHFrhRgmKH1CVwgl=s1360-w1360-h1020-rw', details: 'Gym' },
      { id: 'fw-7', name: 'Fit Arena Gym', location: 'Vidyadarnagar', thumb: 'https://img.fitimg.in/studio_profile_46256E619E41BE.png', details: 'Gym' },
      { id: 'fw-8', name: 'Fitness Connection', location: 'Rajapark', thumb: 'https://lh3.googleusercontent.com/p/AF1QipMCJ78ZGMoyZ-1lCdTqN3Hij82Y0vPL-j0NtlfR=s1360-w1360-h1020-rw', details: 'Gym' },
      { id: 'fw-9', name: 'One Rule Gym', location: 'Rajapark', thumb: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwhMp7yBIEdzNXrD6TIROue5d4wwUJS57bAtLj1KEdo3jwi_T1A3C2Sgsd3cCktzEm_BYVmq1-iyINNyIghEY8x3NQmyRfIcP2tGeFi88yztsgeJpWsGSEX-SJw1OSS6mPQtTMnvpK-90r8=s1360-w1360-h1020-rw', details: 'Gym' },
    ],
  },
  doctors: {
    physiotherapy: [
      { id: 'physio-home-jawahar-nagar', name: 'Physiotherapy at home', location: 'Jawahar Nagar', thumb: '/homephysio.png', details: 'Home visit', mapUrl: 'https://maps.app.goo.gl/QGzfpXzkxgQ8MKE46' },
      { id: 'kritikas-physiotherapy-clinic', name: "Kritika's Physiotherapy Clinic", location: 'Tilak Nagar', thumb: '/kritika.png', details: 'Clinic', ratingScore: 5.0, ratingCount: 66, mapUrl: 'https://maps.app.goo.gl/wwZSpiW7U9tGiXaH7' },
    ],
    'mental-health-session': [
      { id: 'art-of-living-tilak-nagar', name: 'Art of Living Happiness Center', location: 'Tilak Nagar', thumb: '/COMINGSOON.png', details: 'Meditation & wellness', ratingScore: 5.0, ratingCount: 55, mapUrl: 'https://maps.app.goo.gl/RCcsrytoN69HXN6x6' },
      { id: 'mh-3', name: 'Healing Circle', location: 'Koramangala', thumb: '/COMINGSOON.png', details: 'Group session' },
    ],
    'general-physician': [
      { id: 'dr-vijay-pathak', name: 'Dr. Vijay Pathak', location: 'Tilak Nagar', thumb: '/doctor.jpg', details: 'General physician', ratingScore: 4.3, ratingCount: 195, mapUrl: 'https://maps.app.goo.gl/7V5rqCSH9QRqyQY57' },
      { id: 'agarwal-clinic', name: 'Agarwal Clinic', location: 'Tilak Nagar · Guru Nanak Pura', thumb: '/doctor.jpg', details: 'General physician', ratingScore: 5.0, ratingCount: 116, mapUrl: 'https://maps.app.goo.gl/Gam4Qqp9cP83srqd6' },
    ],
    ayurveda: [
      { id: 'aarohan-ayurveda-hospital', name: 'AAROHAN AYURVEDA Hospital', location: 'Jaipur', thumb: '/arohanayur.png', details: 'Ayurvedic care', ratingScore: 5.0, ratingCount: 227, mapUrl: 'https://maps.app.goo.gl/g2Q6XyoVhPRdhsgU6' },
    ],
    'emergency-ambulance-booking': [
      { id: 'yadav-ambulance-service', name: 'Yadav Ambulance service', location: 'Jaipur · 24x7', thumb: '/images/services/service-3.jpg', details: 'Emergency ambulance', ratingScore: 5.0, ratingCount: 4, mapUrl: 'https://maps.app.goo.gl/mrYyVEMx6kfQoa1N7' },
    ],
  },
};

const SubcategoryListingsPage: React.FC = () => {
  const { category, subcategory } = useParams<{ category: string; subcategory: string }>();
  const normalizedCategory = category?.toLowerCase().trim();
  const normalizedSubcategory = subcategory?.toLowerCase().trim();
  const listings = normalizedCategory && normalizedSubcategory ? subcategoryListings[normalizedCategory]?.[normalizedSubcategory] : undefined;
  const title = `${normalizedSubcategory?.replace(/-/g, ' ') || 'Subcategory'}`;

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold capitalize">{title}</h1>
          <div className="flex gap-4">
            <Link to={`/services/${category}`} className="text-sm text-teal-600 hover:text-teal-700">Back to {category}</Link>
            <Link to="/services" className="text-sm text-teal-600 hover:text-teal-700">All services</Link>
          </div>
        </div>
        {!listings || listings.length === 0 ? (
          <div className="mt-8 rounded-lg bg-white border border-gray-200 p-6">
            <p className="text-gray-700">No listings available yet.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} categorySlug={category!} subcategorySlug={subcategory!} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubcategoryListingsPage;