import React from 'react'
import { cn } from '@/lib/utils'

// Root component
export function Breadcrumb({
  children,
  className,
  ...props
}: React.ComponentProps<'nav'>) {
  return (
    <nav
      aria-label="breadcrumb"
      className={cn('flex', className)}
      {...props}
    >
      <ol className="flex items-center gap-2">{children}</ol>
    </nav>
  )
}

// Item component
export function BreadcrumbItem({
  children,
  className,
  ...props
}: React.ComponentProps<'li'>) {
  return (
    <li
      className={cn('inline-flex items-center gap-2', className)}
      {...props}
    >
      {children}
    </li>
  )
}

// Separator component
export function BreadcrumbSeparator() {
  return (
    <span 
      className="mx-2 select-none text-muted-foreground" 
      aria-hidden="true"
    >
      /
    </span>
  )
}

// Link component
export function BreadcrumbLink({
  href,
  children,
  className,
  ...props
}: React.ComponentProps<'a'> & { href: string }) {
  return (
    <a
      href={href}
      className={cn('text-muted-foreground hover:text-foreground transition-colors', className)}
      {...props}
    >
      {children}
    </a>
  )
}

// Page component for current page
export function BreadcrumbPage({
  children,
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn('font-medium text-foreground', className)}
      aria-current="page"
      {...props}
    >
      {children}
    </span>
  )
}
