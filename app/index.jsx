import { StyleSheet, Text, View, Image } from 'react-native'
import { Link } from 'expo-router'
import React from 'react'
import 'react-native-url-polyfill/auto';

// themed components
import ThemedView from '../components/ThemedView'
import ThemedLogo from '../components/ThemedLogo'
import Spacer from '../components/Spacer'
import ThemedText from '../components/ThemedText'

const Home = () => {
  return (
    <ThemedView style={styles.container}>
        <ThemedLogo style={styles.img} />

      <ThemedText style={[styles.header, { color: 'purple' }]} title={true}>The number 1</ThemedText>

      <Spacer height={10} />
      <ThemedText style={styles.body}>Reading List App </ThemedText>
      <ThemedText style={styles.footer}>This is the footer</ThemedText>
      <Spacer height={20} />

      <ThemedView style={styles.card}>
        <Text>Welcome to the Shelfie App!</Text>
      </ThemedView>

      <Link href="/login" style={styles.link}>
        <ThemedText>Login Page</ThemedText>
      </Link>
      <Link href="/register" style={styles.link}>
        <ThemedText>Register Page</ThemedText>
      </Link>
      <Link href="/profile" style={styles.link}>
        <ThemedText>Profile Page</ThemedText>
      </Link>
    </ThemedView>
  )
}

export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontWeight: 'bold',
        fontSize: 24,
    },
    body: {
        fontSize: 18,
    },
    footer: {
        fontSize: 14,
    },
    img: {
        width: 100,
        height: 100,
        marginVertical: 20,
    },
    card: {
        //width: 300,
        //height: 200,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 20,
        marginVertical: 10,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        elevation: 5, // For Android shadow
        alignContent: 'center',
    },
    link: {
        marginVertical: 10,
        borderBottomWidth: 1,
    },
})


// rnfes