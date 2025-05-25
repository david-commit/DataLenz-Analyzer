import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, useColorScheme, ScrollView, Image, Platform, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ChevronDown, ChevronUp, CircleHelp as HelpCircle } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function ContextInputScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;
  
  const [graphTitle, setGraphTitle] = useState('');
  const [graphType, setGraphType] = useState('');
  const [dataContext, setDataContext] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const graphTypes = [
    'Bar Chart',
    'Line Chart',
    'Pie Chart',
    'Scatter Plot',
    'Area Chart',
    'Histogram',
    'Other'
  ];

  const handleTypeSelect = (type: string) => {
    setGraphType(type);
    setShowTypeDropdown(false);
  };

  const handleAnalyze = () => {
    if (!graphTitle.trim()) {
      // In a real app, you would show a proper validation error
      alert('Please enter a graph title');
      return;
    }
    
    setProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      setProcessing(false);
      router.push({
        pathname: '/results',
        params: { 
          imageUri,
          graphTitle: graphTitle.trim(),
          graphType,
          dataContext: dataContext.trim()
        }
      });
    }, 2000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.header}>
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={themeColors.text} />
          </Pressable>
          <Text style={[styles.title, { color: themeColors.text }]}>Add Context</Text>
          <View style={styles.placeholder} />
        </View>
        
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
          </View>
          
          <View style={[styles.infoContainer, { backgroundColor: themeColors.infoBackground }]}>
            <HelpCircle size={20} color={themeColors.infoText} />
            <Text style={[styles.infoText, { color: themeColors.infoText }]}>
              Adding context helps our AI generate more accurate and relevant insights.
            </Text>
          </View>
          
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: themeColors.text }]}>Graph Title *</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: themeColors.inputBackground,
                color: themeColors.text,
                borderColor: themeColors.border
              }]}
              placeholder="E.g., Quarterly Sales 2023"
              placeholderTextColor={themeColors.textSecondary}
              value={graphTitle}
              onChangeText={setGraphTitle}
            />
            
            <Text style={[styles.inputLabel, { color: themeColors.text }]}>Graph Type</Text>
            <Pressable
              style={[styles.dropdownButton, { 
                backgroundColor: themeColors.inputBackground,
                borderColor: themeColors.border
              }]}
              onPress={() => setShowTypeDropdown(!showTypeDropdown)}
            >
              <Text style={{ color: graphType ? themeColors.text : themeColors.textSecondary }}>
                {graphType || 'Select graph type'}
              </Text>
              {showTypeDropdown ? (
                <ChevronUp size={20} color={themeColors.text} />
              ) : (
                <ChevronDown size={20} color={themeColors.text} />
              )}
            </Pressable>
            
            {showTypeDropdown && (
              <View style={[styles.dropdown, { 
                backgroundColor: themeColors.cardBackground,
                borderColor: themeColors.border
              }]}>
                {graphTypes.map((type) => (
                  <Pressable
                    key={type}
                    style={[styles.dropdownItem, 
                      type === graphType && { backgroundColor: themeColors.itemSelected }
                    ]}
                    onPress={() => handleTypeSelect(type)}
                  >
                    <Text style={{ color: themeColors.text }}>{type}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            
            <Text style={[styles.inputLabel, { color: themeColors.text }]}>Additional Context</Text>
            <TextInput
              style={[styles.textAreaInput, { 
                backgroundColor: themeColors.inputBackground,
                color: themeColors.text,
                borderColor: themeColors.border
              }]}
              placeholder="Describe what this graph represents or any additional context that would help with analysis..."
              placeholderTextColor={themeColors.textSecondary}
              value={dataContext}
              onChangeText={setDataContext}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
        
        <View style={[styles.footer, { backgroundColor: themeColors.background }]}>
          <Pressable
            style={[styles.analyzeButton, processing && styles.analyzeButtonDisabled]}
            onPress={handleAnalyze}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.analyzeButtonText}>Generate Analysis</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  imagePreviewContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 4,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  textAreaInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 120,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  analyzeButton: {
    backgroundColor: '#1E88E5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeButtonDisabled: {
    backgroundColor: '#90CAF9',
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});