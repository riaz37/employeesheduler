'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { AnalyticsFilters, DateRange } from '@/components/analytics/analytics-filters';
import { AnalyticsExport } from '@/components/analytics/analytics-export';
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';
import { AnalyticsOverview } from '@/components/analytics/analytics-overview';
import { 
  Share2,
  Download
} from 'lucide-react';

export default function DashboardPage() {
  // Fix date logic - use current date and last 30 days
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const handleExport = async (format: string, fields: string[], options: Record<string, unknown>) => {
    console.log('Exporting analytics:', { format, fields, options });
    // TODO: Implement actual export logic using AnalyticsService
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate export
  };

  const handleShare = () => {
    console.log('Sharing analytics');
    // TODO: Implement share functionality
  };

  const handleQuickStatsExport = () => {
    console.log('Exporting quick stats');
    // TODO: Implement quick stats export
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Analytics Dashboard"
        description="Real-time analytics and insights into employee performance, shift coverage, and operational efficiency"
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleQuickStatsExport}>
              <Download className="mr-2 h-4 w-4" />
              Quick Stats
            </Button>
            <AnalyticsExport onExport={handleExport} />
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        }
      />

      {/* Analytics Overview - Consolidated */}
      <AnalyticsOverview
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        location={selectedLocations.length === 1 ? selectedLocations[0] : undefined}
        team={selectedTeams.length === 1 ? selectedTeams[0] : undefined}
        department={selectedDepartments.length === 1 ? selectedDepartments[0] : undefined}
      />

      {/* Filters */}
      <AnalyticsFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        departments={['Engineering', 'Sales', 'Marketing', 'Operations', 'HR', 'Finance']}
        teams={['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta']}
        locations={['Main Office', 'Branch A', 'Branch B', 'Remote']}
        selectedDepartments={selectedDepartments}
        selectedTeams={selectedTeams}
        selectedLocations={selectedLocations}
        onDepartmentChange={setSelectedDepartments}
        onTeamChange={setSelectedTeams}
        onLocationChange={setSelectedLocations}
        onReset={() => {
          setSelectedDepartments([]);
          setSelectedTeams([]);
          setSelectedLocations([]);
        }}
      />

      {/* Main Analytics Dashboard */}
      <AnalyticsDashboard
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        location={selectedLocations.length === 1 ? selectedLocations[0] : undefined}
        team={selectedTeams.length === 1 ? selectedTeams[0] : undefined}
        department={selectedDepartments.length === 1 ? selectedDepartments[0] : undefined}
      />
    </div>
  );
} 