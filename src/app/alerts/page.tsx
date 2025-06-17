"use client";

import { useEffect, useState, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import AlertItemCard from '@/components/dashboard/AlertCard';
import type { Alert } from '@/types';
import { generateMultipleAlerts } from '@/lib/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>(''); // YYYY-MM-DD

  useEffect(() => {
    setIsLoading(true);
    // Simulate fetching data
    const timer = setTimeout(() => {
      setAlerts(generateMultipleAlerts(50)); // Generate 50 mock alerts
      setIsLoading(false);
    }, 1000);
     return () => clearTimeout(timer);
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts
      .filter(alert => {
        const severityMatch = filterSeverity === 'all' ? true : alert.severity === filterSeverity;
        const dateMatch = filterDate ? alert.timestamp.startsWith(filterDate) : true;
        return severityMatch && dateMatch;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort by newest first
  }, [alerts, filterSeverity, filterDate]);

  const clearFilters = () => {
    setFilterSeverity('all');
    setFilterDate('');
  };

  return (
    <AppShell pageTitle="Intrusion Alerts">
      <div className="space-y-6">
        <div className="p-4 border rounded-lg bg-card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="filter-severity" className="block text-sm font-medium text-muted-foreground mb-1">Filter by Severity</label>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger id="filter-severity" className="w-full" aria-label="Filter by Severity">
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="filter-date" className="block text-sm font-medium text-muted-foreground mb-1">Filter by Date</label>
              <Input
                id="filter-date"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full"
                aria-label="Filter by Date"
              />
            </div>
            <Button onClick={clearFilters} variant="outline" className="w-full md:w-auto self-end">
              <XIcon className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
               <Skeleton key={index} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredAlerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlerts.map(alert => (
              <AlertItemCard key={alert.id} alert={alert} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-xl font-medium text-foreground">No Alerts Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your filters or check back later.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
