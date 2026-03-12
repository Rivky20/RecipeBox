import { Box, Flex, HStack, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FaBook, FaHeart } from 'react-icons/fa';

const LINK_STYLE: React.CSSProperties = {
  color: '#7D6B62',
  fontSize: '14px',
  textDecoration: 'none',
  transition: 'color 0.15s',
};

export default function Footer() {
  return (
    <Box
      as="footer"
      bg="white"
      borderTop="1px solid"
      borderColor="#F0DDD0"
      px={6}
      py={6}
      mt="auto"
      dir="ltr"
    >
      <Flex
        maxW="1200px"
        mx="auto"
        align={{ base: 'flex-start', sm: 'center' }}
        justify="space-between"
        wrap="wrap"
        gap={6}
      >
        {/* Left — Logo + links */}
        <Box>
          <HStack gap={2} mb={3}>
            <Box color="#C9848C" fontSize="lg"><FaBook /></Box>
            <Text
              fontWeight="700"
              fontSize="md"
              color="#1A1A1A"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              RecipeBox
            </Text>
          </HStack>

          <HStack gap={5} wrap="wrap">
            <Link to="/" style={LINK_STYLE}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#9E6870')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#7D6B62')}
            >
              Home
            </Link>
            <Link to="/favorites" style={LINK_STYLE}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#9E6870')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#7D6B62')}
            >
              Favorites
            </Link>
            <Link to="/recipes/new" style={LINK_STYLE}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#9E6870')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#7D6B62')}
            >
              Add Recipe
            </Link>
          </HStack>
        </Box>

        {/* Right — Credit + copyright */}
        <Box textAlign="right">
          <Text
            fontWeight="700"
            fontSize="sm"
            color="#1A1A1A"
            letterSpacing="0.08em"
            mb={1}
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            RIVKY GABAY
          </Text>
          <HStack gap={1} justify="flex-end">
            <Text fontSize="xs" color="#7D6B62">
              © 2026 RecipeBox. All rights reserved.
            </Text>
            <Box color="#C9848C" fontSize="xs"><FaHeart /></Box>
          </HStack>
        </Box>
      </Flex>
    </Box>
  );
}
