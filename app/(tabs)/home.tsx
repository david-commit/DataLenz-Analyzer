import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Camera, TrendingUp, FileText, Volume2 } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import RecentAnalysisCard from '@/components/RecentAnalysisCard';
import { mockRecentAnalyses } from '@/utils/mockData';
import { Analysis } from '@/types';
import colors from '@/constants/colors';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;
  
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  
  useEffect(() => {
    // In a real app, you would fetch this data from storage or an API
    setRecentAnalyses(mockRecentAnalyses);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>DataLens Analyzer</Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
          Analyze graphs with AI precision
        </Text>
      </View>
      
      <Link href="/camera" asChild>
        <Pressable style={styles.analyzeButton}>
          <Camera size={24} color="#FFFFFF" />
          <Text style={styles.analyzeButtonText}>Analyze New Graph</Text>
        </Pressable>
      </Link>
      
      <View style={styles.featuresContainer}>
        <View style={[styles.featureCard, { backgroundColor: themeColors.cardBackground }]}>
          <TrendingUp size={24} color="#1E88E5" />
          <Text style={[styles.featureTitle, { color: themeColors.text }]}>Trend Analysis</Text>
          <Text style={[styles.featureDescription, { color: themeColors.textSecondary }]}>
            Identify patterns and trends in your data
          </Text>
        </View>
        
        <View style={[styles.featureCard, { backgroundColor: themeColors.cardBackground }]}>
          <FileText size={24} color="#7C4DFF" />
          <Text style={[styles.featureTitle, { color: themeColors.text }]}>Detailed Reports</Text>
          <Text style={[styles.featureDescription, { color: themeColors.textSecondary }]}>
            Get comprehensive insights from your graphs
          </Text>
        </View>
        
        <View style={[styles.featureCard, { backgroundColor: themeColors.cardBackground }]}>
          <Volume2 size={24} color="#4CAF50" />
          <Text style={[styles.featureTitle, { color: themeColors.text }]}>Audio Summaries</Text>
          <Text style={[styles.featureDescription, { color: themeColors.textSecondary }]}>
            Listen to your analysis with text-to-speech
          </Text>
        </View>
      </View>
      
      <View style={styles.recentContainer}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Recent Analyses</Text>
        
        {recentAnalyses.length > 0 ? (
          <ScrollView 
            style={styles.recentList}
            showsVerticalScrollIndicator={false}
          >
            {recentAnalyses.map((analysis) => (
              <RecentAnalysisCard 
                key={analysis.id}
                analysis={analysis}
                isDark={isDark}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: themeColors.cardBackground }]}>
            <Text style={[styles.emptyStateText, { color: themeColors.textSecondary }]}>
              No recent analyses found. Start by analyzing a graph!
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E88E5',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 24,
  },
  featureCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  recentContainer: {
    flex: 1,
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  recentList: {
    flex: 1,
  },
  emptyState: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: 16,
  },
});