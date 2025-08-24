import React from 'react';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, startOfWeek, endOfWeek } from 'date-fns';
import { Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default function DateRangeSelector({
  date,
  setDate,
  onReset,
  className,
}) {
  const quickRanges = [
    {
      label: 'Today',
      range: {
        from: new Date(),
        to: new Date()
      }
    },
    {
      label: 'Yesterday', 
      range: {
        from: subDays(new Date(), 1),
        to: subDays(new Date(), 1)
      }
    },
    {
      label: 'This Week',
      range: {
        from: startOfWeek(new Date()),
        to: endOfWeek(new Date())
      }
    },
    {
      label: 'Last 7 Days',
      range: {
        from: subDays(new Date(), 6),
        to: new Date()
      }
    },
    {
      label: 'Last 30 Days',
      range: {
        from: subDays(new Date(), 29),
        to: new Date()
      }
    },
    {
      label: 'This Month',
      range: {
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
      }
    },
    {
      label: 'Last Month',
      range: {
        from: startOfMonth(subDays(startOfMonth(new Date()), 1)),
        to: endOfMonth(subDays(startOfMonth(new Date()), 1))
      }
    },
    {
      label: 'This Year',
      range: {
        from: startOfYear(new Date()),
        to: endOfYear(new Date())
      }
    }
  ];

  const handleQuickRange = (range) => {
    setDate(range);
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="ghost"
            className={cn(
              'w-[300px] justify-start text-left glass-darker hover:glass-hover text-white rounded-2xl px-4 py-2 border-0 h-12',
              !date && 'text-glass-muted'
            )}
          >
            <CalendarIcon className="mr-3 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span className="text-sm">Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 glass-panel border-0 rounded-2xl" align="start">
          <div className="flex">
            {/* Quick Ranges Section */}
            <div className="glass-darker rounded-l-2xl p-4 w-48 border-r border-white/10">
              <h4 className="text-glass font-medium text-sm mb-3">Quick Ranges</h4>
              <div className="space-y-1">
                {quickRanges.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleQuickRange(item.range)}
                    className="w-full text-left text-sm text-glass-muted hover:text-glass hover:glass-light rounded-xl px-3 py-2 transition-all duration-200"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Calendar Section */}
            <div className="rounded-r-2xl">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                className="text-glass"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Button
        variant="ghost"
        size="icon"
        onClick={onReset}
        className="glass-darker hover:glass-hover text-white rounded-2xl h-12 w-12"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}