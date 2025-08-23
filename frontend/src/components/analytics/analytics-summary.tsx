'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LucideIcon, TrendingUp, TrendingDown, Minus, Download, Share2 } from 'lucide-react';

export interface MetricItem {
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format?: 'number' | 'percentage' | 'currency' | 'time';
  icon?: LucideIcon;
  color?: string;
}

export interface AnalyticsSummaryProps {
  title: string;
  description?: string;
  metrics: MetricItem[];
  showActions?: boolean;
  onExport?: () => void;
  onShare?: () => void;
  className?: string;
}

export function AnalyticsSummary({
  title,
  description,
  metrics,
  showActions = true,
  onExport,
  onShare,
  className = '',
}: AnalyticsSummaryProps) {
  const formatValue = (value: string | number, format?: string) => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'percentage':
        return `${value}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(value);
      case 'time':
        return `${Math.floor(value / 60)}h ${value % 60}m`;
      case 'number':
      default:
        return new Intl.NumberFormat('en-US').format(value);
    }
  };

  const getChangeIcon = (changeType?: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'neutral':
        return <Minus className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getChangeColor = (changeType?: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {showActions && (
            <div className="flex items-center space-x-2">
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              )}
              {onShare && (
                <Button variant="outline" size="sm" onClick={onShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {metric.icon && (
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: metric.color ? `${metric.color}20` : '#f3f4f6' }}
                    >
                      <metric.icon
                        className="h-4 w-4"
                        style={{ color: metric.color || '#6b7280' }}
                      />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                </div>
                {metric.change !== undefined && (
                  <div className="flex items-center space-x-1">
                    {getChangeIcon(metric.changeType)}
                    <span className={`text-xs font-medium ${getChangeColor(metric.changeType)}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatValue(metric.value, metric.format)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 