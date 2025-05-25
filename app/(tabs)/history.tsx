import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FileSliders as Sliders, Search } from 'lucide-react-native';
import HistoryListItem from '@/components/HistoryListItem';
import { mockRecentAnalyses } from '@/utils/mockData';
import { Analysis } from '@/types';
import colors from '@/constants/colors';

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;
  
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch this data from storage or an API
    setAnalyses(mockRecentAnalyses);
  }, []);

  // Group analyses by date (today, yesterday, older)
  const groupedAnalyses = analyses.reduce((groups, analysis) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const analysisDate = new Date(analysis.date);
    
    if (analysisDate.toDateString() === today.toDateString()) {
      groups.today.push(analysis);
    } else if (analysisDate.toDateString() === yesterday.toDateString()) {
      groups.yesterday.push(analysis);
    } else {
      groups.older.push(analysis);
    }
    
    return groups;
  }, { today: [] as Analysis[], yesterday: [] as Analysis[], older: [] as Analysis[] });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>Analysis History</Text>
        
        <View style={styles.headerActions}>
          <Pressable 
            style={[styles.iconButton, { backgroundColor: themeColors.cardBackground }]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Sliders size={20} color={themeColors.text} />
          </Pressable>
          
          <Pressable 
            style={[styles.iconButton, { backgroundColor: themeColors.cardBackground }]}
          >
            <Search size={20} color={themeColors.text} />
          </Pressable>
        </View>
      </View>
      
      {/* Filters area that can be toggled */}
      {showFilters && (
        <View style={[styles.filtersContainer, { backgroundColor: themeColors.cardBackground }]}>
          <Text style={[styles.filterTitle, { color: themeColors.text }]}>Filters</Text>
          
          <View style={styles.filterChips}>
            <Pressable style={[styles.filterChip, { backgroundColor: themeColors.primary }]}>
              <Text style={styles.filterChipText}>All</Text>
            </Pressable>
            
            <Pressable style={[styles.filterChip, { backgroundColor: themeColors.surfaceVariant }]}>
              <Text style={[styles.filterChipText, { color: themeColors.text }]}>Bar Graphs</Text>
            </Pressable>
            
            <Pressable style={[styles.filterChip, { backgroundColor: themeColors.surfaceVariant }]}>
              <Text style={[styles.filterChipText, { color: themeColors.text }]}>Line Charts</Text>
            </Pressable>
            
            <Pressable style={[styles.filterChip, { backgroundColor: themeColors.surfaceVariant }]}>
              <Text style={[styles.filterChipText, { color: themeColors.text }]}>Pie Charts</Text>
            </Pressable>
          </View>
        </View>
      )}
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's analyses */}
        {groupedAnalyses.today.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Today</Text>
            {groupedAnalyses.today.map((analysis) => (
              <HistoryListItem 
                key={analysis.id}
                analysis={analysis}
                isDark={isDark}
              />
            ))}
          </View>
        )}
        
        {/* Yesterday's analyses */}
        {groupedAnalyses.yesterday.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Yesterday</Text>
            {groupedAnalyses.yesterday.map((analysis) => (
              <HistoryListItem 
                key={analysis.id}
                analysis={analysis}
                isDark={isDark}
              />
            ))}
          </View>
        )}
        
        {/* Older analyses */}
        {groupedAnalyses.older.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Older</Text>
            {groupedAnalyses.older.map((analysis) => (
              <HistoryListItem 
                key={analysis.id}
                analysis={analysis}
                isDark={isDark}
              />
            ))}
          </View>
        )}
        
        {/* Empty state */}
        {analyses.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: themeColors.cardBackground }]}>
            <Text style={[styles.emptyStateText, { color: themeColors.text }]}>
              No analysis history found
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: themeColors.textSecondary }]}>
              Capture and analyze graphs to build your history
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  filtersContainer: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    textAlign: 'center',
  },
});