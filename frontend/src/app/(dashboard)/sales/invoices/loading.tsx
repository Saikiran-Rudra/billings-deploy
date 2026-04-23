import { TableSkeleton } from '@/components/ui/loaders/global-loader';

/**
 * Route-level loading skeleton
 * Next.js automatically shows this during route transitions
 */
export default function Loading() {
  return (
    <div className="p-6 w-full space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
      </div>

      {/* Filters/Search skeleton */}
      <div className="flex gap-4 mb-6">
        <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse" />
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
      </div>

      {/* Table skeleton */}
      <TableSkeleton rows={8} columns={6} />

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between mt-6">
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-10 bg-gray-200 rounded w-10 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-10 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-10 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
