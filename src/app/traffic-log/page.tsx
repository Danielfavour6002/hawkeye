"use client";

import { useEffect, useState, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import { DataTable } from '@/components/DataTable'; // Ensure this path is correct
import type { TrafficLogEntry } from '@/types';
import { formatDisplayDate } from '@/types';
import { generateMultipleTrafficLogs } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const getStatusBadgeVariant = (status: TrafficLogEntry['status']) => {
  switch (status) {
    case 'Anomalous':
      return 'bg-accent text-accent-foreground hover:bg-accent/90';
    case 'Suspicious':
      return 'bg-yellow-400 text-black hover:bg-yellow-400/90';
    case 'Normal':
      return 'bg-green-500 text-white hover:bg-green-500/90';
    default:
      return 'bg-gray-500 text-white hover:bg-gray-500/90';
  }
};

const columns: { accessorKey: keyof TrafficLogEntry | string; header: string; cell: (row: TrafficLogEntry) => React.ReactNode }[] = [
  {
    accessorKey: 'timestamp',
    header: 'Timestamp',
    cell: (row) => <span className="text-xs">{formatDisplayDate(row.timestamp)}</span>,
  },
  {
    accessorKey: 'sourceIp',
    header: 'Source IP',
    cell: (row) => row.sourceIp,
  },
  {
    accessorKey: 'destinationIp',
    header: 'Destination IP',
    cell: (row) => row.destinationIp,
  },
  {
    accessorKey: 'protocol',
    header: 'Protocol',
    cell: (row) => <Badge variant="outline">{row.protocol}</Badge>,
  },
  {
    accessorKey: 'port',
    header: 'Port',
    cell: (row) => row.port,
  },
  {
    accessorKey: 'payloadSize',
    header: 'Size (Bytes)',
    cell: (row) => row.payloadSize,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => (
      <Badge className={cn("text-xs", getStatusBadgeVariant(row.status))}>
        {row.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'attackType',
    header: 'Classification',
    cell: (row) => <span className="text-xs">{row.attackType || 'N/A'}</span>,
  },
  {
    accessorKey: 'details',
    header: 'Details',
    cell: (row) => <span className="text-xs truncate block max-w-xs" title={row.details}>{row.details || 'N/A'}</span>,
  },
];

export default function TrafficLogPage() {
  const [trafficLogs, setTrafficLogs] = useState<TrafficLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterIp, setFilterIp] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProtocol, setFilterProtocol] = useState<string>('all');

  useEffect(() => {
    setIsLoading(true);
    // Simulate fetching data
    const timer = setTimeout(() => {
      setTrafficLogs(generateMultipleTrafficLogs(100)); // Generate 100 mock logs
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredLogs = useMemo(() => {
    return trafficLogs.filter(log => {
      const ipMatch = filterIp ? log.sourceIp.includes(filterIp) || log.destinationIp.includes(filterIp) : true;
      const statusMatch = filterStatus === 'all' ? true : log.status === filterStatus;
      const protocolMatch = filterProtocol === 'all' ? true : log.protocol === filterProtocol;
      return ipMatch && statusMatch && protocolMatch;
    });
  }, [trafficLogs, filterIp, filterStatus, filterProtocol]);
  
  const uniqueProtocols = useMemo(() => {
    const protocols = new Set(trafficLogs.map(log => log.protocol));
    return ['all', ...Array.from(protocols)];
  }, [trafficLogs]);

  return (
    <AppShell pageTitle="Network Traffic Log">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-card">
          <Input
            placeholder="Filter by Source/Dest IP..."
            value={filterIp}
            onChange={(e) => setFilterIp(e.target.value)}
            className="max-w-xs"
            aria-label="Filter by IP Address"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-[180px]" aria-label="Filter by Status">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="Anomalous">Anomalous</SelectItem>
              <SelectItem value="Suspicious">Suspicious</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterProtocol} onValueChange={setFilterProtocol}>
            <SelectTrigger className="w-full md:w-[180px]" aria-label="Filter by Protocol">
              <SelectValue placeholder="Filter by Protocol" />
            </SelectTrigger>
            <SelectContent>
              {uniqueProtocols.map(protocol => (
                <SelectItem key={protocol} value={protocol}>{protocol === 'all' ? 'All Protocols' : protocol}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DataTable columns={columns} data={filteredLogs} isLoading={isLoading} itemsPerPage={15} />
      </div>
    </AppShell>
  );
}
