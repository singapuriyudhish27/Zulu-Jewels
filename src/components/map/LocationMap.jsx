'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Search, Compass } from 'lucide-react';

// Load Google Maps Script dynamically
const loadGoogleMapsScript = (apiKey) => {
  return new Promise((resolve, reject) => {
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
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
};

export default function LocationMap({ onLocationSelect, mapCenter }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geocoderRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const sessionTokenRef = useRef(null);
  const geocodeTimeoutRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Reverse geocode the center and call onLocationSelect
  const reverseGeocodeCenter = useCallback((lat, lng) => {
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }

    geocodeTimeoutRef.current = setTimeout(() => {
      if (!geocoderRef.current) return;

      geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          onLocationSelect({
            lat,
            lng,
            address: results[0].formatted_address,
          });
        }
      });
    }, 600);
  }, [onLocationSelect]);

  // Initialize Google Maps
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      try {
        const maps = await loadGoogleMapsScript(apiKey);

        if (!isMounted || !mapContainerRef.current) return;

        const defaultCenter = { lat: 21.1702, lng: 72.8311 }; // Surat, Gujarat

        const map = new maps.Map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: 17,
          mapTypeId: 'hybrid', // Satellite + labels
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy',
        });

        mapInstanceRef.current = map;
        geocoderRef.current = new maps.Geocoder();
        autocompleteServiceRef.current = new maps.places.AutocompleteService();
        sessionTokenRef.current = new maps.places.AutocompleteSessionToken();

        // When user finishes dragging/zooming, reverse-geocode the center
        map.addListener('idle', () => {
          const center = map.getCenter();
          if (center) {
            reverseGeocodeCenter(center.lat(), center.lng());
          }
        });

        setMapLoaded(true);
      } catch (err) {
        console.error('Google Maps initialization error:', err);
        setMapError('Failed to load Google Maps. Check your API key and enabled APIs (Maps JavaScript API, Places API, Geocoding API).');
      }
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, [apiKey, reverseGeocodeCenter]);

  // Sync external mapCenter prop (e.g. from GPS locate in parent)
  useEffect(() => {
    if (mapCenter && mapCenter.lat && mapCenter.lng && mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: mapCenter.lat, lng: mapCenter.lng });
      mapInstanceRef.current.setZoom(17);
    }
  }, [mapCenter]);

  // Handle search input for autocomplete
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (val.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (!autocompleteServiceRef.current) return;

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input: val,
        componentRestrictions: { country: 'in' },
        sessionToken: sessionTokenRef.current,
      },
      (predictions, status) => {
        if (status === 'OK' && predictions) {
          setSuggestions(predictions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    );
  };

  // When a suggestion is clicked, geocode it and pan the map
  const selectSuggestion = (suggestion) => {
    setSearchQuery(suggestion.description);
    setShowSuggestions(false);

    if (!geocoderRef.current) return;

    geocoderRef.current.geocode({ placeId: suggestion.place_id }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();

        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo({ lat, lng });
          mapInstanceRef.current.setZoom(17);
        }

        // Generate a new session token for the next autocomplete session
        if (window.google && window.google.maps) {
          sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
        }

        onLocationSelect({
          lat,
          lng,
          address: results[0].formatted_address,
        });
      }
    });
  };

  // Handle GPS locate
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo({ lat, lng });
          mapInstanceRef.current.setZoom(17);
        }
        reverseGeocodeCenter(lat, lng);
      },
      (error) => {
        console.error('Geolocation error:', error);
      }
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '350px', borderRadius: '8px', overflow: 'hidden' }}>

      {/* Search Bar Overlay */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        right: '12px',
        zIndex: 10,
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        overflow: 'visible'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: showSuggestions && suggestions.length > 0 ? '1px solid #eee' : 'none' }}>
          <Search size={18} color="#999" style={{ marginRight: '8px', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search locality, street, or building..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery.length >= 3 && suggestions.length > 0 && setShowSuggestions(true)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              fontFamily: 'Montserrat, sans-serif',
              color: '#333'
            }}
          />
        </div>

        {/* Suggestion Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            maxHeight: '180px',
            overflowY: 'auto',
            background: '#fff',
            borderRadius: '0 0 8px 8px'
          }}>
            {suggestions.map((sug) => (
              <li
                key={sug.place_id}
                onClick={() => selectSuggestion(sug)}
                style={{
                  padding: '10px 14px',
                  fontSize: '12px',
                  color: '#444',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f5f5f5',
                  transition: 'background 0.2s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                onMouseEnter={(e) => (e.target.style.background = '#fcf8f2')}
                onMouseLeave={(e) => (e.target.style.background = '#fff')}
              >
                {sug.description}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Fixed Center Pin Overlay */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -100%)',
        zIndex: 9,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Modern Map Marker Icon */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50% 50% 50% 0',
          background: '#CEA268',
          transform: 'rotate(-45deg)',
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#fff'
          }} />
        </div>
        {/* Floating pulse shadow */}
        <div style={{
          width: '8px',
          height: '3px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '50%',
          marginTop: '2px'
        }} />
      </div>

      {/* Google Map Container */}
      <div
        ref={mapContainerRef}
        style={{ height: '100%', width: '100%' }}
      />

      {/* Loading / error overlay */}
      {(!mapLoaded || mapError) && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
          zIndex: 5,
          fontSize: '13px',
          color: mapError ? '#c0392b' : '#999',
          padding: '16px',
          textAlign: 'center'
        }}>
          {mapError || 'Loading Map...'}
        </div>
      )}

      {/* Floating GPS Locate Button */}
      <button
        type="button"
        onClick={handleLocateMe}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 10,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: '#fff',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <Compass size={20} color="#CEA268" />
      </button>

    </div>
  );
}
