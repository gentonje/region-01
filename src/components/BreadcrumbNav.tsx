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
      {/* <ul>
        {items.map((item, index) => (
          <li key={index}>
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
          </li>
        ))}
      </ul> */}
    </Breadcrumb>
  );
}
