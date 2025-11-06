// app/_layout.jsx
import { StyleSheet, View } from 'react-native'
import { Stack } from 'expo-router'
import { Colors } from '../constants/Colors'
import { UserProvider } from '../contexts/UserContexts'
import { NutrientsProvider } from '../contexts/NutrientsContext'
import { ThemeProvider, useTheme } from '../contexts/ThemeContext'
import { ColorProvider } from '../contexts/ColorContext'
import AuthGate from '../components/AuthGate'
import { NotificationPermissionProvider } from '../contexts/NotificationPermissionProvider'
import { useFonts } from 'expo-font'
import { useEffect } from 'react'
import { useUser } from '../hooks/useUser'
import * as SplashScreen from 'expo-splash-screen'
import * as Notifications from 'expo-notifications'
import ThemedLoader from '../components/ThemedLoader'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

SplashScreen.preventAutoHideAsync();

const AppWrapper = () => {
  const { themeName } = useTheme();
  const theme = themeName === 'light' ? Colors.light : Colors.dark;
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(dashboard)" />
        <Stack.Screen name="index" />
      </Stack>
    </View>
  );
};

// Wartet auf Fonts + Auth, blendet DANN Splash aus
const ReadyGate = ({ fontsLoaded, children }) => {
  const { authReady } = useUser();
  console.log("Auf App-Startseite gelandet...")
  useEffect(() => {
    if (fontsLoaded && authReady) {
      console.log("Fonts loaded & Auth is ready...")
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authReady]);

  if (!fontsLoaded || !authReady) {
    console.log("Warte bis Fonts und Auth geladen sind...")
    console.log("Fonts loaded: "+fontsLoaded + " Auth Ready: "+authReady)
    return <ThemedLoader />;
  }
  return children;
};

const RootLayout = () => {
  const [fontsLoaded] = useFonts({
    'Montserrat': require('../assets/fonts/Montserrat-VariableFont_wght.ttf'),
    'Comfortaa': require('../assets/fonts/Comfortaa-VariableFont_wght.ttf'),
  });

  return (
    <UserProvider>
      <NotificationPermissionProvider>
        <ThemeProvider>
          <ColorProvider>
              <NutrientsProvider>
                <ReadyGate fontsLoaded={fontsLoaded}>
                  <AppWrapper />
                </ReadyGate>
              </NutrientsProvider>
          </ColorProvider>
        </ThemeProvider>
      </NotificationPermissionProvider>
    </UserProvider>
  );
};

export default RootLayout;

const styles = StyleSheet.create({
  container: { flex: 1 },
});


{/* This file is used to define the layout of the app.
It wraps around all the pages and can be used to add common elements like headers or footers.
You can also use it to define global styles or themes. 
It is applied to all pages and subpages, so if we wrap this for example with the Component UserProvider, all this pages have access
to the variables provided by the UserContext (user, login, logout, register ). */}