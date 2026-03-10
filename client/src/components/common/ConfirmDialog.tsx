import { Button, Dialog, HStack } from '@chakra-ui/react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  loading = false,
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={(e) => { if (!e.open) onCancel(); }}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>{title}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>{message}</Dialog.Body>
          <Dialog.Footer>
            <HStack gap={3} justify="flex-end">
              <Button variant="outline" onClick={onCancel} disabled={loading}>
                ביטול
              </Button>
              <Button colorPalette="red" onClick={onConfirm} loading={loading}>
                {confirmLabel}
              </Button>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
