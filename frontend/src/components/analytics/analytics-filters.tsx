"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X,Filter, RefreshCw } from "lucide-react";

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface AnalyticsFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  departments?: string[];
  teams?: string[];
  locations?: string[];
  selectedDepartments: string[];
  selectedTeams: string[];
  selectedLocations: string[];
  onDepartmentChange: (departments: string[]) => void;
  onTeamChange: (teams: string[]) => void;
  onLocationChange: (locations: string[]) => void;
  onReset: () => void;
  className?: string;
}

export function AnalyticsFilters({
  dateRange,
  onDateRangeChange,
  departments = [],
  teams = [],
  locations = [],
  selectedDepartments,
  selectedTeams,
  selectedLocations,
  onDepartmentChange,
  onTeamChange,
  onLocationChange,
  onReset,
  className = "",
}: AnalyticsFiltersProps) {
  const [quickDateRange, setQuickDateRange] = useState<string>("");

  const handleQuickDateRange = (range: string) => {
    const today = new Date();
    const startDate = new Date();
    const endDate = new Date();

    switch (range) {
      case "today":
        // Keep today
        break;
      case "yesterday":
        startDate.setDate(today.getDate() - 1);
        endDate.setDate(today.getDate() - 1);
        break;
      case "last7days":
        startDate.setDate(today.getDate() - 7);
        break;
      case "last30days":
        startDate.setDate(today.getDate() - 30);
        break;
      case "thisWeek":
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        startDate.setDate(diff);
        break;
      case "thisMonth":
        startDate.setDate(1);
        break;
      case "lastMonth":
        startDate.setMonth(today.getMonth() - 1, 1);
        endDate.setMonth(today.getMonth(), 0);
        break;
      case "thisYear":
        startDate.setMonth(0, 1);
        break;
      case "lastYear":
        startDate.setFullYear(today.getFullYear() - 1, 0, 1);
        endDate.setFullYear(today.getFullYear() - 1, 11, 31);
        break;
      default:
        return;
    }

    onDateRangeChange({
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    });
    setQuickDateRange(range);
  };

  const toggleDepartment = (dept: string) => {
    if (selectedDepartments.includes(dept)) {
      onDepartmentChange(selectedDepartments.filter((d) => d !== dept));
    } else {
      onDepartmentChange([...selectedDepartments, dept]);
    }
  };

  const toggleTeam = (team: string) => {
    if (selectedTeams.includes(team)) {
      onTeamChange(selectedTeams.filter((t) => t !== team));
    } else {
      onTeamChange([...selectedTeams, team]);
    }
  };

  const toggleLocation = (location: string) => {
    if (selectedLocations.includes(location)) {
      onLocationChange(selectedLocations.filter((l) => l !== location));
    } else {
      onLocationChange([...selectedLocations, location]);
    }
  };

  const hasActiveFilters =
    selectedDepartments.length > 0 ||
    selectedTeams.length > 0 ||
    selectedLocations.length > 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Analytics Filters</span>
        </CardTitle>
        <CardDescription>
          Filter analytics data by date range, departments, teams, and locations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range */}
        <div className="space-y-3">
          <Label>Date Range</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-sm">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  onDateRangeChange({ ...dateRange, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-sm">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  onDateRangeChange({ ...dateRange, endDate: e.target.value })
                }
              />
            </div>
          </div>

          {/* Quick Date Ranges */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: "today", label: "Today" },
              { value: "yesterday", label: "Yesterday" },
              { value: "last7days", label: "Last 7 Days" },
              { value: "last30days", label: "Last 30 Days" },
              { value: "thisWeek", label: "This Week" },
              { value: "thisMonth", label: "This Month" },
              { value: "lastMonth", label: "Last Month" },
              { value: "thisYear", label: "This Year" },
              { value: "lastYear", label: "Last Year" },
            ].map((range) => (
              <Button
                key={range.value}
                variant={quickDateRange === range.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickDateRange(range.value)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Departments */}
        {departments.length > 0 && (
          <div className="space-y-3">
            <Label>Departments</Label>
            <div className="flex flex-wrap gap-2">
              {departments.map((dept) => (
                <Badge
                  key={dept}
                  variant={
                    selectedDepartments.includes(dept) ? "default" : "outline"
                  }
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => toggleDepartment(dept)}
                >
                  {dept}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Teams */}
        {teams.length > 0 && (
          <div className="space-y-3">
            <Label>Teams</Label>
            <div className="flex flex-wrap gap-2">
              {teams.map((team) => (
                <Badge
                  key={team}
                  variant={selectedTeams.includes(team) ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => toggleTeam(team)}
                >
                  {team}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Locations */}
        {locations.length > 0 && (
          <div className="space-y-3">
            <Label>Locations</Label>
            <div className="flex flex-wrap gap-2">
              {locations.map((location) => (
                <Badge
                  key={location}
                  variant={
                    selectedLocations.includes(location) ? "default" : "outline"
                  }
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => toggleLocation(location)}
                >
                  {location}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="space-y-3">
            <Label>Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {selectedDepartments.map((dept) => (
                <Badge
                  key={`dept-${dept}`}
                  variant="secondary"
                  className="flex items-center space-x-1"
                >
                  <span>Dept: {dept}</span>
                  <button
                    onClick={() => toggleDepartment(dept)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {selectedTeams.map((team) => (
                <Badge
                  key={`team-${team}`}
                  variant="secondary"
                  className="flex items-center space-x-1"
                >
                  <span>Team: {team}</span>
                  <button
                    onClick={() => toggleTeam(team)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {selectedLocations.map((location) => (
                <Badge
                  key={`location-${location}`}
                  variant="secondary"
                  className="flex items-center space-x-1"
                >
                  <span>Location: {location}</span>
                  <button
                    onClick={() => toggleLocation(location)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={onReset}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset Filters</span>
          </Button>

          <div className="text-sm text-gray-500">
            {hasActiveFilters && (
              <span>
                {selectedDepartments.length +
                  selectedTeams.length +
                  selectedLocations.length}{" "}
                active filters
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
