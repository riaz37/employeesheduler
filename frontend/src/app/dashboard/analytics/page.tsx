'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { AnalyticsFilters, DateRange } from '@/components/analytics/analytics-filters';
import { AnalyticsExport } from '@/components/analytics/analytics-export';
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';
import { 
  Share2,
  Download,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Users,
  Clock,
  Calendar
} from 'lucide-react';

export default function AnalyticsPage() {
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
        description="Comprehensive insights into employee performance, shift coverage, and operational efficiency"
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

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-green-600">+5.2% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-blue-600">Currently running</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-green-600">+1.8% from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflicts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-red-600">Critical issues</p>
          </CardContent>
        </Card>
      </div>

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

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span>Performance Insights</span>
            </CardTitle>
            <CardDescription>
              Key performance indicators and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Employee Satisfaction</span>
                <Badge variant="outline" className="text-green-600">4.2/5.0</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Training Completion</span>
                <Badge variant="outline" className="text-blue-600">87.3%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Conflict Resolution</span>
                <Badge variant="outline" className="text-orange-600">2.4 days</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span>Upcoming Events</span>
            </CardTitle>
            <CardDescription>
              Important dates and scheduled activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <span className="text-sm">Team Training Session</span>
                <Badge variant="secondary">Tomorrow</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="text-sm">Performance Reviews</span>
                <Badge variant="secondary">Next Week</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                <span className="text-sm">Schedule Planning</span>
                <Badge variant="secondary">In 3 days</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 