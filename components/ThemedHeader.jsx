import { Text, useColorScheme } from 'react-native'
import React from 'react'
import { Colors } from '../constants/Colors'
import { useTheme } from '../contexts/ThemeContext';

const ThemedHeader = ({ style, ...props } ) => {
  const { themeName } = useTheme();
  const theme = Colors[themeName] ?? Colors.light;

  return (
    <Text style={[{ backgroundColor: theme.background, color: theme.header }, style]} {...props} />
  )
}

export default ThemedHeader