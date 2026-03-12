import { Box, Button, Flex, HStack, Text, Menu, Avatar } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';
import { FaBook, FaChevronDown, FaSignOutAlt, FaUser } from 'react-icons/fa';

const NAV_BTN = {
  variant: 'ghost' as const,
  size: 'sm' as const,
  color: '#1A1A1A',
  _hover: { bg: '#F5E6E8', color: '#9E6870' },
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
      position="sticky"
      top={0}
      zIndex={100}
      dir="ltr"
    >
      <Flex align="center" justify="space-between" maxW="1200px" mx="auto">
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <HStack gap={2}>
            <Box color="#C9848C" fontSize="xl"><FaBook /></Box>
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
          <Link to="/ai">
            <Button {...NAV_BTN} dir="rtl">🧊 מה יש במקרר?</Button>
          </Link>

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
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  px={2}
                  gap={2}
                  _hover={{ bg: '#F5E6E8' }}
                  borderRadius="full"
                >
                  <Avatar.Root size="xs" bg="#C9848C">
                    <Avatar.Fallback color="white" fontSize="11px">
                      {user?.username?.[0]?.toUpperCase() ?? <FaUser />}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <Text fontSize="sm" fontWeight="600" color="#5C3D2E">
                    {user?.username}
                  </Text>
                  <FaChevronDown size={10} color="#9E6870" />
                </Button>
              </Menu.Trigger>
              <Menu.Positioner>
                <Menu.Content minW="140px">
                  <Menu.Item
                    value="logout"
                    onClick={handleLogout}
                    color="#DC2626"
                    gap={2}
                  >
                    <FaSignOutAlt /> התנתק
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>
          ) : (
            <HStack gap={2}>
              <Button {...NAV_BTN} onClick={openLogin}>Login</Button>
              <Button
                size="sm"
                bg="#C9848C"
                color="white"
                _hover={{ bg: '#9E6870' }}
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
