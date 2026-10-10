import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
export function Card({ className, ...props }: ComponentProps<'section'>) {
  return (
    <section
      className={cn('rounded-lg border bg-card p-6 text-card-foreground shadow-sm', className)}
      {...props}
    />
  )
}
