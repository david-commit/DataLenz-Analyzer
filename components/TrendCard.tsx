import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react-native';
import colors from '@/constants/colors';

interface TrendCardProps {
  trend: {
    title: string;
    description: string;
    direction: 'up' | 'down';
    timeframe: string;
  };
  isDark: boolean;
}

export default function TrendCard({ trend, isDark }: TrendCardProps) {
  const themeColors = isDark ? colors.dark : colors.light;
  
  return (
    <View style={[styles.card, { backgroundColor: themeColors.surfaceVariant }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>{trend.title}</Text>
        {trend.direction === 'up' ? (
          <TrendingUp size={20} color="#4CAF50" />
        ) : (
          <TrendingDown size={20} color="#F44336" />
        )}
      </View>
      
      <Text style={[styles.description, { color: themeColors.text }]}>
        {trend.description}
      </Text>
      
      <View style={styles.timeframe}>
        <Clock size={16} color={themeColors.textSecondary} />
        <Text style={[styles.timeframeText, { color: themeColors.textSecondary }]}>
          {trend.timeframe}
        </Text>
      </View>
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
  timeframe: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  timeframeText: {
    fontSize: 12,
    marginLeft: 4,
  },
});