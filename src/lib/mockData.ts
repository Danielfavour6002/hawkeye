import type { TrafficLogEntry, Alert } from '@/types';

const statuses: Array<TrafficLogEntry['status']> = ['Normal', 'Anomalous', 'Suspicious'];
const protocols = ['TCP', 'UDP', 'ICMP', 'HTTP', 'DNS'];
const commonAttackTypes = ['DoS', 'Port Scan', 'Malware', 'SQL Injection', 'XSS', 'Brute Force'];
const normalBehaviors = ['Normal Activity', 'Routine Check', 'User Login', 'Data Sync'];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateRandomIp = (): string => `1${Math.floor(Math.random() * 2) + 8}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 254) + 1}`;

export const generateMockTrafficLogEntry = (index: number): TrafficLogEntry => {
  const randomStatus = getRandomElement(statuses);
  const isNormal = randomStatus === 'Normal';
  
  // Generate timestamp relative to current time to ensure variety but avoid issues with future dates
  const timestamp = new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7)).toISOString();

  return {
    id: `log-${index}-${timestamp}`,
    timestamp,
    sourceIp: generateRandomIp(),
    destinationIp: `103.27.53.${Math.floor(Math.random() * 254) + 1}`, // Simulate RSU portal IP range
    protocol: getRandomElement(protocols),
    port: Math.floor(Math.random() * 65535) + 1,
    payloadSize: Math.floor(Math.random() * 1400) + 60, // Realistic payload sizes
    status: randomStatus,
    details: isNormal ? 'Standard operational traffic.' : 'Anomaly detected based on heuristic analysis. Pattern deviates from baseline.',
    attackType: isNormal ? getRandomElement(normalBehaviors) : getRandomElement(commonAttackTypes),
  };
};

export const generateMockAlert = (index: number): Alert => {
  const severities: Array<Alert['severity']> = ['Critical', 'High', 'Medium', 'Low'];
  const titles = [
    'Unusual Login Attempt Detected',
    'High Volume Outbound Traffic from Internal Host',
    'Potential Malware Signature Found in Payload',
    'Sustained Port Scanning Activity on Critical Server',
    'Anomalous Network Connection to External Geo-location',
    'Multiple Failed Authentication Attempts',
    'Data Exfiltration Pattern Identified'
  ];
  const timestamp = new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 48)).toISOString();

  return {
    id: `alert-${index}-${timestamp}`,
    timestamp,
    severity: getRandomElement(severities),
    title: getRandomElement(titles),
    description: 'Suspicious activity detected on the Rivers State University portal. Immediate investigation recommended. Review associated logs for more details.',
    sourceIp: generateRandomIp(),
    attackType: getRandomElement(commonAttackTypes),
    relatedLogId: `log-${index}-${new Date(Date.parse(timestamp) - Math.random() * 1000 * 60).toISOString()}`, // Mock related log
  };
};

export const generateMultipleTrafficLogs = (count: number): TrafficLogEntry[] => {
  return Array.from({ length: count }, (_, i) => generateMockTrafficLogEntry(i + 1));
};

export const generateMultipleAlerts = (count: number): Alert[] => {
  return Array.from({ length: count }, (_, i) => generateMockAlert(i + 1));
};

export const getMockIntrusionDataForSummary = (count: number = 20): string => {
  const logs = generateMultipleTrafficLogs(count);
  let dataString = "Intrusion Data Log:\n";
  logs.filter(log => log.status !== 'Normal').forEach(log => {
    dataString += `Timestamp: ${log.timestamp}, Source: ${log.sourceIp}, Dest: ${log.destinationIp}, Proto: ${log.protocol}, Port: ${log.port}, Status: ${log.status}, Attack: ${log.attackType}, Details: ${log.details}\n`;
  });
  if (dataString === "Intrusion Data Log:\n") {
    dataString += "No significant intrusion events detected in this period.\n";
  }
  return dataString;
};

