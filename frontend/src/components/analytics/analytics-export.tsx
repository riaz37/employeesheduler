'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, FileText, FileSpreadsheet, FileImage, Mail, Share2, Calendar, Filter } from 'lucide-react';

export interface ExportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  formats: string[];
}

export interface ExportField {
  id: string;
  label: string;
  category: string;
  required: boolean;
  default: boolean;
}

export interface AnalyticsExportProps {
  title?: string;
  description?: string;
  exportOptions?: ExportOption[];
  exportFields?: ExportField[];
  onExport: (format: string, fields: string[], options: Record<string, unknown>) => Promise<void>;
  className?: string;
}

export function AnalyticsExport({
  title = 'Export Analytics',
  description = 'Export your analytics data in various formats',
  exportOptions = [
    {
      id: 'employee-performance',
      label: 'Employee Performance',
      description: 'Individual employee metrics and KPIs',
      icon: FileText,
      formats: ['csv', 'excel', 'pdf'],
    },
    {
      id: 'shift-coverage',
      label: 'Shift Coverage',
      description: 'Shift scheduling and coverage analysis',
      icon: Calendar,
      formats: ['csv', 'excel', 'pdf'],
    },
    {
      id: 'time-off-analysis',
      label: 'Time-Off Analysis',
      description: 'Time-off patterns and trends',
      icon: Filter,
      formats: ['csv', 'excel', 'pdf'],
    },
    {
      id: 'schedule-optimization',
      label: 'Schedule Optimization',
      description: 'Schedule efficiency and optimization metrics',
      icon: FileSpreadsheet,
      formats: ['csv', 'excel', 'pdf'],
    },
  ],
  exportFields = [
    // Employee Performance
    { id: 'employee_id', label: 'Employee ID', category: 'employee-performance', required: true, default: true },
    { id: 'employee_name', label: 'Employee Name', category: 'employee-performance', required: true, default: true },
    { id: 'department', label: 'Department', category: 'employee-performance', required: false, default: true },
    { id: 'team', label: 'Team', category: 'employee-performance', required: false, default: true },
    { id: 'hours_worked', label: 'Hours Worked', category: 'employee-performance', required: false, default: true },
    { id: 'shifts_completed', label: 'Shifts Completed', category: 'employee-performance', required: false, default: true },
    { id: 'attendance_rate', label: 'Attendance Rate', category: 'employee-performance', required: false, default: true },
    { id: 'performance_score', label: 'Performance Score', category: 'employee-performance', required: false, default: true },
    
    // Shift Coverage
    { id: 'shift_id', label: 'Shift ID', category: 'shift-coverage', required: true, default: true },
    { id: 'shift_date', label: 'Shift Date', category: 'shift-coverage', required: true, default: true },
    { id: 'shift_time', label: 'Shift Time', category: 'shift-coverage', required: true, default: true },
    { id: 'location', label: 'Location', category: 'shift-coverage', required: false, default: true },
    { id: 'required_staff', label: 'Required Staff', category: 'shift-coverage', required: false, default: true },
    { id: 'assigned_staff', label: 'Assigned Staff', category: 'shift-coverage', required: false, default: true },
    { id: 'coverage_percentage', label: 'Coverage Percentage', category: 'shift-coverage', required: false, default: true },
    
    // Time-Off Analysis
    { id: 'request_id', label: 'Request ID', category: 'time-off-analysis', required: true, default: true },
    { id: 'employee_name', label: 'Employee Name', category: 'time-off-analysis', required: true, default: true },
    { id: 'request_type', label: 'Request Type', category: 'time-off-analysis', required: true, default: true },
    { id: 'start_date', label: 'Start Date', category: 'time-off-analysis', required: true, default: true },
    { id: 'end_date', label: 'End Date', category: 'time-off-analysis', required: true, default: true },
    { id: 'duration', label: 'Duration', category: 'time-off-analysis', required: false, default: true },
    { id: 'status', label: 'Status', category: 'time-off-analysis', required: false, default: true },
    { id: 'approval_date', label: 'Approval Date', category: 'time-off-analysis', required: false, default: true },
    
    // Schedule Optimization
    { id: 'schedule_id', label: 'Schedule ID', category: 'schedule-optimization', required: true, default: true },
    { id: 'schedule_date', label: 'Schedule Date', category: 'schedule-optimization', required: true, default: true },
    { id: 'total_shifts', label: 'Total Shifts', category: 'schedule-optimization', required: false, default: true },
    { id: 'total_hours', label: 'Total Hours', category: 'schedule-optimization', required: false, default: true },
    { id: 'coverage_score', label: 'Coverage Score', category: 'schedule-optimization', required: false, default: true },
    { id: 'conflict_count', label: 'Conflict Count', category: 'schedule-optimization', required: false, default: true },
    { id: 'efficiency_score', label: 'Efficiency Score', category: 'schedule-optimization', required: false, default: true },
  ],
  onExport,
  className = '',
}: AnalyticsExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [exportSettings, setExportSettings] = useState({
    includeCharts: true,
    includeSummary: true,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    groupBy: 'none',
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    setSelectedFormat('');
    setSelectedFields([]);
    
    // Set default fields for the selected option
    const defaultFields = exportFields
      .filter(field => field.category === optionId && field.default)
      .map(field => field.id);
    setSelectedFields(defaultFields);
  };

  const handleFormatSelect = (format: string) => {
    setSelectedFormat(format);
  };

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleExport = async () => {
    if (!selectedOption || !selectedFormat || selectedFields.length === 0) {
      return;
    }

    setIsExporting(true);
    try {
      await onExport(selectedFormat, selectedFields, exportOptions);
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getAvailableFormats = () => {
    const option = exportOptions.find(opt => opt.id === selectedOption);
    return option?.formats || [];
  };

  const getAvailableFields = () => {
    return exportFields.filter(field => field.category === selectedOption);
  };

  const canExport = selectedOption && selectedFormat && selectedFields.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Download className="mr-2 h-4 w-4" />
          {title}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Options */}
          <div className="space-y-3">
            <Label>Select Export Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exportOptions.map((option) => (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all ${
                    selectedOption === option.id
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <option.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{option.label}</h4>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Export Format */}
          {selectedOption && (
            <div className="space-y-3">
              <Label>Select Format</Label>
              <div className="flex space-x-2">
                {getAvailableFormats().map((format) => (
                  <Button
                    key={format}
                    variant={selectedFormat === format ? 'default' : 'outline'}
                    onClick={() => handleFormatSelect(format)}
                    className="flex items-center space-x-2"
                  >
                    {format === 'csv' && <FileText className="h-4 w-4" />}
                    {format === 'excel' && <FileSpreadsheet className="h-4 w-4" />}
                    {format === 'pdf' && <FileImage className="h-4 w-4" />}
                    <span className="uppercase">{format}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Export Fields */}
          {selectedOption && selectedFormat && (
            <div className="space-y-3">
              <Label>Select Fields to Export</Label>
              <div className="max-h-60 overflow-y-auto border rounded-lg p-4">
                <div className="space-y-2">
                  {getAvailableFields().map((field) => (
                    <div key={field.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={field.id}
                        checked={selectedFields.includes(field.id)}
                        onCheckedChange={() => toggleField(field.id)}
                        disabled={field.required}
                      />
                      <Label htmlFor={field.id} className="flex-1 cursor-pointer">
                        {field.label}
                        {field.required && <Badge variant="outline" className="ml-2 text-xs">Required</Badge>}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Export Options */}
          {selectedOption && selectedFormat && (
            <div className="space-y-3">
              <Label>Export Options</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeCharts"
                      checked={exportSettings.includeCharts}
                      onCheckedChange={(checked) => 
                        setExportSettings(prev => ({ ...prev, includeCharts: checked as boolean }))
                      }
                    />
                    <Label htmlFor="includeCharts">Include Charts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeSummary"
                      checked={exportSettings.includeSummary}
                      onCheckedChange={(checked) => 
                        setExportSettings(prev => ({ ...prev, includeSummary: checked as boolean }))
                      }
                    />
                    <Label htmlFor="includeSummary">Include Summary</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="dateFormat" className="text-sm">Date Format</Label>
                    <Select
                      value={exportSettings.dateFormat}
                      onValueChange={(value) => 
                        setExportSettings(prev => ({ ...prev, dateFormat: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timeFormat" className="text-sm">Time Format</Label>
                    <Select
                      value={exportSettings.timeFormat}
                      onValueChange={(value) => 
                        setExportSettings(prev => ({ ...prev, timeFormat: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour</SelectItem>
                        <SelectItem value="24h">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Button */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={!canExport || isExporting}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 