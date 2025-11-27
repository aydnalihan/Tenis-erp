'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { ReactNode } from 'react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  change?: string;
  description?: string;
  index?: number;
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  change,
  description,
  index = 0,
  className = '',
}: StatsCardProps) {
  return (
    <Card
      className={`relative overflow-hidden bg-white border-green-100 card-hover shadow-sm ${className}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-600" />
      
      <div className="flex flex-col gap-y-1 p-3 sm:p-4">
        {/* Üst satır: Title + Icon */}
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-500 leading-tight">
            {title}
          </CardTitle>
          <div className="rounded-lg sm:rounded-xl p-1.5 sm:p-2 lg:p-2.5 bg-green-100 flex-shrink-0">
            <Icon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-green-600" />
          </div>
        </div>

        {/* Orta satır: Büyük sayı */}
        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-none">
          {value}
        </div>

        {/* Alt satır: Subtitle / Change / Description */}
        {(subtitle || change || description) && (
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            {trend === 'up' && change && (
              <div className="flex items-center gap-0.5 sm:gap-1 text-green-600">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-[10px] sm:text-xs font-medium">{change}</span>
              </div>
            )}
            {trend === 'down' && change && (
              <div className="flex items-center gap-0.5 sm:gap-1 text-amber-600">
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-[10px] sm:text-xs font-medium">{change}</span>
              </div>
            )}
            {trend === 'neutral' && change && (
              <div className="flex items-center gap-0.5 sm:gap-1 text-gray-500">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-[10px] sm:text-xs font-medium">{change}</span>
              </div>
            )}
            {(subtitle || description) && (
              <span className="text-[10px] sm:text-xs text-gray-400">
                {subtitle || description}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

