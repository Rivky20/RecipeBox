import { Box, Flex } from '@chakra-ui/react';
import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Flex minH="100vh" bg="#FFFAF7" direction="column">
      <Navbar />
      <Box flex={1} maxW="1200px" w="full" mx="auto" px={6} py={8}>
        {children}
      </Box>
      <Footer />
    </Flex>
  );
}
