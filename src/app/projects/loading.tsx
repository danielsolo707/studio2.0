export default function ProjectsLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-lime/30 border-t-lime rounded-full animate-spin" />
        <p className="text-sm font-mono text-muted-foreground animate-pulse">
          Loading project...
        </p>
      </div>
    </div>
  );
}
