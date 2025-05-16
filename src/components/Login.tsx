import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  Divider
} from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { googleSignIn, emailSignIn, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await googleSignIn();
      navigate('/student');
    } catch (error) {
      toast({
        title: 'Error signing in',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await emailSignIn(email, password);
      // Check if the user is actually the driver
      if (email !== 'driver@college.edu') {
        await logout(); // Log them out if they're not the driver
        toast({
          title: 'Access Denied',
          description: 'This login is reserved for drivers only',
          status: 'error',
          duration: 3000,
        });
        return;
      }
      navigate('/driver');
    } catch (error: any) {
      toast({
        title: 'Error signing in',
        description: error.message || 'Please check your credentials',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8}>
        <Text fontSize="2xl" fontWeight="bold">
          College Bus Tracker
        </Text>

        {/* Student Login */}
        <Button
          w="full"
          leftIcon={<FcGoogle />}
          onClick={handleGoogleSignIn}
          isLoading={isLoading}
        >
          Sign in with Google (Students)
        </Button>

        <Divider />

        {/* Driver Login */}
        <Box as="form" w="full" onSubmit={handleEmailSignIn}>
          <VStack spacing={4}>
            <Text>Driver Login</Text>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver@college.edu"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <Button
              type="submit"
              colorScheme="blue"
              w="full"
              isLoading={isLoading}
            >
              Sign In as Driver
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default Login; 