import { NativeSelect } from '@chakra-ui/react';

interface Props {
  value: 'default' | 'date' | 'name';
  onChange: (val: 'default' | 'date' | 'name') => void;
}

export default function SortSelect({ value, onChange }: Props) {
  return (
    <NativeSelect.Root minW="150px">
      <NativeSelect.Field
        value={value}
        onChange={(e) => onChange(e.target.value as 'default' | 'date' | 'name')}
        bg="white"
      >
        <option value="default">מומלץ</option>
        <option value="date">החדש ביותר</option>
        <option value="name">שם א–ת</option>
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
}
