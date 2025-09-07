import { TextInput, useColorScheme } from 'react-native'
import React from 'react'
import { Colors } from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';

const ThemedTextInput = ({ style, ...props}) => {
  const { themeName } = useTheme();
  const theme = Colors[themeName] ?? Colors.light;

  return (
    <TextInput
      style={[
        {
          backgroundColor: theme.uiBackground,
          color: theme.text,
          placeholderTextColor: theme.iconColor,
          padding: 20,
          borderRadius: 6,
        },
        style,
      ]}
      {...props}
    />
  )
}

export default ThemedTextInput