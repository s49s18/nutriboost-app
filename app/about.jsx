import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

// themed components
import ThemedView from '../components/ThemedView'
import ThemedText from '../components/ThemedText'

const About = () => {
        
  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
      <ThemedText style={[styles.title, { color: theme.title }]}>About Page</ThemedText>

      <Link href="/" style={[styles.link, { color: theme.text }]}>
        <ThemedText>Back Home</ThemedText>
      </Link>
    </ThemedView>
  )
}

export default About

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    link: {
      marginVertical: 10,
      borderBottomWidth: 1,
    },
})