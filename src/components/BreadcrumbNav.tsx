
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from './ui/badge';
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
    isCurrent?: boolean;
  }>;
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className="mb-1 mt-1">
      <ol className="flex items-center gap-1 flex-wrap">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.href && !item.isCurrent ? (
                <BreadcrumbLink href={item.href}>
                  <Link to={item.href} className="text-muted-foreground hover:text-foreground">
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>
                  {item.isCurrent ? (
                    <Badge variant="secondary" className="font-normal">
                      {item.label}
                    </Badge>
                  ) : (
                    item.label
                  )}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </ol>
    </Breadcrumb>
  );
}
