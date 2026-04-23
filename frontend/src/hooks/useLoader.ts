'use client';

import { useCallback, useRef } from 'react';
import { useLoaderStore, useIsLoading, useShowLoader } from '@/store/useLoaderStore';

/**
 * Hook for using the global loader in components
 * Provides helper functions to manage loading state
 */
export function useLoader() {
  const isLoading = useIsLoading();
  const showLoader = useShowLoader();
  const { increment, decrement, reset } = useLoaderStore();
  const requestIdRef = useRef<string | null>(null);

  const startLoading = useCallback((requestId?: string) => {
    const id = requestId || `manual-${Date.now()}`;
    requestIdRef.current = id;
    increment(id);
  }, [increment]);

  const stopLoading = useCallback(() => {
    if (requestIdRef.current) {
      decrement(requestIdRef.current);
      requestIdRef.current = null;
    }
  }, [decrement]);

  const resetLoader = useCallback(() => {
    reset();
    requestIdRef.current = null;
  }, [reset]);

  return {
    isLoading,
    showLoader,
    startLoading,
    stopLoading,
    resetLoader,
  };
}

/**
 * Hook for form submission with automatic loader management
 */
export function useFormLoader() {
  const { startLoading, stopLoading } = useLoader();
  const isSubmittingRef = useRef(false);

  const withLoading = useCallback(
    async <T,>(callback: () => Promise<T>): Promise<T | null> => {
      if (isSubmittingRef.current) {
        console.warn('[useFormLoader] Submission already in progress');
        return null;
      }

      isSubmittingRef.current = true;
      startLoading('form-submission');

      try {
        const result = await callback();
        return result;
      } catch (error) {
        throw error;
      } finally {
        isSubmittingRef.current = false;
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  return {
    withLoading,
    isSubmitting: isSubmittingRef.current,
  };
}

/**
 * Hook for managing multiple concurrent API calls
 */
export function useConcurrentLoader() {
  const { startLoading, stopLoading } = useLoader();

  const withConcurrentLoading = useCallback(
    async <T,>(promises: Promise<T>[]): Promise<T[]> => {
      startLoading('concurrent-requests');

      try {
        const results = await Promise.all(promises);
        return results;
      } catch (error) {
        throw error;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  return {
    withConcurrentLoading,
  };
}

/**
 * Hook for preventing double submissions in buttons
 */
export function useSubmitButton() {
  const { isLoading, showLoader } = useLoader();
  const isSubmittingRef = useRef(false);

  const handleSubmit = useCallback(
    async (callback: () => Promise<void>) => {
      if (isSubmittingRef.current) {
        console.warn('[useSubmitButton] Already submitting');
        return;
      }

      isSubmittingRef.current = true;

      try {
        await callback();
      } catch (error) {
        throw error;
      } finally {
        isSubmittingRef.current = false;
      }
    },
    []
  );

  return {
    isSubmitting: isSubmittingRef.current || isLoading,
    showLoader,
    handleSubmit,
  };
}

/**
 * Hook for debugging loader state
 */
export function useLoaderDebug() {
  const { activeRequestsCount, debugMode, setDebugMode } = useLoaderStore();

  const toggleDebug = useCallback(() => {
    setDebugMode(!debugMode);
  }, [debugMode, setDebugMode]);

  return {
    debugMode,
    activeRequestsCount,
    toggleDebug,
  };
}
