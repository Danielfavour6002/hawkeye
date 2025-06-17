import type { Alert as AlertType } from '@/types';
import { formatDisplayDate } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info, ServerCrash, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertCardProps {
  alert: AlertType;
}

const severityIcons = {
  Critical: ShieldAlert,
  High: ServerCrash,
  Medium: AlertTriangle,
  Low: Info,
};

const severityColors = {
  Critical: 'bg-red-500 hover:bg-red-500/90 border-red-500 text-white',
  High: 'bg-orange-500 hover:bg-orange-500/90 border-orange-500 text-white',
  Medium: 'bg-yellow-500 hover:bg-yellow-500/90 border-yellow-500 text-black',
  Low: 'bg-blue-500 hover:bg-blue-500/90 border-blue-500 text-white',
};


export default function AlertItemCard({ alert }: AlertCardProps) {
  const Icon = severityIcons[alert.severity] || AlertTriangle;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4" style={{ borderColor: alert.severity === 'Critical' || alert.severity === 'High' ? 'hsl(var(--accent))' : 'hsl(var(--border))'}}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center">
            <Icon className={cn("w-5 h-5 mr-2", alert.severity === 'Critical' ? 'text-destructive' : alert.severity === 'High' ? 'text-accent' : 'text-primary')} />
            {alert.title}
          </CardTitle>
          <Badge variant="outline" className={cn(severityColors[alert.severity])}>
            {alert.severity}
          </Badge>
        </div>
        <CardDescription className="text-xs pt-1">
          {formatDisplayDate(alert.timestamp)}
          {alert.sourceIp && ` - Source: ${alert.sourceIp}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
        {alert.attackType && (
          <Badge variant="secondary" className="font-normal">Attack Type: {alert.attackType}</Badge>
        )}
      </CardContent>
    </Card>
  );
}
