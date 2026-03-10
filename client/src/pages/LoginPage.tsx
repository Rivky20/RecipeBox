import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Center,
  Field,
  Heading,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center minH="100vh" bg="gray.50">
      <Box
        bg="white"
        p={8}
        rounded="xl"
        shadow="md"
        w="full"
        maxW="400px"
      >
        <Stack gap={6}>
          <Heading size="xl" textAlign="center">
            Welcome back
          </Heading>

          <form onSubmit={handleSubmit}>
            <Stack gap={4}>
              <Field.Root>
                <Field.Label>Email</Field.Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field.Root>

              <Field.Root invalid={!!error}>
                <Field.Label>Password</Field.Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {error && <Field.ErrorText>{error}</Field.ErrorText>}
              </Field.Root>

              <Button
                type="submit"
                colorPalette="teal"
                width="full"
                loading={loading}
                loadingText="Signing in..."
              >
                Sign in
              </Button>
            </Stack>
          </form>

          <Text textAlign="center" fontSize="sm" color="gray.600">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'teal', fontWeight: 500 }}>
              Register
            </Link>
          </Text>
        </Stack>
      </Box>
    </Center>
  );
}
