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

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Email is required.';
    if (password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (password !== confirm) e.confirm = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await register(email, password);
      navigate('/');
    } catch (err: any) {
      setErrors({ general: err?.response?.data?.message || 'Registration failed. Try again.' });
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
            Create account
          </Heading>

          <form onSubmit={handleSubmit}>
            <Stack gap={4}>
              <Field.Root invalid={!!errors.email}>
                <Field.Label>Email</Field.Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {errors.email && <Field.ErrorText>{errors.email}</Field.ErrorText>}
              </Field.Root>

              <Field.Root invalid={!!errors.password}>
                <Field.Label>Password</Field.Label>
                <Input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {errors.password && <Field.ErrorText>{errors.password}</Field.ErrorText>}
              </Field.Root>

              <Field.Root invalid={!!errors.confirm}>
                <Field.Label>Confirm password</Field.Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                {errors.confirm && <Field.ErrorText>{errors.confirm}</Field.ErrorText>}
              </Field.Root>

              {errors.general && (
                <Text color="red.500" fontSize="sm">
                  {errors.general}
                </Text>
              )}

              <Button
                type="submit"
                colorPalette="teal"
                width="full"
                loading={loading}
                loadingText="Creating account..."
              >
                Register
              </Button>
            </Stack>
          </form>

          <Text textAlign="center" fontSize="sm" color="gray.600">
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'teal', fontWeight: 500 }}>
              Sign in
            </Link>
          </Text>
        </Stack>
      </Box>
    </Center>
  );
}
