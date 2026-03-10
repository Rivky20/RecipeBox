import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge, Box, Card, Heading, HStack, SimpleGrid, Stack, Text,
} from '@chakra-ui/react';
import { SystemStats } from '../../types';
import { userService } from '../../services/userService';
import Spinner from '../../components/common/Spinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { FaUsers, FaBook, FaLayerGroup, FaBan } from 'react-icons/fa';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <Card.Root>
      <Card.Body>
        <HStack gap={4}>
          <Box fontSize="2xl" color={color}>{icon}</Box>
          <Stack gap={0}>
            <Text fontSize="2xl" fontWeight="bold">{value}</Text>
            <Text color="gray.500" fontSize="sm">{label}</Text>
          </Stack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    userService.getStats()
      .then(setStats)
      .catch(() => setError('טעינת הסטטיסטיקות נכשלה.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!stats) return null;

  return (
    <div dir="rtl">
      <Heading size="xl" mb={6}>סטטיסטיקות מערכת</Heading>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={5} mb={8}>
        <StatCard label="סה״כ משתמשים" value={stats.totalUsers} icon={<FaUsers />} color="blue.500" />
        <StatCard label="סה״כ מתכונים" value={stats.totalRecipes} icon={<FaBook />} color="teal.500" />
        <StatCard label="סה״כ אלבומים" value={stats.totalAlbums} icon={<FaLayerGroup />} color="purple.500" />
        <StatCard label="משתמשים חסומים" value={stats.blockedUsers} icon={<FaBan />} color="red.500" />
      </SimpleGrid>

      {stats.recentRecipes && stats.recentRecipes.length > 0 && (
        <>
          <Heading size="md" mb={4}>מתכונים אחרונים</Heading>
          <Box bg="white" borderRadius="lg" shadow="sm" p={4}>
            <Stack gap={3}>
              {stats.recentRecipes.map((r) => (
                <HStack key={r.id} justify="space-between" py={2} borderBottom="1px solid" borderColor="gray.100">
                  <Text fontWeight="medium">
                    <Link to={`/recipes/${r.id}`}>{r.name}</Link>
                  </Text>
                  <HStack gap={3}>
                    <Badge colorPalette={r.recipeType === 'Link' ? 'blue' : 'green'} size="sm">
                      {r.recipeType === 'Link' ? 'קישור' : 'טקסט'}
                    </Badge>
                    <Text fontSize="sm" color="gray.500">
                      {new Date(r.createdAt).toLocaleDateString('he-IL')}
                    </Text>
                  </HStack>
                </HStack>
              ))}
            </Stack>
          </Box>
        </>
      )}
    </div>
  );
}
