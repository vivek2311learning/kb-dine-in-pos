'use client';

import { useState } from 'react';
import ConfirmDialog from './confirm-dialog';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(
    null,
  );

  const confirm = (nextOptions: ConfirmOptions) => {
    setOptions(nextOptions);

    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleCancel = () => {
    resolver?.(false);
    setOptions(null);
    setResolver(null);
  };

  const handleConfirm = () => {
    resolver?.(true);
    setOptions(null);
    setResolver(null);
  };

  const dialog = options ? (
    <ConfirmDialog
      open={true}
      title={options.title}
      message={options.message}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      variant={options.variant}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return { confirm, dialog };
}
