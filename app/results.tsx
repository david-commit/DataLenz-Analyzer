import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, useColorScheme, Image, ActivityIndicator, Share, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ChevronDown, ChevronUp, Download, Share2, Volume2, VolumeX } from 'lucide-react-native';
import colors from '@/constants/colors';
import { generateMockAnalysis } from '@/utils/mockData';
import InsightCard from '@/components/InsightCard';
import TrendCard from '@/components/TrendCard';
import Button from '@/components/Button';

export default function ResultsScreen() {
  const params = useLocalSearchParams<{ 
    imageUri: string;
    graphTitle: string;
    graphType: string;
    dataContext: string;
  }>();
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;
  
  const [expanded, setExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    summary: true,
    insights: true,
    trends: true,
    forecast: true
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  
  useEffect(() => {
    // Simulate API call to generate analysis
    setTimeout(() => {
      setAnalysis(generateMockAnalysis(params.graphTitle || 'Untitled Graph'));
      setIsLoading(false);
    }, 1000);
  }, []);
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
    // In a real app, this would start/stop text-to-speech
  };
  
  const handleExport = () => {
    // In a real app, this would generate and save a PDF
    alert('Analysis would be exported as PDF');
  };
  
  const handleShare = async () => {
    if (Platform.OS === 'web') {
      alert('Sharing is not available in web preview');
      return;
    }
    
    try {
      await Share.share({
        title: params.graphTitle || 'DataLens Analysis',
        message: 'Check out this data analysis from DataLens Analyzer!'
      });
    } catch (error) {
      console.error(error);
    }
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={[styles.loadingText, { color: themeColors.text }]}>
          Analyzing your graph...
        </Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={themeColors.text} />
        </Pressable>
        <Text style={[styles.title, { color: themeColors.text }]}>Analysis Results</Text>
        <Pressable 
          style={styles.audioButton}
          onPress={toggleAudio}
        >
          {isPlaying ? (
            <VolumeX size={24} color={themeColors.text} />
          ) : (
            <Volume2 size={24} color={themeColors.text} />
          )}
        </Pressable>
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.graphInfoContainer}>
          <Text style={[styles.graphTitle, { color: themeColors.text }]}>
            {params.graphTitle || 'Untitled Graph'}
          </Text>
          {params.graphType ? (
            <Text style={[styles.graphType, { color: themeColors.textSecondary }]}>
              {params.graphType}
            </Text>
          ) : null}
        </View>
        
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: params.imageUri }}
            style={styles.graphImage}
            resizeMode="cover"
          />
        </View>
        
        {/* Summary Section */}
        <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
          <Pressable 
            style={styles.sectionHeader}
            onPress={() => toggleSection('summary')}
          >
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Executive Summary</Text>
            {expandedSections.summary ? (
              <ChevronUp size={20} color={themeColors.text} />
            ) : (
              <ChevronDown size={20} color={themeColors.text} />
            )}
          </Pressable>
          
          {expandedSections.summary && (
            <View style={styles.sectionContent}>
              <Text style={[styles.summaryText, { color: themeColors.text }]}>
                {analysis?.summary}
              </Text>
            </View>
          )}
        </View>
        
        {/* Key Insights Section */}
        <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
          <Pressable 
            style={styles.sectionHeader}
            onPress={() => toggleSection('insights')}
          >
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Key Insights</Text>
            {expandedSections.insights ? (
              <ChevronUp size={20} color={themeColors.text} />
            ) : (
              <ChevronDown size={20} color={themeColors.text} />
            )}
          </Pressable>
          
          {expandedSections.insights && (
            <View style={styles.sectionContent}>
              {analysis?.insights.map((insight: any, index: number) => (
                <InsightCard 
                  key={index}
                  insight={insight}
                  isDark={isDark}
                />
              ))}
            </View>
          )}
        </View>
        
        {/* Trends Section */}
        <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
          <Pressable 
            style={styles.sectionHeader}
            onPress={() => toggleSection('trends')}
          >
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Trends</Text>
            {expandedSections.trends ? (
              <ChevronUp size={20} color={themeColors.text} />
            ) : (
              <ChevronDown size={20} color={themeColors.text} />
            )}
          </Pressable>
          
          {expandedSections.trends && (
            <View style={styles.sectionContent}>
              {analysis?.trends.map((trend: any, index: number) => (
                <TrendCard 
                  key={index}
                  trend={trend}
                  isDark={isDark}
                />
              ))}
            </View>
          )}
        </View>
        
        {/* Forecast Section */}
        <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
          <Pressable 
            style={styles.sectionHeader}
            onPress={() => toggleSection('forecast')}
          >
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Forecast</Text>
            {expandedSections.forecast ? (
              <ChevronUp size={20} color={themeColors.text} />
            ) : (
              <ChevronDown size={20} color={themeColors.text} />
            )}
          </Pressable>
          
          {expandedSections.forecast && (
            <View style={styles.sectionContent}>
              <Text style={[styles.forecastText, { color: themeColors.text }]}>
                {analysis?.forecast}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.actionsContainer}>
          <Button
            icon={<Download size={20} color="#FFFFFF" />}
            title="Export PDF"
            onPress={handleExport}
            style={{ flex: 1, marginRight: 8 }}
          />
          
          <Button
            icon={<Share2 size={20} color="#FFFFFF" />}
            title="Share"
            onPress={handleShare}
            style={{ flex: 1, marginLeft: 8 }}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  audioButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  graphInfoContainer: {
    marginBottom: 16,
  },
  graphTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  graphType: {
    fontSize: 16,
    marginTop: 4,
  },
  imageContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  graphImage: {
    width: '100%',
    height: '100%',
  },
  section: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionContent: {
    padding: 16,
    paddingTop: 0,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
  },
  forecastText: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 32,
  },
});