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
          backgroundColor: '#fff',
          color: theme.text,
          placeholderTextColor: theme.iconColor,
          padding: 18,
          paddingHorizontal: 20,
          borderRadius: 2,
          borderWidth: 1,
          borderColor: '#000'
        },
        style,
      ]}
      {...props}
    />
  )
}

export default ThemedTextInput