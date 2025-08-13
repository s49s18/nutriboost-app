import { StyleSheet, Text, View, Image } from 'react-native'
import { Link } from 'expo-router'
import React, { useContext } from 'react';
import 'react-native-url-polyfill/auto';

// themed components
import ThemedView from '../components/ThemedView'
import ThemedLogo from '../components/ThemedLogo'
import Spacer from '../components/Spacer'
import ThemedText from '../components/ThemedText'
import { UserContext } from '../contexts/UserContexts';
import { Colors } from '../constants/Colors';

import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
});

const registerForPushNotificationsAsync = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }
  // Der Token ist für Push-Nachrichten, aber die Permissions gelten auch für lokale Notifications
};

const Home = () => {
  const { user, logout } = useContext(UserContext);
  return (
    <ThemedView style={styles.container}>
      {/* HEADER SECTION */}
      <ThemedView style={styles.header}>
        <ThemedLogo style={styles.img} />
        {/* Navigation links for logged-in users */}
        {user ? (
          <View style={styles.headerLinks}>
            <Link href="/profile" style={styles.profileLink}>
              <ThemedText>Profile Page</ThemedText>
            </Link>
            {/* Logout-Text verwendet jetzt ThemedText für Konsistenz mit dem Theme */}
            <ThemedText style={styles.logout} onPress={logout}>
              Logout
            </ThemedText>
          </View>
        ) : (
          <ThemedView style={styles.headerLinks}>
            {/* Links verwenden ThemedText für Konsistenz */}
            <Link href="/login" style={styles.headerLink}>
              <ThemedText>Login</ThemedText>
            </Link>
            <Link href="/register" style={styles.headerLink}>
              <ThemedText>Register</ThemedText>
            </Link>
          </ThemedView>
        )}
      </ThemedView>

      {/* MAIN CONTENT SECTION */}
      <ThemedView style={styles.mainContent}>
        {/* Farbe wird jetzt aus der Colors-Konstante verwendet */}
        <ThemedText style={[styles.headerText, { color: Colors.secondary }]} title={true}>
          Nutri-Boost
        </ThemedText>
        <Spacer height={5} />
        <ThemedText style={styles.footerText}>The App to track and know your most important nutrients</ThemedText>
        <Spacer height={20} />

        {/* USER INFO CARD */}
        <ThemedView style={styles.card}>
          {user ? (
            <>
              <Text>👋 Welcome, {user.profile?.firstname} {user.profile?.lastname}</Text>
              <Text>Email: {user.email}</Text>
            </>
          ) : (
            <Text>Please log in, to start improving your nutrition!</Text>
          )}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50, // Added padding to account for the header
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    zIndex: 1,
  },
  headerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  headerLink: {
    fontSize: 15,
    fontWeight: 'bold',
    borderBottomWidth: 1,
  },
  profileLink: {
    fontSize: 15,
    fontWeight: 'bold',
    borderBottomWidth: 1,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 28,
  },
  bodyText: {
    fontSize: 22,
  },
  footerText: {
    fontSize: 16,
    width: '80%',
    textAlign: 'center',
  },
  img: {
    width: 50,
    height: 50,
  },
  card: {
    width: '80%',
    backgroundColor: '#e6e6fa', // Light purple background
    borderRadius: 10,
    padding: 25,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8, // For Android shadow
    alignItems: 'center',
  },
  logout: {
    color: Colors.quintery,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
