import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-100", className)}
      {...props}
    />
  )
}

export { Skeleton }

export function CardSkeleton() {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-3 w-32" />
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-10 w-48 rounded-lg" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24 rounded-lg" />
                    <Skeleton className="h-10 w-10 rounded-lg" />
                </div>
            </div>
            <div className="space-y-4">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 border-b border-slate-50 pb-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-3 w-1/2 opacity-50" />
                        </div>
                        <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}
