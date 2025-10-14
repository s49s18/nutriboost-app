import { Pressable, StyleSheet } from 'react-native'
import React from 'react'
import { Colors } from '../constants/Colors'
import { useContext } from "react";
import { ColorContext } from "../contexts/ColorContext";

const ThemedButton = ({style, ...props}) => {
  const { colors } = useContext(ColorContext);
  return (
    <Pressable 
        style={({ pressed }) => [[styles.button, style, { backgroundColor: pressed ? colors.quaternary : colors.secondary }], pressed && styles.buttonPressed]}
        {...props}
    />
  )
}

export default ThemedButton

const styles = StyleSheet.create({
    button: {
        padding: 18,
        paddingHorizontal: 80,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonPressed: {
        opacity: 0.5,
    },
})