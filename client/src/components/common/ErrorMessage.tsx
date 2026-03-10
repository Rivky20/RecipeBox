import { Alert } from '@chakra-ui/react';

interface Props {
  message: string;
}

export default function ErrorMessage({ message }: Props) {
  return (
    <Alert.Root status="error" borderRadius="md">
      <Alert.Indicator />
      <Alert.Description>{message}</Alert.Description>
    </Alert.Root>
  );
}
