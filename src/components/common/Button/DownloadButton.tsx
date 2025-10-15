import React from 'react';
import { Button, ButtonProps } from './Button';

type DownloadButtonProps = Omit<ButtonProps, 'variant' | 'leftIcon'> & {
  label?: string;
};

export const DownloadButton: React.FC<DownloadButtonProps> = ({ label = 'Download', ...props }) => {
  return (
    <Button
      variant="primary"
      {...props}
    >
      {label}
    </Button>
  );
};
