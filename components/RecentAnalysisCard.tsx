import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import { Calendar } from 'lucide-react-native';
import { Analysis } from '@/types';
import colors from '@/constants/colors';

interface RecentAnalysisCardProps {
  analysis: Analysis;
  isDark: boolean;
}

export default function RecentAnalysisCard({ analysis, isDark }: RecentAnalysisCardProps) {
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
      style={[styles.card, { backgroundColor: themeColors.cardBackground }]}
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
        <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={2}>
          {analysis.title}
        </Text>
        <Text style={[styles.type, { color: themeColors.textSecondary }]}>
          {analysis.type}
        </Text>
        <View style={styles.dateContainer}>
          <Calendar size={14} color={themeColors.textSecondary} />
          <Text style={[styles.date, { color: themeColors.textSecondary }]}>
            {formatDate(analysis.date)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  imageContainer: {
    width: 100,
    height: 100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  type: {
    fontSize: 14,
    marginTop: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  date: {
    fontSize: 12,
    marginLeft: 4,
  },
});