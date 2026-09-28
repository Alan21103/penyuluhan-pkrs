export default function DashboardLoading() {
  return (
    <div className="flex flex-col flex-1 animate-pulse">
      {/* Skeleton Top Bar */}
      <div className="h-16 border-b border-border bg-card/50 px-6 flex items-center justify-between">
        <div className="h-5 w-48 bg-muted rounded-lg" />
        <div className="h-8 w-32 bg-muted rounded-xl" />
      </div>

      {/* Skeleton Body Content */}
      <div className="flex-1 p-4 sm:p-6 space-y-6">
        {/* Welcome Banner Skeleton */}
        <div className="space-y-2">
          <div className="h-6 w-56 bg-muted rounded-lg" />
          <div className="h-4 w-72 bg-muted/60 rounded-md" />
        </div>

        {/* 4 Stat Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card border border-border/70 rounded-2xl p-5 h-28 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 bg-muted rounded-md" />
                <div className="w-8 h-8 rounded-xl bg-muted" />
              </div>
              <div className="h-7 w-20 bg-muted rounded-lg" />
            </div>
          ))}
        </div>

        {/* 2 Chart Cards Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-card border border-border/70 rounded-3xl p-7 h-80 flex flex-col justify-between">
            <div className="h-5 w-44 bg-muted rounded-md" />
            <div className="flex-1 my-4 bg-muted/40 rounded-2xl" />
            <div className="h-4 w-36 bg-muted mx-auto rounded-md" />
          </div>
          <div className="bg-card border border-border/70 rounded-3xl p-7 h-80 flex flex-col justify-between">
            <div className="h-5 w-44 bg-muted rounded-md" />
            <div className="flex-1 my-4 bg-muted/40 rounded-2xl" />
            <div className="h-4 w-36 bg-muted mx-auto rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
