import React from 'react';

export const Accordion = ({ children, ...props }: { children: any; props: any }) => (
  <div data-testid="accordion" {...props}>{children}</div>
);

export const AccordionContent = ({ children, ...props }: { children: any; props: any }) => (
  <div data-testid="accordion-content" {...props}>{children}</div>
);

export const AccordionItem = ({ children, value, ...props }: { children: any; value: any; props: any }) => (
  <div data-testid="accordion-item" data-value={value} {...props}>{children}</div>
);

export const AccordionTrigger = ({
  children,
  ...props
}: {
  children: any;
  props: any;
}) => <div data-testid="accordion-trigger" {...props}>{children}</div>;
