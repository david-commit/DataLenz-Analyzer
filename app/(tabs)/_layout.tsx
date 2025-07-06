import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Chrome as Home, Camera, ChartLine as LineChart, Settings, LogIn } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isAuthenticated } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1E88E5',
        tabBarInactiveTintColor: isDark ? '#9E9E9E' : '#616161',
        tabBarStyle: {
          backgroundColor: isDark ? '#121212' : '#FFFFFF',
          borderTopColor: isDark ? '#333333' : '#E0E0E0',
        },
        headerStyle: {
          backgroundColor: isDark ? '#121212' : '#FFFFFF',
        },
        headerTintColor: isDark ? '#FFFFFF' : '#000000',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Analyze',
          tabBarIcon: ({ color, size }) => <Camera size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <ChartLine size={size} color={color} />,
          headerShown: false,
        }}
      />
      {isAuthenticated ? (
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
            headerShown: false,
          }}
        />
      ) : (
        <Tabs.Screen
          name="auth"
          options={{
            title: 'Login',
            tabBarIcon: ({ color, size }) => <LogIn size={size} color={color} />,
            headerShown: false,
          }}
        />
      )}
    </Tabs>
  );
}