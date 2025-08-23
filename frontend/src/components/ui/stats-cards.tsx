'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

export interface StatCard {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
}

export interface StatsCardsProps {
  stats: StatCard[];
  columns?: 2 | 3 | 4 | 6;
}

export function StatsCards({ stats, columns = 4 }: StatsCardsProps) {
  const getGridCols = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-3';
      case 6:
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    }
  };

  return (
    <div className={`grid ${getGridCols()} gap-6`}>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.description && (
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            )}
            {stat.trend && (
              <div className="flex items-center space-x-1 mt-2">
                <span
                  className={`text-xs ${
                    stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.trend.isPositive ? '+' : ''}{stat.trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">{stat.trend.label}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 