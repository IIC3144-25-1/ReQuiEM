import React from 'react';

export const Button = ({ children, asChild, ...props }: { children: any; asChild: any; props: any }) => {
  if (typeof children === 'function') {
    return children({});
  }
  return <button data-testid="button" {...props}>{children}</button>;
};