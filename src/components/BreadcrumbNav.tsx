import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';

interface BreadcrumbNavProps {
  items: Array<{
    href?: string;
    label: string;
  }>;
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <Breadcrumb>
      {items.map((item, index) => (
        <BreadcrumbItem key={index}>
          {item.href ? (
            <>
              <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              {index < items.length - 1 && <BreadcrumbSeparator />}
            </>
          ) : (
            <>
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
              {index < items.length - 1 && <BreadcrumbSeparator />}
            </>
          )}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}
