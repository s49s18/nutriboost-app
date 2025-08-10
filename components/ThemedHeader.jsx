import { Text, useColorScheme } from 'react-native'
import React from 'react'
import { Colors } from '../constants/Colors'

const ThemedHeader = ({ style, ...props } ) => {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  return (
    <Text style={[{ backgroundColor: theme.background, color: theme.header }, style]} {...props} />
  )
}

export default ThemedHeader