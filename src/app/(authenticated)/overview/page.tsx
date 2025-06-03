import { OverviewDashboard } from "@/components/overview-dashboard"
import { OverviewSkeleton } from "@/components/overview-skeleton"
import { Suspense } from "react"

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Get insights into your e-commerce performance and key metrics.
        </p>
      </div>
      
      <Suspense fallback={<OverviewSkeleton />}>
        <OverviewDashboard />
      </Suspense>
    </div>
  )
}
