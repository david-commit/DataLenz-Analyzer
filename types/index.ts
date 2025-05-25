export interface Analysis {
  id: string;
  title: string;
  type: string;
  imageUri: string;
  date: string;
  summary?: string;
  insights?: Insight[];
  trends?: Trend[];
  forecast?: string;
}

export interface Insight {
  title: string;
  description: string;
  trend: 'up' | 'down' | 'neutral';
  value?: string;
  change?: string;
}

export interface Trend {
  title: string;
  description: string;
  direction: 'up' | 'down';
  timeframe: string;
}