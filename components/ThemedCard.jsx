import { View, useColorScheme, StyleSheet } from 'react-native'
import React from 'react'
import { Colors } from '../constants/Colors'

const ThemedCard = ({ style, ...props } ) => {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  return (
    <View style={[{ backgroundColor: theme.uiBackground }, styles.card, style]} {...props} />
  )
}

export default ThemedCard

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
  },
})

{/* This component is used to provide a themed card view based on the current color scheme.
It applies the background color from the Colors constant based on the current color scheme.
If the card tag is closed, it will automatically display the children, that are passed to it, as props.
*/}