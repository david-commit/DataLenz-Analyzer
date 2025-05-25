import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  style?: object;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export default function Button({
  title,
  onPress,
  icon,
  style,
  variant = 'primary',
  disabled = false
}: ButtonProps) {
  const getBackgroundColor = () => {
    if (disabled) return '#CCCCCC';
    return variant === 'primary' ? '#1E88E5' : '#7C4DFF';
  };
  
  return (
    <Pressable
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        style
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  iconContainer: {
    marginRight: 8,
  },
});