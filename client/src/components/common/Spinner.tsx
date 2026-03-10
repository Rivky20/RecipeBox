import { Center, Spinner as ChakraSpinner } from '@chakra-ui/react';

export default function Spinner() {
  return (
    <Center py={16}>
      <ChakraSpinner size="xl" colorPalette="teal" />
    </Center>
  );
}
