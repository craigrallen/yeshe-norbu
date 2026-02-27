'use client';

import * as React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { cn } from '../lib/cn';

export interface CourseCardProps {
  title: string;
  teacher?: string;
  imageUrl?: string;
  access: 'free' | 'paid' | 'membership';
  priceSek?: string;
  progress?: number;
  href: string;
  className?: string;
}

/** Course card for catalogue pages. */
export function CourseCard({ title, teacher, imageUrl, access, priceSek, progress, href, className }: CourseCardProps) {
  const accessLabel = access === 'free' ? 'Gratis' : access === 'membership' ? 'Medlem' : `${priceSek} kr`;

  return (
    <a href={href} className={cn('block group', className)}>
      <Card hoverable className="overflow-hidden p-0">
        {imageUrl && (
          <div className="aspect-[16/10] overflow-hidden">
            <img src={imageUrl} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={access === 'free' ? 'success' : 'brand'}>{accessLabel}</Badge>
          </div>
          <h3 className="text-base font-semibold text-primary mb-1 group-hover:text-brand transition-colors">{title}</h3>
          {teacher && <p className="text-sm text-muted">{teacher}</p>}
          {typeof progress === 'number' && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </Card>
    </a>
  );
}
