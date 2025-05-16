import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  VStack,
  Text,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ref, get, DatabaseReference, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import 'leaflet/dist/leaflet.css';

interface LocationData {
  lat: number;
  lng: number;
  driverName: string;
  phoneNumber: string;
  timestamp: number;
  uid?: string;
}

const defaultCenter: [number, number] = [25.5941, 85.1376];

// Create custom bus icon
const busIcon = new L.Icon({
  iconUrl: '/bus-icon.svg',
  iconRetinaUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', // Fallback to a yellow bus PNG
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
  shadowUrl: undefined,
  shadowSize: undefined,
  shadowAnchor: undefined,
  className: 'bus-icon'
});

// This component updates the map view when the bus location changes
function MapUpdater({ location }: { location: LocationData | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (location) {
      console.log('MapUpdater: Updating map view to:', location);
      map.setView([location.lat, location.lng], 15);
      
      // Force a map invalidate to ensure re-rendering
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }
  }, [location, map]);

  return null;
}

// Dynamic marker that updates with location changes
function DynamicMarker({ location }: { location: LocationData }) {
  const position: [number, number] = useMemo(() => {
    return [location.lat, location.lng];
  }, [location.lat, location.lng]);

  console.log('Rendering marker at position:', position);

  return (
    <Marker position={position} icon={busIcon}>
      <Popup className="bus-popup">
        <div style={{ padding: '5px', textAlign: 'center' }}>
          <h3 style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
            College Bus
          </h3>
          <div style={{ margin: '8px 0' }}>
            <div><strong>Driver:</strong> {location.driverName}</div>
            <div><strong>Phone:</strong> {location.phoneNumber}</div>
            <div style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
              <strong>Last Updated:</strong>{' '}
              {new Date(location.timestamp).toLocaleTimeString()}
            </div>
            <div style={{ fontSize: '10px', color: '#888', marginTop: '5px' }}>
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

const StudentDashboard = () => {
  const [busLocation, setBusLocation] = useState<LocationData | null>(null);
  const [mapKey, setMapKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    console.log('Setting up location listeners...');
    setIsLoading(true);
    setError(null);
    
    const locationRef: DatabaseReference = ref(database, 'bus/location');

    // First, get the current value
    get(locationRef)
      .then((snapshot) => {
        const data = snapshot.val();
        if (data) {
          console.log('Initial location data:', data);
          setBusLocation(data);
        } else {
          console.log('No initial location data available');
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error getting initial location:', error);
        setError('Failed to load bus location. Please try again later.');
        setIsLoading(false);
      });
    
    // Then set up real-time updates
    const unsubscribe = onValue(
      locationRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          console.log('Real-time location update received:', data);
          setBusLocation(data);
          
          // Increment map key to force re-render
          setMapKey(prev => prev + 1);
          
          // Show toast when location updates
          toast({
            title: 'Location Updated',
            description: `Driver ${data.driverName} location updated`,
            status: 'info',
            duration: 2000,
            isClosable: true,
          });
        }
      },
      (error) => {
        console.error('Error in real-time updates:', error);
        toast({
          title: 'Error',
          description: 'Failed to get location updates',
          status: 'error',
          duration: 3000,
        });
      }
    );

    return () => {
      console.log('Cleaning up location listener');
      unsubscribe();
    };
  }, [toast]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Error logging out',
        status: 'error',
        duration: 3000,
      });
    }
  };

  console.log('Current bus location state:', busLocation);

  // Calculate current position for marker
  const currentPosition: [number, number] = useMemo(() => {
    if (busLocation) {
      return [busLocation.lat, busLocation.lng];
    }
    return defaultCenter;
  }, [busLocation]);

  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={6}>
        <Text fontSize="2xl" fontWeight="bold">
          Live Bus Location
        </Text>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Box 
          w="100%" 
          h="500px" 
          borderRadius="lg" 
          overflow="hidden" 
          position="relative"
          className="map-container"
        >
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Spinner size="xl" />
            </Box>
          ) : (
            <MapContainer
              key={mapKey}
              center={currentPosition}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Always render MapUpdater */}
              <MapUpdater location={busLocation} />
              
              {/* Render the dynamic marker only if we have location data */}
              {busLocation && <DynamicMarker location={busLocation} />}
            </MapContainer>
          )}
        </Box>

        {busLocation ? (
          <Box w="100%" p={4} borderRadius="md" bg="gray.50">
            <Text>
              <strong>Driver:</strong> {busLocation.driverName}
            </Text>
            <Text>
              <strong>Contact:</strong> {busLocation.phoneNumber}
            </Text>
            <Text>
              <strong>Last Updated:</strong>{' '}
              {new Date(busLocation.timestamp).toLocaleTimeString()}
            </Text>
            <Text>
              <strong>Location:</strong> {busLocation.lat.toFixed(6)}, {busLocation.lng.toFixed(6)}
            </Text>
          </Box>
        ) : (
          <Box w="100%" p={4} borderRadius="md" bg="gray.100">
            <Text textAlign="center">No active bus location available</Text>
          </Box>
        )}

        <Button w="full" onClick={handleLogout}>
          Logout
        </Button>
      </VStack>
    </Container>
  );
};

export default StudentDashboard; 