import React from 'react';
import { Button, ButtonProps } from './Button';

type AddButtonProps = Omit<ButtonProps, 'variant' | 'leftIcon'> & {
  label?: string;
};

export const AddButton: React.FC<AddButtonProps> = ({ label = 'Add',children, ...props }) => {
  return (
    <Button
      variant="primary"
      size="md"
      {...props}
    >
      {children}
      {label}
    </Button>
  );
};
