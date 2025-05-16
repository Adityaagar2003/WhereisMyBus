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
  Badge,
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

// BIT Patna main gate coordinates
const BIT_PATNA_LOCATION: [number, number] = [25.5941, 85.1376];
const DRIVER_ACTIVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

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

// Function to check if driver is active based on timestamp
const checkDriverActive = (timestamp: number): boolean => {
  const now = Date.now();
  return now - timestamp < DRIVER_ACTIVE_THRESHOLD;
};

// Function to get address from coordinates using OpenStreetMap Nominatim
const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();
    if (data && data.display_name) {
      // Simplify the address
      const parts = data.display_name.split(',');
      return parts.slice(0, 3).join(', ');
    }
    return 'Unknown location';
  } catch (error) {
    console.error('Error fetching address:', error);
    return 'Error fetching address';
  }
};

// Component to update map center when bus location changes
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
function DynamicMarker({ location, isActive }: { location: LocationData, isActive: boolean }) {
  const position: [number, number] = useMemo(() => {
    return [location.lat, location.lng];
  }, [location.lat, location.lng]);

  const [address, setAddress] = useState<string>('Loading address...');

  useEffect(() => {
    // Get address for the location
    getAddressFromCoordinates(location.lat, location.lng)
      .then(addr => setAddress(addr))
      .catch(err => {
        console.error('Error getting address:', err);
        setAddress('Unknown location');
      });
  }, [location.lat, location.lng]);

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
            <div style={{ fontSize: '12px', marginTop: '5px', color: '#444' }}>
              <strong>Status:</strong>{' '}
              {isActive ? 
                <span style={{ color: 'green' }}>Active</span> : 
                <span style={{ color: 'red' }}>Inactive</span>}
            </div>
            <div style={{ fontSize: '12px', marginTop: '5px', color: '#444' }}>
              <strong>Location:</strong> {address}
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
  const [isDriverActive, setIsDriverActive] = useState<boolean>(false);
  const [mapKey, setMapKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>('');
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
          
          // Check if driver is active based on timestamp
          const active = checkDriverActive(data.timestamp);
          setIsDriverActive(active);
          
          if (active) {
            setBusLocation(data);
            // Get address
            getAddressFromCoordinates(data.lat, data.lng)
              .then(address => setLocationAddress(address));
          } else {
            // If driver is not active, use BIT Patna location
            const inactiveData = {
              ...data,
              lat: BIT_PATNA_LOCATION[0],
              lng: BIT_PATNA_LOCATION[1]
            };
            setBusLocation(inactiveData);
            setLocationAddress('BIT Patna Main Gate');
          }
        } else {
          console.log('No initial location data available');
          // Set default location to BIT Patna
          const defaultData = {
            lat: BIT_PATNA_LOCATION[0],
            lng: BIT_PATNA_LOCATION[1],
            driverName: 'No Driver',
            phoneNumber: 'N/A',
            timestamp: Date.now()
          };
          setBusLocation(defaultData);
          setLocationAddress('BIT Patna Main Gate');
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
          
          // Check if driver is active based on timestamp
          const active = checkDriverActive(data.timestamp);
          setIsDriverActive(active);
          
          if (active) {
            setBusLocation(data);
            // Get address
            getAddressFromCoordinates(data.lat, data.lng)
              .then(address => setLocationAddress(address));
              
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
          } else if (busLocation?.lat !== BIT_PATNA_LOCATION[0] || 
                   busLocation?.lng !== BIT_PATNA_LOCATION[1]) {
            // Only update to default location if not already there
            const inactiveData = {
              ...data,
              lat: BIT_PATNA_LOCATION[0],
              lng: BIT_PATNA_LOCATION[1]
            };
            setBusLocation(inactiveData);
            setLocationAddress('BIT Patna Main Gate');
            setMapKey(prev => prev + 1);
          }
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
  }, [toast, busLocation]);

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
    return BIT_PATNA_LOCATION;
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
        
        {!isLoading && (
          <Box w="100%" p={3} bg="gray.50" borderRadius="md" textAlign="center">
            <Text fontSize="sm" fontWeight="medium">
              <Badge colorScheme={isDriverActive ? "green" : "red"} mr={2}>
                {isDriverActive ? "Active" : "Inactive"}
              </Badge>
              {isDriverActive ? `Current Location: ${locationAddress}` : "No active driver. Bus is at BIT Patna Main Gate"}
            </Text>
          </Box>
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
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              
              {/* Always render MapUpdater */}
              <MapUpdater location={busLocation} />
              
              {/* Render the dynamic marker only if we have location data */}
              {busLocation && <DynamicMarker location={busLocation} isActive={isDriverActive} />}
            </MapContainer>
          )}
        </Box>

        {busLocation ? (
          <Box w="100%" p={4} borderRadius="md" bg="gray.50">
            {isDriverActive ? (
              <>
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
                  <strong>Address:</strong> {locationAddress}
                </Text>
              </>
            ) : (
              <Text textAlign="center" fontWeight="medium" color="red.500">
                No active driver at this time. Bus is parked at BIT Patna Main Gate.
              </Text>
            )}
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