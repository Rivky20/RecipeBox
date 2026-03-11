import { Box, Button, Flex, HStack, Text, Menu } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';
import { FaBook, FaChevronDown } from 'react-icons/fa';

const NAV_BTN = {
  variant: 'ghost' as const,
  size: 'sm' as const,
  color: '#1A1A1A',
  _hover: { bg: '#FCE8EA', color: '#C97080' },
};

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { openLogin, openRegister } = useAuthModal();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <Box
      bg="white"
      px={6}
      py={3}
      borderBottom="1px solid"
      borderColor="#F0DDD0"
      boxShadow="0 2px 12px rgba(232,145,156,0.08)"
      dir="ltr"
    >
      <Flex align="center" justify="space-between" maxW="1200px" mx="auto">
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <HStack gap={2}>
            <Box color="#E8919C" fontSize="xl"><FaBook /></Box>
            <Text
              fontWeight="700"
              fontSize="xl"
              style={{ fontFamily: "'Nunito', sans-serif" }}
              color="#1A1A1A"
              letterSpacing="0.02em"
            >
              RecipeBox
            </Text>
          </HStack>
        </Link>

        {/* Nav links */}
        <HStack gap={2}>
          {isAuthenticated && (
            <Link to="/favorites">
              <Button {...NAV_BTN}>★ Favorites</Button>
            </Link>
          )}

          {isAdmin && (
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button {...NAV_BTN}>
                  Admin <FaChevronDown style={{ marginLeft: 4 }} />
                </Button>
              </Menu.Trigger>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.Item value="albums" onClick={() => navigate('/admin/albums')}>Albums</Menu.Item>
                  <Menu.Item value="recipes" onClick={() => navigate('/admin/recipes')}>Recipes</Menu.Item>
                  <Menu.Item value="users" onClick={() => navigate('/admin/users')}>Users</Menu.Item>
                  <Menu.Item value="stats" onClick={() => navigate('/admin/stats')}>Stats</Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>
          )}

          {isAuthenticated ? (
            <HStack gap={2}>
              <Text color="#7D6B62" fontSize="sm" fontWeight="500">
                Hi, {user?.username}
              </Text>
              <Button
                size="sm"
                variant="outline"
                borderColor="#E8919C"
                color="#C97080"
                _hover={{ bg: '#FCE8EA' }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </HStack>
          ) : (
            <HStack gap={2}>
              <Button {...NAV_BTN} onClick={openLogin}>Login</Button>
              <Button
                size="sm"
                bg="#E8919C"
                color="white"
                _hover={{ bg: '#C97080' }}
                borderRadius="full"
                px={5}
                onClick={openRegister}
              >
                Register
              </Button>
            </HStack>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}
