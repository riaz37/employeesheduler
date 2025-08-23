"use client";

import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  [key: string]: string | number | boolean | ChartDataPoint[] | undefined;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
  [key: string]: string | number | boolean | ChartDataPoint[] | undefined;
}

export interface ChartConfig {
  type:
    | "bar"
    | "line"
    | "area"
    | "pie"
    | "doughnut"
    | "radar"
    | "composed"
    | "scatter";
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
  colors?: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  valueFormatter?: (value: number) => string;
}

interface AnalyticsChartProps {
  title: string;
  description?: string;
  data: ChartDataPoint[] | ChartSeries[];
  config?: ChartConfig;
  height?: number;
  isLoading?: boolean;
  error?: Error | null;
  className?: string;
}

const defaultColors = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
  "#f43f5e",
];

export function AnalyticsChart({
  title,
  description,
  data,
  config = { type: "bar" },
  height = 300,
  isLoading = false,
  error = null,
  className = "",
}: AnalyticsChartProps) {
  const {
    type,
    showGrid = true,
    showLegend = true,
    showTooltip = true,
    animate = true,
    colors = defaultColors,
    xAxisLabel,
    yAxisLabel,
    valueFormatter = (value: number) => value.toString(),
  } = config;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full" style={{ height: `${height}px` }} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-red-600">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-red-500">
            <p>Error loading chart: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-gray-500">
            <p>No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    const isMultiSeries =
      Array.isArray(data) && data.length > 0 && "data" in data[0];

    if (type === "bar") {
      if (isMultiSeries) {
            return (
          <ComposedChart data={(data as ChartSeries[])[0]?.data || []} height={height}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="label" />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {(data as ChartSeries[]).map((series, index) => (
              <Bar
                key={series.name}
                dataKey="value"
                fill={series.color || colors[index % colors.length]}
                name={series.name}
                animationDuration={animate ? 1000 : 0}
              />
            ))}
          </ComposedChart>
        );
      }

      return (
        <BarChart data={data as ChartDataPoint[]} height={height}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey="label" />
          <YAxis />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          <Bar
            dataKey="value"
            fill={colors[0]}
            animationDuration={animate ? 1000 : 0}
          />
        </BarChart>
      );
    }

    if (type === "line") {
      if (isMultiSeries) {
    return (
          <LineChart data={(data as ChartSeries[])[0]?.data || []} height={height}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="label" />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {(data as ChartSeries[]).map((series, index) => (
              <Line
                key={series.name}
                type="monotone"
                dataKey="value"
                stroke={series.color || colors[index % colors.length]}
                name={series.name}
                strokeWidth={2}
                dot={{ fill: series.color || colors[index % colors.length], strokeWidth: 2, r: 4 }}
                animationDuration={animate ? 1000 : 0}
              />
            ))}
          </LineChart>
        );
      }

      return (
        <LineChart data={data as ChartDataPoint[]} height={height}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey="label" />
          <YAxis />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          <Line
            type="monotone"
            dataKey="value"
            stroke={colors[0]}
            strokeWidth={2}
            dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
            animationDuration={animate ? 1000 : 0}
          />
        </LineChart>
      );
    }

    if (type === "area") {
      if (isMultiSeries) {
    return (
          <AreaChart data={(data as ChartSeries[])[0]?.data || []} height={height}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="label" />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {(data as ChartSeries[]).map((series, index) => (
              <Area
                key={series.name}
                type="monotone"
                dataKey="value"
                fill={series.color || colors[index % colors.length]}
                stroke={series.color || colors[index % colors.length]}
                name={series.name}
                fillOpacity={0.6}
                animationDuration={animate ? 1000 : 0}
              />
            ))}
          </AreaChart>
        );
      }
    
    return (
        <AreaChart data={data as ChartDataPoint[]} height={height}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey="label" />
          <YAxis />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          <Area
            type="monotone"
            dataKey="value"
            fill={colors[0]}
            stroke={colors[0]}
            fillOpacity={0.6}
            animationDuration={animate ? 1000 : 0}
          />
        </AreaChart>
      );
    }

    if (type === "pie" || type === "doughnut") {
      const pieData = isMultiSeries
        ? (data as ChartSeries[])[0]?.data || []
        : (data as ChartDataPoint[]);

      return (
        <PieChart height={height}>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ label, percent }) => `${label} ${((percent || 0) * 100).toFixed(0)}%`}
            outerRadius={type === "doughnut" ? 80 : 100}
            innerRadius={type === "doughnut" ? 40 : 0}
            dataKey="value"
            animationDuration={animate ? 1000 : 0}
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || colors[index % colors.length]}
              />
            ))}
          </Pie>
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
        </PieChart>
      );
    }

    if (type === "radar") {
      if (isMultiSeries) {
            return (
          <RadarChart data={(data as ChartSeries[])[0]?.data || []} height={height}>
            <PolarGrid />
            <PolarAngleAxis dataKey="label" />
            <PolarRadiusAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {(data as ChartSeries[]).map((series, index) => (
              <Radar
                key={series.name}
                name={series.name}
                dataKey="value"
                stroke={series.color || colors[index % colors.length]}
                fill={series.color || colors[index % colors.length]}
                fillOpacity={0.3}
                animationDuration={animate ? 1000 : 0}
              />
            ))}
          </RadarChart>
        );
      }

      return (
        <RadarChart data={data as ChartDataPoint[]} height={height}>
          <PolarGrid />
          <PolarAngleAxis dataKey="label" />
          <PolarRadiusAxis />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          <Radar
            name="Value"
            dataKey="value"
            stroke={colors[0]}
            fill={colors[0]}
            fillOpacity={0.3}
            animationDuration={animate ? 1000 : 0}
          />
        </RadarChart>
    );
    }

    if (type === "composed") {
      return (
        <ComposedChart data={data as ChartDataPoint[]} height={height}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey="label" />
          <YAxis />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          <Bar dataKey="value" fill={colors[0]} />
          <Line type="monotone" dataKey="value" stroke={colors[1]} />
        </ComposedChart>
      );
    }

    if (type === "scatter") {
      return (
        <ComposedChart data={data as ChartDataPoint[]} height={height}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey="label" />
          <YAxis />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          <Scatter dataKey="value" fill={colors[0]} />
        </ComposedChart>
      );
    }

        return <div>Unsupported chart type</div>;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {xAxisLabel && (
            <Badge variant="outline" className="text-xs">
              X: {xAxisLabel}
            </Badge>
          )}
          {yAxisLabel && (
            <Badge variant="outline" className="text-xs">
              Y: {yAxisLabel}
          </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 
