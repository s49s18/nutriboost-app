import { Text, useColorScheme } from 'react-native'
import React from 'react'
import { Colors } from '../constants/Colors'
import { useTheme } from '../contexts/ThemeContext';

const ThemedText = ({ style, title = false, ...props } ) => {
  const { themeName } = useTheme();
  const theme = Colors[themeName] ?? Colors.light;

  // is it a title, then use title color, otherwise use text color
  // this is used to differentiate between title and normal text
  const TextColor = title ? theme.title : theme.text

  return (
    <Text style={[{ backgroundColor: theme.background, color: TextColor }, style]} {...props} />
  )
}

export default ThemedText