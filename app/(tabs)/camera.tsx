import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-camera';
import { Camera as CameraIcon, X, FileImage, RefreshCw } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import CameraComponent from '@/components/CameraComponent';
import colors from '@/constants/colors';

export default function CameraScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const cameraRef = useRef(null);

  const handleCapture = async (uri: string) => {
    setCapturedImage(uri);
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleAnalyze = () => {
    if (!capturedImage) return;
    
    setAnalyzing(true);
    
    // Simulate processing time
    setTimeout(() => {
      setAnalyzing(false);
      router.push({
        pathname: '/context-input',
        params: { imageUri: capturedImage }
      });
    }, 1500);
  };

  const handleSelectFromGallery = () => {
    // In a real app, this would open the image picker
    // For this example, we'll use a mock image
    const mockImage = 'https://images.pexels.com/photos/6804079/pexels-photo-6804079.jpeg';
    setCapturedImage(mockImage);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <Pressable 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X size={24} color={themeColors.text} />
        </Pressable>
        <Text style={[styles.title, { color: themeColors.text }]}>
          {capturedImage ? 'Review Graph' : 'Capture Graph'}
        </Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.cameraContainer}>
        {capturedImage ? (
          <View style={styles.previewContainer}>
            <Image
              style={styles.preview}
              source={{ uri: capturedImage }}
              contentFit="cover"
            />
          </View>
        ) : (
          Platform.OS !== 'web' ? (
            <CameraComponent 
              onCapture={handleCapture}
              cameraRef={cameraRef}
            />
          ) : (
            <View style={[styles.webPlaceholder, { backgroundColor: themeColors.cardBackground }]}>
              <Text style={[styles.webPlaceholderText, { color: themeColors.textSecondary }]}>
                Camera is not available in web preview.
              </Text>
              <Pressable 
                style={[styles.webMockButton, { backgroundColor: themeColors.primary }]}
                onPress={handleSelectFromGallery}
              >
                <Text style={styles.webMockButtonText}>Use Sample Image</Text>
              </Pressable>
            </View>
          )
        )}
      </View>
      
      <View style={styles.controlsContainer}>
        {capturedImage ? (
          <>
            <Pressable
              style={[styles.controlButton, { backgroundColor: themeColors.cardBackground }]}
              onPress={handleRetake}
            >
              <RefreshCw size={24} color={themeColors.text} />
              <Text style={[styles.controlButtonText, { color: themeColors.text }]}>Retake</Text>
            </Pressable>
            
            <Pressable
              style={[styles.analyzeButton, analyzing && styles.analyzeButtonDisabled]}
              onPress={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <CameraIcon size={24} color="#FFFFFF" />
                  <Text style={styles.analyzeButtonText}>Analyze Graph</Text>
                </>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              style={[styles.controlButton, { backgroundColor: themeColors.cardBackground }]}
              onPress={handleSelectFromGallery}
            >
              <FileImage size={24} color={themeColors.text} />
              <Text style={[styles.controlButtonText, { color: themeColors.text }]}>Gallery</Text>
            </Pressable>
            
            {Platform.OS !== 'web' && (
              <Pressable
                style={[styles.captureButton, { borderColor: themeColors.primary }]}
                onPress={() => {
                  if (cameraRef.current) {
                    // In a real app, you would call the takePictureAsync method
                    handleSelectFromGallery(); // Using mock for demo
                  }
                }}
              >
                <View style={[styles.captureButtonInner, { backgroundColor: themeColors.primary }]} />
              </Pressable>
            )}
            
            <View style={styles.placeholder} />
          </>
        )}
      </View>
      
      <View style={styles.instructionContainer}>
        <Text style={[styles.instructionText, { color: themeColors.textSecondary }]}>
          {capturedImage 
            ? 'Review the captured graph and tap "Analyze Graph" to continue'
            : 'Position the graph within the frame and tap the capture button'}
        </Text>
      </View>
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
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
    marginHorizontal: 16,
    borderRadius: 16,
  },
  previewContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  preview: {
    flex: 1,
  },
  webPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  webPlaceholderText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  webMockButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  webMockButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  controlButtonText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E88E5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginLeft: 16,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#90CAF9',
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  instructionContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  instructionText: {
    textAlign: 'center',
  },
});