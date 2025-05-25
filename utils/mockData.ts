import { Analysis, Insight, Trend } from '@/types';

export const mockRecentAnalyses: Analysis[] = [
  {
    id: '1',
    title: 'Quarterly Sales Growth 2023',
    type: 'Bar Chart',
    imageUri: 'https://images.pexels.com/photos/7567434/pexels-photo-7567434.jpeg',
    date: '2023-05-15T14:30:00Z',
  },
  {
    id: '2',
    title: 'Market Share Comparison',
    type: 'Pie Chart',
    imageUri: 'https://images.pexels.com/photos/7567441/pexels-photo-7567441.jpeg',
    date: '2023-05-14T10:15:00Z',
  },
  {
    id: '3',
    title: 'Monthly Website Traffic',
    type: 'Line Chart',
    imageUri: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg',
    date: '2023-05-12T16:45:00Z',
  },
  {
    id: '4',
    title: 'Customer Satisfaction Metrics',
    type: 'Bar Chart',
    imageUri: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg',
    date: '2023-05-10T09:20:00Z',
  },
];

export function generateMockAnalysis(title: string): Analysis {
  const insights: Insight[] = [
    {
      title: 'Peak Performance',
      description: 'The highest value in the dataset occurs in Q3, showing a 23% increase over the average.',
      trend: 'up',
      value: '1,245',
      change: '+23%',
    },
    {
      title: 'Consistent Growth',
      description: 'The data shows a steady upward trend with an average growth rate of 12% per period.',
      trend: 'up',
      value: '12%',
      change: '+5% vs prev',
    },
    {
      title: 'Seasonal Pattern',
      description: 'There appears to be a cyclical pattern with peaks occurring in the third quarter of each year.',
      trend: 'neutral',
    },
    {
      title: 'Underperforming Segment',
      description: 'The smallest category shows consistent decline, dropping 8% from the previous period.',
      trend: 'down',
      value: '342',
      change: '-8%',
    },
  ];

  const trends: Trend[] = [
    {
      title: 'Upward Momentum',
      description: 'The overall trend is positive with sustained growth over the entire period analyzed.',
      direction: 'up',
      timeframe: 'Last 12 months',
    },
    {
      title: 'Recovery After Dip',
      description: 'After a significant drop in the middle of the period, values have recovered and surpassed previous levels.',
      direction: 'up',
      timeframe: 'Last 6 months',
    },
    {
      title: 'Segment Contraction',
      description: 'The smallest segment has been consistently shrinking and may require intervention.',
      direction: 'down',
      timeframe: 'Last 9 months',
    },
  ];

  return {
    id: '1',
    title,
    type: 'Bar Chart',
    imageUri: 'https://images.pexels.com/photos/7567434/pexels-photo-7567434.jpeg',
    date: new Date().toISOString(),
    summary: 'This analysis reveals a strong overall performance with consistent growth trends across most segments. The data indicates a year-over-year increase of approximately 15%, with the highest growth occurring in Q3. However, there is a notable underperforming segment that requires attention. Seasonal patterns are evident, with predictable peaks and troughs that align with industry norms. Based on these patterns, we can forecast continued growth for the next two quarters, with an estimated 10-12% increase if current trends continue.',
    insights,
    trends,
    forecast: 'Based on the current data and trends, we project continued growth of 10-12% over the next two quarters. The primary growth driver will likely remain the top-performing segment. However, intervention is recommended for the underperforming segment to prevent further decline. Strategic resource allocation focusing on the highest-growth periods could maximize returns in the upcoming fiscal year.',
  };
}