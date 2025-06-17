export interface TrafficLogEntry {
  id: string;
  timestamp: string; 
  sourceIp: string;
  destinationIp: string;
  protocol: string;
  port: number;
  payloadSize: number; 
  status: 'Normal' | 'Anomalous' | 'Suspicious';
  details?: string; 
  attackType?: string; 
}

export interface Alert {
  id: string;
  timestamp: string; 
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  sourceIp?: string;
  attackType?: string;
  relatedLogId?: string;
}

export interface AnomalyExplanation {
  isAnomalous: boolean;
  explanation: string;
}

// Helper function to format date, ensuring it runs client-side if needed for dynamic dates
export const formatDisplayDate = (isoString: string): string => {
  return new Date(isoString).toLocaleString();
};
