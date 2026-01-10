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
      { id: 'fw-1', name: 'Fit and Gold Gym', location: 'Raja Park', thumb: '/fng.png', details: 'Neighborhood gym with weights and cardio equipment.' },
      { id: 'fw-2', name: 'Group NATURE Fun workout', location: 'Bhagat Singh Park · Raja Park', thumb: '/parkyoga.jpg', details: 'Outdoor group workout in nature.' },
      { id: 'fw-3', name: 'Group workout & MUSICAL YOGA', location: 'COMING SOON', thumb: '/images/services/service-2.jpg', details: 'COMING SOON' },
      { id: 'fw-4', name: 'Eco Fitness dance', location: 'COMING SOON', thumb: '/dancecp.png', details: 'COMING SOON' },
      { id: 'fw-5', name: 'RELAXING MEDITATION IN NATURE', location: 'COMING SOON', thumb: '/meditation.png', details: 'COMING SOON' },
      { id: 'fw-6', name: 'Sweatbox Gym', location: 'COMING SOON', thumb: 'https://lh3.googleusercontent.com/p/AF1QipN4ORSvcvxZBpkSg9dTOlbslHFrhRgmKH1CVwgl=s1360-w1360-h1020-rw', details: 'COMING SOON' },
      { id: 'fw-7', name: 'Fit Arena Gym', location: 'COMING SOON', thumb: 'https://img.fitimg.in/studio_profile_46256E619E41BE.png', details: 'COMING SOON' },
      { id: 'fw-8', name: 'Fitness Connection', location: 'COMING SOON', thumb: 'https://lh3.googleusercontent.com/p/AF1QipMCJ78ZGMoyZ-1lCdTqN3Hij82Y0vPL-j0NtlfR=s1360-w1360-h1020-rw', details: 'COMING SOON' },
      { id: 'fw-9', name: 'One Rule Gym', location: 'COMING SOON', thumb: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwhMp7yBIEdzNXrD6TIROue5d4wwUJS57bAtLj1KEdo3jwi_T1A3C2Sgsd3cCktzEm_BYVmq1-iyINNyIghEY8x3NQmyRfIcP2tGeFi88yztsgeJpWsGSEX-SJw1OSS6mPQtTMnvpK-90r8=s1360-w1360-h1020-rw', details: 'COMING SOON' },
    ],
  },
};

const SubcategoryListingsPage: React.FC = () => {
  const { category, subcategory } = useParams<{ category: string; subcategory: string }>();
  const listings = category && subcategory ? subcategoryListings[category]?.[subcategory] : undefined;
  const title = `${subcategory?.replace('-', ' ') || 'Subcategory'}`;

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