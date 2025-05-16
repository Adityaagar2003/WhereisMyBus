import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Container,
  VStack,
  Text,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton
} from '@chakra-ui/react';
import { ref, set, get, getDatabase } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const DriverDashboard = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [driverName, setDriverName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbPath, setDbPath] = useState('');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // Check if user is authenticated
    if (!currentUser) {
      console.log('No authenticated user found. Redirecting to login...');
      navigate('/login');
      return;
    }

    console.log('Authenticated user:', currentUser.uid, currentUser.email);
    setDbPath(`bus/location`);

    // Try to load previous driver info
    const loadDriverInfo = async () => {
      try {
        const locationRef = ref(database, 'bus/location');
        const snapshot = await get(locationRef);
        const data = snapshot.val();
        if (data && data.driverName && data.phoneNumber) {
          setDriverName(data.driverName);
          setPhoneNumber(data.phoneNumber);
          console.log('Loaded previous driver info:', data);
        }
      } catch (error) {
        console.error('Error loading driver info:', error);
      }
    };

    loadDriverInfo();

    // Clean up location watching on unmount
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId, currentUser, navigate]);

  const handleStartSharing = async () => {
    setError(null);
    
    if (!currentUser) {
      const errorMsg = 'No authenticated user found. Please log in again.';
      console.error(errorMsg);
      setError(errorMsg);
      navigate('/login');
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Starting location sharing...');
      console.log('Current auth user:', currentUser.uid);
      console.log('DB Path:', dbPath);
      
      // Basic test write to check permissions
      const db = getDatabase();
      const testPath = 'test/' + currentUser.uid;
      await set(ref(db, testPath), {
        isOnline: true,
        timestamp: Date.now()
      });
      
      console.log('Test write successful');

      const id = navigator.geolocation.watchPosition(
        async (position) => {
          console.log('Got position:', position.coords);
          
          const locationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            driverName,
            phoneNumber,
            timestamp: Date.now(),
            uid: currentUser.uid
          };

          try {
            console.log('Writing location data to:', dbPath);
            await set(ref(database, dbPath), locationData);
            console.log('Location updated successfully');
          } catch (error: any) {
            console.error('Error updating location:', error);
            setError(`Error updating location: ${error.message}`);
            handleStopSharing();
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError(`Geolocation error: ${error.message}`);
          handleStopSharing();
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );

      setWatchId(id);
      setIsSharing(true);
      toast({
        title: 'Location sharing started',
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Error starting location sharing:', error);
      setError(`Permission denied: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopSharing = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsSharing(false);
      toast({
        title: 'Location sharing stopped',
        status: 'info',
        duration: 3000,
      });
    }
  };

  const handleLogout = async () => {
    try {
      handleStopSharing();
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

  if (!currentUser) {
    return (
      <Container>
        <VStack spacing={6} mt={10}>
          <Text>Not authenticated. Redirecting to login...</Text>
          <Spinner size="xl" />
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={6}>
        <Text fontSize="2xl" fontWeight="bold">
          Driver Dashboard
        </Text>
        
        {error && (
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <CloseButton position="absolute" right="8px" top="8px" onClick={() => setError(null)} />
          </Alert>
        )}

        <Text fontSize="sm" color="gray.500">Logged in as: {currentUser.email}</Text>

        <FormControl isRequired>
          <FormLabel>Driver Name</FormLabel>
          <Input
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            placeholder="Enter your name"
            isDisabled={isSharing}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Phone Number</FormLabel>
          <Input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number"
            type="tel"
            isDisabled={isSharing}
          />
        </FormControl>

        <Button
          colorScheme={isSharing ? 'red' : 'green'}
          w="full"
          onClick={isSharing ? handleStopSharing : handleStartSharing}
          isDisabled={(!driverName || !phoneNumber) || isLoading}
          isLoading={isLoading}
        >
          {isSharing ? 'Stop Sharing Location' : 'Start Sharing Location'}
        </Button>

        {isSharing && (
          <Text color="green.500" fontSize="sm">
            Actively sharing location...
          </Text>
        )}

        <Button w="full" onClick={handleLogout} isDisabled={isLoading}>
          Logout
        </Button>
      </VStack>
    </Container>
  );
};

export default DriverDashboard; 