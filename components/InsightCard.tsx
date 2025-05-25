import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import colors from '@/constants/colors';

interface InsightCardProps {
  insight: {
    title: string;
    description: string;
    trend: 'up' | 'down' | 'neutral';
    value?: string;
    change?: string;
  };
  isDark: boolean;
}

export default function InsightCard({ insight, isDark }: InsightCardProps) {
  const themeColors = isDark ? colors.dark : colors.light;
  
  const getTrendIcon = () => {
    switch (insight.trend) {
      case 'up':
        return <TrendingUp size={20} color="#4CAF50" />;
      case 'down':
        return <TrendingDown size={20} color="#F44336" />;
      case 'neutral':
        return <Minus size={20} color="#9E9E9E" />;
    }
  };
  
  const getTrendColor = () => {
    switch (insight.trend) {
      case 'up':
        return '#4CAF50';
      case 'down':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };
  
  return (
    <View style={[styles.card, { backgroundColor: themeColors.surfaceVariant }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>{insight.title}</Text>
        {getTrendIcon()}
      </View>
      
      <Text style={[styles.description, { color: themeColors.text }]}>
        {insight.description}
      </Text>
      
      {insight.value && (
        <View style={styles.metrics}>
          <Text style={[styles.value, { color: themeColors.text }]}>{insight.value}</Text>
          {insight.change && (
            <Text style={[styles.change, { color: getTrendColor() }]}>
              {insight.change}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  change: {
    fontSize: 14,
    fontWeight: '600',
  },
});