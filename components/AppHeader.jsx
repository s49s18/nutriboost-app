import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Link, usePathname } from 'expo-router';
import ThemedView from './ThemedView';
import ThemedLogo from './ThemedLogo';
import ThemedText from './ThemedText';
import { UserContext } from '../contexts/UserContexts';
import { Colors } from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';

const AppHeader = () => {
  const { user, logout } = useContext(UserContext);
  const pathname = usePathname(); // Aktuelle Route ermitteln
  const { themeName } = useTheme();
  const theme = Colors[themeName] ?? Colors.light;

  return (
    <ThemedView style={[styles.header, { borderBottomColor: theme.text }]}>
      <ThemedLogo style={styles.img} />

      <View style={styles.headerLinks}>
        {user ? (
          <>
            <ThemedText style={styles.logout} onPress={logout}>
              Logout
            </ThemedText>
          </>
        ) : (
          <>
            <Link href="/login" style={styles.link}>
              <ThemedText>Login</ThemedText>
            </Link>
            <Link href="/register" style={styles.link}>
              <ThemedText>Register</ThemedText>
            </Link>
          </>
        )}
      </View>

      {/* Nur im Dashboard extra Begrüßung */}
      {pathname === '/dashboard' && user && (
        <ThemedText style={styles.welcome}>
           Willkommen, {user.profile?.firstname}
        </ThemedText>
      )}
    </ThemedView>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
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
    paddingTop: 20,
    borderBottomWidth: 1,
    zIndex: 1,
  },
  img: {
    width: 120,
    height: 40,
  },
  headerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  link: {
    fontSize: 15,
    fontWeight: 'bold',
    borderBottomWidth: 1,
  },
  logout: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  welcome: {
    position: 'absolute',
    bottom: -20,
    left: 20,
    paddingVertical: 5,
    paddingHorizontal: 20,
    fontSize: 14,
    fontWeight: '500',
  },
});
