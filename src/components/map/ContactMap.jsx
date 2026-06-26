'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Phone, Mail, Navigation } from 'lucide-react';

const loadGoogleMapsScript = (apiKey) => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return;
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google.maps));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error('Failed to load Google Maps script.'));
    document.head.appendChild(script);
  });
};

const mapStyles = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "on" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#bdbdbd" }]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#e5e5e5" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#dadada" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [{ "color": "#e5e5e5" }]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#c9c9c9" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  }
];

const instituteAddress = 'Soni Diamond Business Institute, Gokul Apartment, Opp. Tejas Classes, Sonifalia, Surat - 395003, Gujarat, India';
// Precise coordinates fallback for Soni Diamond Business Institute (Sonifalia, Surat)
const fallbackCoords = { lat: 21.192323, lng: 72.824233 };

export default function ContactMap() {
  const mapContainerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      try {
        if (!apiKey) {
          throw new Error('Google Maps API key is missing.');
        }

        const maps = await loadGoogleMapsScript(apiKey);
        if (!isMounted || !mapContainerRef.current) return;

        // Try to geocode the institute's address first
        const geocoder = new maps.Geocoder();
        geocoder.geocode({ address: instituteAddress }, (results, status) => {
          if (!isMounted || !mapContainerRef.current) return;

          let finalCoords = fallbackCoords;
          if (status === 'OK' && results && results[0]) {
            const loc = results[0].geometry.location;
            finalCoords = { lat: loc.lat(), lng: loc.lng() };
          } else {
            console.warn(`Geocoding failed: ${status}. Falling back to default coordinates.`);
          }

          const map = new maps.Map(mapContainerRef.current, {
            center: finalCoords,
            zoom: 17,
            styles: mapStyles,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: true,
            fullscreenControl: true,
            gestureHandling: 'cooperative',
          });

          // Custom styled gold marker
          const marker = new maps.Marker({
            position: finalCoords,
            map: map,
            title: 'Soni Diamond Business Institute',
            icon: {
              path: maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: '#EAB308',
              fillOpacity: 1,
              strokeColor: '#000000',
              strokeWeight: 1.5,
            }
          });

          const infoWindowContent = `
            <div style="font-family: 'Montserrat', sans-serif; padding: 6px; color: #000;">
              <h4 style="margin: 0 0 4px 0; font-family: 'Cormorant Garamond', serif; font-size: 16px; font-weight: bold; color: #000;">Soni Diamond Business Institute</h4>
              <p style="margin: 0; font-size: 11px; color: #555;">Sonifalia, Surat, Gujarat 395003</p>
            </div>
          `;

          const infoWindow = new maps.InfoWindow({
            content: infoWindowContent,
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          // Open by default
          infoWindow.open(map, marker);

          setMapLoaded(true);
        });

      } catch (err) {
        console.error('Google Maps Load Error:', err);
        if (isMounted) {
          setMapError(err.message || 'Failed to load Google Maps.');
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, [apiKey]);

  const handleDirectionsClick = () => {
    const query = encodeURIComponent('Soni Diamond Business Institute Surat Gokul Apartment Sonifalia');
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <section className="relative w-full overflow-hidden" style={{ height: '500px', backgroundColor: '#f3f4f6' }}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Glassmorphic Info Overlay */}
      <div 
        className="absolute top-6 left-6 z-10 p-6 md:p-8 bg-white/95 backdrop-blur-md rounded-lg shadow-xl max-w-sm border border-gray-100 flex flex-col gap-4 text-black transition-all hover:shadow-2xl"
        style={{
          fontFamily: "'Montserrat', sans-serif",
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)'
        }}
      >
        <div>
          <span className="text-xs font-semibold tracking-wider text-yellow-500 uppercase">Our Institute</span>
          <h3 className="mt-1 font-serif text-2xl font-medium tracking-tight text-black" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Soni Diamond Business Institute
          </h3>
        </div>

        <div className="flex flex-col gap-3.5 text-xs md:text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-black mb-0.5">Address</p>
              <p className="leading-relaxed">
                1st Floor, Gokul Apartment,<br/>
                Opposite Tejas Classes, Sonifalia,<br/>
                Surat – 395003, Gujarat, India
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone size={18} className="text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-black mb-0.5">Contact Numbers</p>
              <p className="leading-relaxed">
                +91 98255 74713<br/>
                +91 96383 40740
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail size={18} className="text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-black mb-0.5">Email</p>
              <p className="leading-relaxed">shreyan_soni@yahoo.co.in</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleDirectionsClick}
          className="flex items-center justify-center gap-2 w-full mt-2 py-3 px-4 bg-black text-white hover:bg-yellow-500 hover:text-black transition-all duration-300 font-semibold tracking-wider text-xs uppercase rounded"
        >
          <Navigation size={14} />
          Get Directions
        </button>
      </div>

      {/* Loading & Error State Overlay */}
      {(!mapLoaded || mapError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-20 text-sm font-medium text-gray-500">
          {mapError ? (
            <div className="text-center p-4">
              <p className="text-red-500 font-semibold mb-1">Failed to load Map</p>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">{mapError}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs tracking-widest uppercase text-gray-400">Loading Map...</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
