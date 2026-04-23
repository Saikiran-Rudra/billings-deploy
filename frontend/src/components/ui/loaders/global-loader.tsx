'use client';

import { useEffect, useState } from 'react';
import { useShowLoader } from '@/store/useLoaderStore';

/**
 * Global Loading Bar Component
 * Smooth fade in/out with debounced visibility
 */
export function GlobalLoader() {
  const showLoader = useShowLoader();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showLoader) {
      setIsVisible(true);
    } else {
      // Slight delay for smooth fade-out
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [showLoader]);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Loading Bar */}
      <div
        className={`fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 z-50 transition-opacity duration-300 ${
          showLoader ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          animation: showLoader ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
        }}
      />

      {/* Backdrop Blur (optional) */}
      {showLoader && (
        <div
          className="fixed inset-0 bg-black/5 backdrop-blur-sm z-40 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: showLoader ? 1 : 0,
          }}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
        }

        @keyframes slide {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </>
  );
}

/**
 * Loading Spinner Component (for use in buttons, forms, etc.)
 */
export function LoadingSpinner({ size = 'sm', text = '' }: { size?: 'sm' | 'md' | 'lg'; text?: string }) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeMap[size]} border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin`}
      />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
}

/**
 * Skeleton Loader Component (for content loading)
 */
export function SkeletonLoader({ count = 3, type = 'line' }: { count?: number; type?: 'line' | 'card' }) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
            <div className="h-8 bg-gray-100 rounded mt-4 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  );
}

/**
 * Table Skeleton Loader
 */
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowI) => (
            <tr key={rowI} className="border-b hover:bg-gray-50">
              {Array.from({ length: columns }).map((_, colI) => (
                <td key={colI} className="px-4 py-3">
                  <div className="h-4 bg-gray-100 rounded animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Card Shimmer Loader (modern shimmer effect)
 */
export function CardShimmer() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-150 to-gray-200 rounded animate-pulse" />
      <div className="space-y-3">
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-150 to-gray-200 rounded animate-pulse w-5/6" />
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-150 to-gray-200 rounded animate-pulse w-4/6" />
      </div>
      <div className="flex gap-2 pt-4">
        <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-150 to-gray-200 rounded animate-pulse flex-1" />
        <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-150 to-gray-200 rounded animate-pulse flex-1" />
      </div>
    </div>
  );
}
