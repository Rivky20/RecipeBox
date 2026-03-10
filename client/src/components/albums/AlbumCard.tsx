import { Box, Text, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Album } from '../../types';
import { FaBookOpen } from 'react-icons/fa';

const PARQUET_BG: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  backgroundImage: `
    linear-gradient(45deg, rgba(210,175,140,0.055) 25%, transparent 25%, transparent 75%, rgba(210,175,140,0.055) 75%),
    linear-gradient(-45deg, rgba(210,175,140,0.055) 25%, transparent 25%, transparent 75%, rgba(210,175,140,0.055) 75%)
  `,
  backgroundSize: '28px 28px',
  backgroundPosition: '0 0, 14px 14px',
};

interface Props {
  album: Album;
}

export default function AlbumCard({ album }: Props) {
  return (
    <Box
      style={PARQUET_BG}
      border="1px solid"
      borderColor="#F0DDD0"
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="0 2px 14px rgba(210,175,140,0.12)"
      transition="all 0.22s"
      cursor="pointer"
      _hover={{ boxShadow: '0 8px 32px rgba(210,175,140,0.22)', transform: 'translateY(-3px)' }}
      display="flex"
      flexDirection="column"
    >
      {/* Top accent stripe */}
      <Box h="4px" bg="linear-gradient(90deg, #E8919C, #F5C6CB, #F5E1D0)" />

      <Box p={5} flex={1} display="flex" flexDirection="column" gap={3}>
        {/* Icon + count row */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box
            w="42px"
            h="42px"
            bg="#FCE8EA"
            borderRadius="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="#E8919C"
            fontSize="lg"
          >
            <FaBookOpen />
          </Box>
          <Box
            bg="#F5E1D0"
            color="#7D6B62"
            fontSize="xs"
            fontWeight="600"
            px={3}
            py={1}
            borderRadius="full"
            style={{ fontFamily: "'Heebo', sans-serif" }}
          >
            {album.recipeCount} {album.recipeCount === 1 ? 'מתכון' : 'מתכונים'}
          </Box>
        </Box>

        {/* Album Name */}
        <Text
          fontWeight="700"
          fontSize="lg"
          color="#1A1A1A"
          style={{ fontFamily: "'Frank Ruhl Libre', Georgia, serif" }}
          lineClamp={1}
        >
          {album.name}
        </Text>

        {/* Description */}
        <Text
          color="#7D6B62"
          fontSize="sm"
          lineClamp={2}
          flex={1}
          style={{ fontFamily: "'Rubik', 'Heebo', sans-serif" }}
        >
          {album.description || 'אין תיאור'}
        </Text>
      </Box>

      {/* Footer */}
      <Box px={5} pb={5}>
        <Link to={`/albums/${album.id}`} style={{ display: 'block' }}>
          <Button
            width="full"
            size="sm"
            bg="#F5E1D0"
            color="#7D4F3A"
            _hover={{ bg: '#EDD0BB', color: '#5C3520' }}
            borderRadius="full"
            fontWeight="700"
            letterSpacing="0.04em"
            fontSize="sm"
            style={{ fontFamily: "'Heebo', sans-serif" }}
          >
            צפה במתכונים →
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
