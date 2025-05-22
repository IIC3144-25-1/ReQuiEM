import React from 'react';

export const Sheet = ({ children, ...props }: { children: any; props: any }) => (
  <div data-testid="sheet" {...props}>{children}</div>
);

export const SheetContent = ({ children, ...props }: { children: any; props: any }) => (
  <div data-testid="sheet-content" {...props}>{children}</div>
);

export const SheetHeader = ({ children, ...props }: { children: any; props: any }) => (
  <div data-testid="sheet-header" {...props}>{children}</div>
);

export const SheetTitle = ({ children, ...props }: { children: any; props: any }) => (
  <div data-testid="sheet-title" {...props}>{children}</div>
);

export const SheetTrigger = ({ children, asChild, ...props }: { children: any; asChild: any; props: any }) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      'data-testid': 'sheet-trigger',
      ...props
    });
  }
  return <div data-testid="sheet-trigger" {...props}>{children}</div>;
};