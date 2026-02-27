'use client';

import * as React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { cn } from '../lib/cn';

export interface EventCardProps {
  title: string;
  date: string;
  time: string;
  category?: string;
  venue?: string;
  imageUrl?: string;
  priceSek?: string;
  href: string;
  isOnline?: boolean;
  className?: string;
}

/** Event card for calendar/listing pages. */
export function EventCard({
  title, date, time, category, venue, imageUrl, priceSek, href, isOnline, className,
}: EventCardProps) {
  return (
    <a href={href} className={cn('block group', className)}>
      <Card hoverable className="overflow-hidden p-0">
        {imageUrl && (
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            {category && <Badge variant="brand">{category}</Badge>}
            {isOnline && <Badge>Online</Badge>}
          </div>
          <h3 className="text-base font-semibold text-primary mb-1 group-hover:text-brand transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted">
            {date} · {time}
          </p>
          {venue && <p className="text-sm text-muted">{venue}</p>}
          {priceSek && (
            <p className="text-sm font-medium text-primary mt-2">{priceSek} kr</p>
          )}
        </div>
      </Card>
    </a>
  );
}
