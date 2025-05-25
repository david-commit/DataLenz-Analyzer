import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import { Calendar, ChevronRight } from 'lucide-react-native';
import { Analysis } from '@/types';
import colors from '@/constants/colors';

interface HistoryListItemProps {
  analysis: Analysis;
  isDark: boolean;
}

export default function HistoryListItem({ analysis, isDark }: HistoryListItemProps) {
  const themeColors = isDark ? colors.dark : colors.light;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handlePress = () => {
    router.push({
      pathname: '/results',
      params: { 
        imageUri: analysis.imageUri,
        graphTitle: analysis.title,
        graphType: analysis.type,
        dataContext: ''
      }
    });
  };
  
  return (
    <Pressable 
      style={[styles.item, { backgroundColor: themeColors.cardBackground }]}
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: analysis.imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={1}>
          {analysis.title}
        </Text>
        <View style={styles.detailsRow}>
          <Text style={[styles.type, { color: themeColors.textSecondary }]}>
            {analysis.type}
          </Text>
          <View style={styles.dateContainer}>
            <Calendar size={12} color={themeColors.textSecondary} />
            <Text style={[styles.date, { color: themeColors.textSecondary }]}>
              {formatDate(analysis.date)}
            </Text>
          </View>
        </View>
      </View>
      <ChevronRight size={20} color={themeColors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  type: {
    fontSize: 14,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    marginLeft: 4,
  },
});