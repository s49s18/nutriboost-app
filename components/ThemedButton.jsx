import { Pressable, StyleSheet } from 'react-native'
import React from 'react'
import { Colors } from '../constants/Colors'
import { useContext } from "react";
import { ColorContext } from "../contexts/ColorContext";

const ThemedButton = ({style, ...props}) => {
  const { colors } = useContext(ColorContext);
  return (
    <Pressable 
        style={({ pressed }) => [[styles.button, { backgroundColor: pressed ? colors.quaternary: colors.secondary }], pressed && styles.buttonPressed]}
        {...props}
    />
  )
}

export default ThemedButton

const styles = StyleSheet.create({
    button: {
        padding: 15,
        paddingHorizontal: 30,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonPressed: {
        opacity: 0.5,
    },
})