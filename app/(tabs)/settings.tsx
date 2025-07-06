import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Pressable, ScrollView, useColorScheme, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Moon, Sun, Bell, Globe, VolumeX, Volume2, FileText, CircleHelp as HelpCircle, Info } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;
  
  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(isDark);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedVoice, setSelectedVoice] = useState('Default');
  
  // Mock function for settings that would actually change system settings
  const handleDarkModeToggle = () => {
    setDarkModeEnabled(!darkModeEnabled);
    // In a real app, you would use a theme provider to change the theme
    if (Platform.OS === 'web') {
      Alert.alert('Dark mode settings would be applied here');
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>Settings</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Appearance</Text>
          
          <View style={[styles.settingItem, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.settingInfo}>
              {isDark ? (
                <Moon size={24} color={themeColors.text} />
              ) : (
                <Sun size={24} color={themeColors.text} />
              )}
              <Text style={[styles.settingText, { color: themeColors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#767577', true: '#1E88E5' }}
              thumbColor="#f4f3f4"
            />
          </View>
          
          <View style={[styles.settingItem, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.settingInfo}>
              <Globe size={24} color={themeColors.text} />
              <Text style={[styles.settingText, { color: themeColors.text }]}>Language</Text>
            </View>
            <Pressable>
              <Text style={{ color: themeColors.primary }}>{selectedLanguage}</Text>
            </Pressable>
          </View>
        </View>
        
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Notifications</Text>
          
          <View style={[styles.settingItem, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.settingInfo}>
              <Bell size={24} color={themeColors.text} />
              <Text style={[styles.settingText, { color: themeColors.text }]}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: '#1E88E5' }}
              thumbColor="#f4f3f4"
            />
          </View>
        </View>
        
        {/* Analysis Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Analysis Settings</Text>
          
          <View style={[styles.settingItem, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.settingInfo}>
              {textToSpeechEnabled ? (
                <Volume2 size={24} color={themeColors.text} />
              ) : (
                <VolumeX size={24} color={themeColors.text} />
              )}
              <Text style={[styles.settingText, { color: themeColors.text }]}>Text-to-Speech</Text>
            </View>
            <Switch
              value={textToSpeechEnabled}
              onValueChange={setTextToSpeechEnabled}
              trackColor={{ false: '#767577', true: '#1E88E5' }}
              thumbColor="#f4f3f4"
            />
          </View>
          
          <View style={[styles.settingItem, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.settingInfo}>
              <FileText size={24} color={themeColors.text} />
              <Text style={[styles.settingText, { color: themeColors.text }]}>Auto-Save Analysis</Text>
            </View>
            <Switch
              value={autoSaveEnabled}
              onValueChange={setAutoSaveEnabled}
              trackColor={{ false: '#767577', true: '#1E88E5' }}
              thumbColor="#f4f3f4"
            />
          </View>
          
          <View style={[styles.settingItem, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.settingInfo}>
              <Volume2 size={24} color={themeColors.text} />
              <Text style={[styles.settingText, { color: themeColors.text }]}>Voice Type</Text>
            </View>
            <Pressable>
              <Text style={{ color: themeColors.primary }}>{selectedVoice}</Text>
            </Pressable>
          </View>
        </View>
        
        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>About</Text>
          
          <Pressable style={[styles.settingItem, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.settingInfo}>
              <HelpCircle size={24} color={themeColors.text} />
              <Text style={[styles.settingText, { color: themeColors.text }]}>Help & Support</Text>
            </View>
          </Pressable>
          
          <Pressable style={[styles.settingItem, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.settingInfo}>
              <Info size={24} color={themeColors.text} />
              <Text style={[styles.settingText, { color: themeColors.text }]}>About DataLens</Text>
            </View>
          </Pressable>
        </View>
        
        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: themeColors.textSecondary }]}>
            DataLens Analyzer v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 14,
  },
});