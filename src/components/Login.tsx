import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  VStack,
  Text,
  useToast,
  Image,
  Divider,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import '../styles/login.css';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await login();
      navigate('/student');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error signing in',
        description: 'Failed to sign in with Google. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="login-container">
      <Container maxW="container.sm" py={10}>
        <VStack spacing={8}>
          <Image 
            src="/bus-icon.svg" 
            alt="Bus Icon" 
            boxSize="100px" 
            className="bus-icon"
          />
          
          <Text 
            fontSize="3xl" 
            fontWeight="bold" 
            textAlign="center"
            color="gray.800"
          >
            College Bus Tracker
          </Text>

          <Box 
            w="full" 
            maxW="md" 
            p={8} 
            borderRadius="lg" 
            boxShadow="xl" 
            className="login-box"
          >
            <VStack spacing={6}>
              <Text fontSize="xl" fontWeight="medium" color="gray.700">
                Welcome Back!
              </Text>

              <Button
                w="full"
                size="lg"
                variant="outline"
                leftIcon={<FcGoogle />}
                onClick={handleGoogleSignIn}
                isLoading={isLoading}
                loadingText="Signing in..."
                className="google-button"
                _hover={{
                  bg: 'gray.50',
                  transform: 'translateY(-2px)',
                  boxShadow: 'md',
                }}
                transition="all 0.2s"
              >
                Continue with Google
              </Button>

              <Divider />

              <Text fontSize="sm" color="gray.500" textAlign="center">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
} 