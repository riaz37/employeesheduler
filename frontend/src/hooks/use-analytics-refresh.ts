import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export interface UseAnalyticsRefreshOptions {
  enabled?: boolean;
  interval?: number; // milliseconds
  onRefresh?: () => void;
}

export const useAnalyticsRefresh = (options: UseAnalyticsRefreshOptions = {}) => {
  const {
    enabled = true,
    interval = 30000, // 30 seconds default
    onRefresh
  } = options;

  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshAllAnalytics = useCallback(() => {
    // Invalidate all analytics queries
    queryClient.invalidateQueries({ queryKey: ['daily-schedule'] });
    queryClient.invalidateQueries({ queryKey: ['weekly-analytics'] });
    queryClient.invalidateQueries({ queryKey: ['monthly-analytics'] });
    queryClient.invalidateQueries({ queryKey: ['employee-workload'] });
    queryClient.invalidateQueries({ queryKey: ['team-performance'] });
    queryClient.invalidateQueries({ queryKey: ['location-utilization'] });
    queryClient.invalidateQueries({ queryKey: ['conflict-analysis'] });
    queryClient.invalidateQueries({ queryKey: ['coverage-optimization'] });
    queryClient.invalidateQueries({ queryKey: ['conflicts-for-date'] });
    queryClient.invalidateQueries({ queryKey: ['coverage-gaps'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    queryClient.invalidateQueries({ queryKey: ['recent-activities'] });
    queryClient.invalidateQueries({ queryKey: ['upcoming-shifts'] });
    queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });

    // Call custom refresh callback if provided
    onRefresh?.();
  }, [queryClient, onRefresh]);

  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      refreshAllAnalytics();
    }, interval);
  }, [refreshAllAnalytics, interval]);

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const setRefreshInterval = useCallback((newInterval: number) => {
    stopAutoRefresh();
    if (enabled) {
      intervalRef.current = setInterval(() => {
        refreshAllAnalytics();
      }, newInterval);
    }
  }, [enabled, stopAutoRefresh, refreshAllAnalytics]);

  useEffect(() => {
    if (enabled) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }

    return () => {
      stopAutoRefresh();
    };
  }, [enabled, startAutoRefresh, stopAutoRefresh]);

  return {
    refreshAllAnalytics,
    startAutoRefresh,
    stopAutoRefresh,
    setRefreshInterval,
    isAutoRefreshEnabled: enabled,
    currentInterval: interval
  };
}; 