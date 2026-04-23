import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface LoaderState {
  // Core state
  activeRequestsCount: number;
  requestIds: Set<string>;
  
  // Derived state
  isGlobalLoading: boolean;
  showLoader: boolean; // Debounced visibility to prevent flicker
  
  // Debug mode
  debugMode: boolean;
  
  // Actions
  increment: (requestId: string) => void;
  decrement: (requestId: string) => void;
  reset: () => void;
  setDebugMode: (enabled: boolean) => void;
  
  // Internal
  _updateShowLoader: (visible: boolean) => void;
}

let debounceTimer: NodeJS.Timeout | null = null;

export const useLoaderStore = create<LoaderState>()(
  devtools(
    (set, get) => ({
      // Initial state
      activeRequestsCount: 0,
      requestIds: new Set(),
      isGlobalLoading: false,
      showLoader: false,
      debugMode: typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === 'true',

      // Core actions
      increment: (requestId: string) => {
        const state = get();
        
        // Prevent duplicates
        if (state.requestIds.has(requestId)) {
          if (state.debugMode) {
            console.warn(`[LoaderStore] Duplicate request ID: ${requestId}`);
          }
          return;
        }

        const newCount = state.activeRequestsCount + 1;
        const newRequestIds = new Set(state.requestIds);
        newRequestIds.add(requestId);

        set({
          activeRequestsCount: newCount,
          requestIds: newRequestIds,
          isGlobalLoading: true,
        });

        if (state.debugMode) {
          console.log(
            `[LoaderStore] Increment: ${requestId} | Active: ${newCount} | IDs:`,
            Array.from(newRequestIds)
          );
        }

        // Show loader after 300ms to prevent flicker
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
          set({ showLoader: true });
        }, 300);
      },

      decrement: (requestId: string) => {
        const state = get();
        
        if (!state.requestIds.has(requestId)) {
          if (state.debugMode) {
            console.warn(`[LoaderStore] Attempted to decrement unknown request ID: ${requestId}`);
          }
          return;
        }

        // Ensure count never goes below 0
        const newCount = Math.max(0, state.activeRequestsCount - 1);
        const newRequestIds = new Set(state.requestIds);
        newRequestIds.delete(requestId);

        set({
          activeRequestsCount: newCount,
          requestIds: newRequestIds,
          isGlobalLoading: newCount > 0,
        });

        if (state.debugMode) {
          console.log(
            `[LoaderStore] Decrement: ${requestId} | Active: ${newCount} | IDs:`,
            Array.from(newRequestIds)
          );
        }

        // Hide loader immediately if no more requests
        if (newCount === 0) {
          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }
          set({ showLoader: false });
        }
      },

      reset: () => {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        set({
          activeRequestsCount: 0,
          requestIds: new Set(),
          isGlobalLoading: false,
          showLoader: false,
        });
      },

      setDebugMode: (enabled: boolean) => {
        set({ debugMode: enabled });
        if (enabled) {
          console.log('[LoaderStore] Debug mode enabled');
        }
      },

      _updateShowLoader: (visible: boolean) => {
        set({ showLoader: visible });
      },
    }),
    {
      name: 'loader-store',
      enabled: typeof window !== 'undefined' && process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Selector for checking if any requests are active
 * Prevents unnecessary re-renders by using shallow comparison
 */
export const useIsLoading = () =>
  useLoaderStore((state) => state.isGlobalLoading);

/**
 * Selector for showing/hiding loader UI
 * Uses debounced visibility to prevent flicker
 */
export const useShowLoader = () =>
  useLoaderStore((state) => state.showLoader);

/**
 * Selector for getting active request count (debug mode)
 */
export const useActiveRequestsCount = () =>
  useLoaderStore((state) => state.activeRequestsCount);

/**
 * Cleanup hook to reset loader on unmount (optional)
 */
export const useLoaderCleanup = () => {
  return () => {
    useLoaderStore.getState().reset();
  };
};
