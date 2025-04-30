
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse", className)}
      {...props}
    />
  )
}

export { Skeleton }
