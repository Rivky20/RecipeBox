import { Input, InputGroup } from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'חיפוש מתכונים...' }: Props) {
  return (
    <InputGroup startElement={<FaSearch color="gray" />}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        bg="white"
      />
    </InputGroup>
  );
}
