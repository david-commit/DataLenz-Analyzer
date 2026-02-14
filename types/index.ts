export interface AnalysisType {
  id: string;
  userId: string;
  imageUrl: string;
  analysisJson: {
    chart_type: string;
    title: string;
    x_axis: {
      label: string;
      units: string | null;
    };
    y_axis: {
      label: string;
      units: string;
    };
    key_insights: string[];
    anomalies: string[];
    trend_summary: string;
    confidence: string;
  };
  public: boolean;
  date: string;
}

export interface Analysis {
  id: string;
  title: string;
  type: string;
  imageUrl: string;
  date: string;
  summary?: string;
  insights?: Insight[];
  trends?: Trend[];
  forecast?: string;
}

export interface Insight {
  title: string;
  description: string;
  trend: "up" | "down" | "neutral";
  value?: string;
  change?: string;
}

export interface Trend {
  title: string;
  description: string;
  direction: "up" | "down";
  timeframe: string;
}
