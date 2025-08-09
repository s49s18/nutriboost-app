import { Pressable, StyleSheet } from 'react-native'
import React from 'react'
import { Colors } from '../constants/Colors'

const ThemedButton = ({style, ...props}) => {
  return (
    <Pressable 
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        {...props}
    />
  )
}

export default ThemedButton

const styles = StyleSheet.create({
    button: {
        backgroundColor: Colors.primary,
        padding: 15,
        paddingHorizontal: 30,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonPressed: {
        opacity: 0.5,
    },
})