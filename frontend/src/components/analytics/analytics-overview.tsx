"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Clock,
  Calendar,
  AlertTriangle,
  Target,
  UserCheck,
  BarChart3,
} from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";
import { RoleCoverageMetric, CoverageOptimization } from "@/types";

interface AnalyticsOverviewProps {
  startDate: string;
  endDate: string;
  location?: string;
  team?: string;
  department?: string;
}

type TrendType = 'neutral' | 'increase' | 'decrease';

interface StatCard {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  trend: string;
  trendType: TrendType;
}

export function AnalyticsOverview({
  startDate,
  endDate,
  location,
  team,
  department,
}: AnalyticsOverviewProps) {
  const { useDashboardStats, useConflictAnalysis, useCoverageOptimization } =
    useAnalytics();

  const dashboardStats = useDashboardStats(
    startDate,
    location,
    team,
    department
  );
  const conflictAnalysis = useConflictAnalysis(
    startDate,
    endDate,
    location,
    team,
    department
  );
  const coverageOptimization = useCoverageOptimization(
    startDate,
    endDate,
    location,
    team,
    department
  );

  const isLoading =
    dashboardStats.isLoading ||
    conflictAnalysis.isLoading ||
    coverageOptimization.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Key Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Conflict & Coverage Status Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conflict Status Skeleton */}
          <Card className="border-orange-200">
            <CardHeader>
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
                <div className="p-3 bg-gray-100 rounded-lg">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coverage Status Skeleton */}
          <Card className="border-blue-200">
            <CardHeader>
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Overall Coverage Skeleton */}
                <div>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between mb-2">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                      <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                  {/* Progress Bar Skeleton */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-300 h-2 rounded-full w-3/4 animate-pulse" />
                  </div>
                </div>

                {/* Role Coverage Skeleton */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                  
                  {/* Role Grid Skeleton */}
                  <div className="grid grid-cols-2 gap-2 max-h-32">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-gray-100 p-2 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optimization Suggestions Skeleton */}
                <div className="p-3 bg-gray-100 rounded-lg">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const stats: StatCard[] = [
    {
      title: "Total Employees",
      value: dashboardStats.data?.totalEmployees || 0,
      icon: Users,
      color: "#3b82f6",
      trend: dashboardStats.data?.totalEmployees
        ? `${dashboardStats.data.totalEmployees} employees`
        : "No data",
      trendType: "neutral",
    },
    {
      title: "Active Shifts",
      value: dashboardStats.data?.activeShifts || 0,
      icon: Clock,
      color: "#10b981",
      trend: dashboardStats.data?.activeShifts
        ? `${dashboardStats.data.activeShifts} running`
        : "No active shifts",
      trendType: "neutral",
    },
    {
      title: "Upcoming Shifts",
      value: dashboardStats.data?.upcomingShifts || 0,
      icon: Calendar,
      color: "#f59e0b",
      trend: dashboardStats.data?.upcomingShifts
        ? `${dashboardStats.data.upcomingShifts} scheduled`
        : "No upcoming shifts",
      trendType: "neutral",
    },
    {
      title: "Pending Time Off",
      value: dashboardStats.data?.pendingTimeOff || 0,
      icon: UserCheck,
      color: "#8b5cf6",
      trend: dashboardStats.data?.pendingTimeOff
        ? `${dashboardStats.data.pendingTimeOff} pending`
        : "No pending requests",
      trendType: "neutral",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon
                className="h-4 w-4 text-muted-foreground"
                style={{ color: stat.color }}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p
                className={`text-xs ${
                  stat.trendType === "increase"
                    ? "text-green-600"
                    : stat.trendType === "decrease"
                    ? "text-red-600"
                    : "text-blue-600"
                }`}
              >
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Metrics - Removed redundant section */}

      {/* Conflict & Coverage Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conflict Status */}
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Conflict Status</span>
            </CardTitle>
            <CardDescription>
              Current conflict situation and resolution progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {conflictAnalysis.data ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Total Conflicts</span>
                  <Badge variant="outline">
                    {conflictAnalysis.data.totalConflicts}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Critical Conflicts</span>
                  <Badge variant="destructive">
                    {conflictAnalysis.data.criticalConflicts}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Resolution Progress</span>
                  <Badge variant="secondary">
                    {Math.round(
                      ((conflictAnalysis.data.totalConflicts -
                        conflictAnalysis.data.criticalConflicts) /
                        conflictAnalysis.data.totalConflicts) *
                        100
                    )}
                    %
                  </Badge>
                </div>
                {conflictAnalysis.data.criticalConflicts > 0 && (
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-800 font-medium">
                      ⚠️ {conflictAnalysis.data.criticalConflicts} critical
                      conflicts require immediate attention
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No conflict data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coverage Status */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-600">
              <Target className="h-5 w-5" />
              <span>Coverage Status</span>
            </CardTitle>
            <CardDescription>
              Current coverage metrics and optimization status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {coverageOptimization.data ? (
              <div className="space-y-4">
                {/* Overall Coverage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Overall Coverage</span>
                    <Badge variant="outline">
                      {coverageOptimization.data.currentCoverage}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span>Target Coverage</span>
                    <Badge variant="default">
                      {coverageOptimization.data.targetCoverage}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Coverage Gap</span>
                    <Badge variant="secondary">
                      {coverageOptimization.data.targetCoverage -
                        coverageOptimization.data.currentCoverage}
                      %
                    </Badge>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        (coverageOptimization.data.currentCoverage /
                          coverageOptimization.data.targetCoverage) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>

                {/* Role-specific Coverage */}
                {coverageOptimization.data?.roleCoverageMetrics && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium">Coverage by Role</h4>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            View All
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              <BarChart3 className="h-5 w-5" />
                              <span>Coverage by Role</span>
                            </DialogTitle>
                            <DialogDescription>
                              Detailed coverage metrics for all roles in the selected period.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3">
                            {coverageOptimization.data.roleCoverageMetrics.map((role: RoleCoverageMetric, index: number) => (
                              <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">{role.role}</span>
                                  <Badge
                                    variant={
                                      role.coverage >= 95
                                        ? "outline"
                                        : role.coverage >= 80
                                        ? "secondary"
                                        : "destructive"
                                    }
                                  >
                                    {role.coverage}%
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">Assigned:</span> {role.assigned}/{role.required}
                                  </div>
                                  {role.gaps > 0 && (
                                    <div className="text-red-600">
                                      <span className="font-medium">Gaps:</span> {role.gaps}
                                    </div>
                                  )}
                                  {role.overlaps > 0 && (
                                    <div className="text-orange-600">
                                      <span className="font-medium">Overlaps:</span> {role.overlaps}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    {/* Compact Grid Layout */}
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {coverageOptimization.data.roleCoverageMetrics.slice(0, 6).map((role: RoleCoverageMetric, index: number) => (
                        <div key={index} className="bg-gray-50 p-2 rounded-lg border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium truncate" title={role.role}>
                              {role.role}
                            </span>
                            <Badge
                              variant={
                                role.coverage >= 95
                                  ? "outline"
                                  : role.coverage >= 80
                                  ? "secondary"
                                  : "destructive"
                              }
                              className="text-xs h-5 px-1"
                            >
                              {role.coverage}%
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className="block truncate">
                              {role.assigned}/{role.required}
                            </span>
                            {role.gaps > 0 && (
                              <span className="text-red-500 text-xs">
                                {role.gaps} gap{role.gaps > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Show remaining roles count if more than 6 */}
                    {coverageOptimization.data.roleCoverageMetrics.length > 6 && (
                      <div className="mt-2 text-center">
                        <span className="text-xs text-gray-500">
                          +{coverageOptimization.data.roleCoverageMetrics.length - 6} more roles
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Optimization Suggestions */}
                {coverageOptimization.data.optimizationSuggestions &&
                  coverageOptimization.data.optimizationSuggestions.length > 0 && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800 font-medium">
                        💡{" "}
                        {coverageOptimization.data.optimizationSuggestions.length}{" "}
                        optimization suggestions available
                      </p>
                    </div>
                  )}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No coverage data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
