
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChartSkeleton() {
    return (
        <Card className="w-full h-96 animate-pulse">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-40" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        {/* X-axis labels placeholder */}
        <div className="flex justify-between px-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
        {/* Bars placeholder */}
        <div className="flex items-end justify-around h-64 px-4">
          <Skeleton className="h-40 w-6" />
          <Skeleton className="h-56 w-6" />
          <Skeleton className="h-32 w-6" />
          <Skeleton className="h-48 w-6" />
        </div>
      </CardContent>
    </Card>
    )
}