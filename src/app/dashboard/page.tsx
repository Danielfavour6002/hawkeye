
"use client";

import { useEffect, useState, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import StatCard from '@/components/dashboard/StatCard';
import AlertItemCard from '@/components/dashboard/AlertCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { summarizeIntrusionData } from '@/ai/flows/summarize-intrusion-data';
import type { Alert, TrafficLogEntry } from '@/types';
import { formatDisplayDate } from '@/types';
import { generateMultipleAlerts, generateMultipleTrafficLogs, getMockIntrusionDataForSummary } from '@/lib/mockData';
import { Activity, AlertOctagon, BarChart3, ListFilter, FileText } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [trafficLogs, setTrafficLogs] = useState<TrafficLogEntry[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);

  useEffect(() => {
    // Simulate fetching data
    setIsLoadingStats(true);
    const timer = setTimeout(() => {
      setAlerts(generateMultipleAlerts(10)); // Generate 10 mock alerts
      setTrafficLogs(generateMultipleTrafficLogs(20)); // Generate 20 mock traffic logs
      setIsLoadingStats(false);
    }, 1500); // Simulate network delay
    return () => clearTimeout(timer);
  }, []);

  const criticalAlertsCount = useMemo(() => alerts.filter(a => a.severity === 'Critical').length, [alerts]);
  const anomaliesDetectedCount = useMemo(() => trafficLogs.filter(log => log.status === 'Anomalous').length, [trafficLogs]);

  const handleGenerateSummary = async () => {
    setIsLoadingSummary(true);
    setSummary(null);
    try {
      const intrusionData = getMockIntrusionDataForSummary(15); // Use 15 logs for summary
      const result = await summarizeIntrusionData({ intrusionData });
      setSummary(result.summary);
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummary("Failed to generate summary. Please try again.");
    }
    setIsLoadingSummary(false);
  };

  const recentAlerts = useMemo(() => alerts.slice(0, 3), [alerts]);
  const recentTraffic = useMemo(() => trafficLogs.slice(0, 5), [trafficLogs]);

  return (
    <AppShell pageTitle="Dashboard Overview">
      <div className="grid gap-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Active Alerts" value={isLoadingStats ? '-' : alerts.length} icon={AlertOctagon} description={`${criticalAlertsCount} critical`} isLoading={isLoadingStats} />
          <StatCard title="Anomalies Detected" value={isLoadingStats ? '-' : anomaliesDetectedCount} icon={Activity} description="In the last 24 hours" isLoading={isLoadingStats}/>
          <StatCard title="Traffic Volume" value={isLoadingStats ? '-' : `${(trafficLogs.reduce((acc, curr) => acc + curr.payloadSize,0)/1024/1024).toFixed(2)} MB`} icon={BarChart3} description="Total monitored" isLoading={isLoadingStats}/>
          <StatCard title="Logs Processed" value={isLoadingStats ? '-' : trafficLogs.length} icon={ListFilter} description="All entries" isLoading={isLoadingStats}/>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* AI Summary Card */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Daily Security Summary (AI)
              </CardTitle>
              <CardDescription>AI-generated overview of recent security events.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {isLoadingSummary && (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              )}
              {summary && !isLoadingSummary && <p className="text-sm text-muted-foreground whitespace-pre-line">{summary}</p>}
              {!summary && !isLoadingSummary && <p className="text-sm text-muted-foreground">Click the button to generate today's security summary.</p>}
            </CardContent>
            <div className="p-6 pt-0">
              <Button onClick={handleGenerateSummary} disabled={isLoadingSummary} className="w-full">
                {isLoadingSummary ? 'Generating...' : 'Generate Summary'}
              </Button>
            </div>
          </Card>

          {/* Recent Alerts Card */}
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Alerts</CardTitle>
                <Link href="/alerts">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
              <CardDescription>Top 3 most recent critical or high alerts.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {isLoadingStats && Array.from({length: 3}).map((_, idx) => <Skeleton key={idx} className="h-20 mb-2 rounded-lg"/>)}
              {!isLoadingStats && recentAlerts.length > 0 ? (
                <div className="space-y-4">
                  {recentAlerts.map(alert => <AlertItemCard key={alert.id} alert={alert} />)}
                </div>
              ) : (
                !isLoadingStats && <p className="text-sm text-muted-foreground">No recent alerts.</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Traffic Logs Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Traffic Logs</CardTitle>
              <Link href="/traffic-log">
                <Button variant="outline" size="sm">View All Logs</Button>
              </Link>
            </div>
            <CardDescription>A quick look at the latest network activities.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Source IP</TableHead>
                    <TableHead>Destination IP</TableHead>
                    <TableHead>Protocol</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingStats && Array.from({length: 5}).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell colSpan={5}><Skeleton className="h-5 w-full"/></TableCell>
                    </TableRow>
                  ))}
                  {!isLoadingStats && recentTraffic.length > 0 ? (
                    recentTraffic.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs">{formatDisplayDate(log.timestamp)}</TableCell>
                        <TableCell>{log.sourceIp}</TableCell>
                        <TableCell>{log.destinationIp}</TableCell>
                        <TableCell>{log.protocol}</TableCell>
                        <TableCell>
                           <span className={cn("px-2 py-1 text-xs rounded-full", 
                            log.status === 'Anomalous' ? 'bg-accent text-accent-foreground' : 
                            log.status === 'Suspicious' ? 'bg-yellow-400 text-black' : 'bg-green-500 text-white'
                          )}>
                            {log.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    !isLoadingStats && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No traffic logs available.
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
