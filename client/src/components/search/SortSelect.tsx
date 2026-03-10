import { NativeSelect } from '@chakra-ui/react';

interface Props {
  value: 'date' | 'name';
  onChange: (val: 'date' | 'name') => void;
}

export default function SortSelect({ value, onChange }: Props) {
  return (
    <NativeSelect.Root minW="150px">
      <NativeSelect.Field
        value={value}
        onChange={(e) => onChange(e.target.value as 'date' | 'name')}
        bg="white"
      >
        <option value="date">החדש ביותר</option>
        <option value="name">שם א–ת</option>
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
}
