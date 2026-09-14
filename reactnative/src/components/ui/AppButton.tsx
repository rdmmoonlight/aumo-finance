import React from 'react';
import { Button, ButtonProps } from 'react-native-paper';

interface AppButtonProps extends Omit<ButtonProps, 'children'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
}

export function AppButton({ title, variant = 'primary', style, ...props }: AppButtonProps) {
  let mode: ButtonProps['mode'] = 'contained';
  if (variant === 'outline') mode = 'outlined';
  if (variant === 'text') mode = 'text';
  if (variant === 'secondary') mode = 'contained-tonal';

  return (
    <Button mode={mode} style={[{ borderRadius: 8 }, style]} {...props}>
      {title}
    </Button>
  );
}
