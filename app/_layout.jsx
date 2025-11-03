import { StyleSheet, Text, useColorScheme, View } from 'react-native'
import { usePathname } from 'expo-router';
import { Stack, Redirect } from 'expo-router';
import { Colors } from '../constants/Colors'
import { UserProvider } from '../contexts/UserContexts'
import { NutrientsProvider } from '../contexts/NutrientsContext'
import AppHeader from '../components/AppHeader';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { ColorProvider } from '../contexts/ColorContext';
import AuthGate from '../components/AuthGate';
import { NotificationPermissionProvider } from '../contexts/NotificationPermissionProvider';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import ThemedLoader from '../components/ThemedLoader';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, 
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Verhindert das automatische Ausblenden des Splash Screens
SplashScreen.preventAutoHideAsync();

const AppWrapper = () => {
  // useTheme hier funktioniert, weil wir innerhalb von ThemeProvider sind
  const { themeName } = useTheme();
  const theme = themeName === 'light' ? Colors.light : Colors.dark;

  return (
     <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack screenOptions={{ headerShown: false }}>
       <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(dashboard)" />
      </Stack>
     </View>
   );
 };

function RootInner() {
  // Fonts werden geladen
  const [fontsLoaded] = useFonts({
    'Montserrat': require('../assets/fonts/Montserrat-VariableFont_wght.ttf'),
    'Comfortaa': require('../assets/fonts/Comfortaa-VariableFont_wght.ttf'),
  })
  const { authReady } = useUser()

  useEffect(() => {
    if (fontsLoaded && authReady) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, authReady])

  // Wichtig: nichts rendern, solange Splash sichtbar bleiben soll
  if (!fontsLoaded || !authReady) return null

  return (
    <NotificationPermissionProvider>
      <ThemeProvider>
        <ColorProvider>
          <AuthGate>
            <NutrientsProvider>
              <AppWrapper />
            </NutrientsProvider>
          </AuthGate>
        </ColorProvider>
      </ThemeProvider>
    </NotificationPermissionProvider>
  )
}

export default function RootLayout() {
  return (
    <UserProvider>
      <RootInner />
    </UserProvider>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
})

{/* This file is used to define the layout of the app.
It wraps around all the pages and can be used to add common elements like headers or footers.
You can also use it to define global styles or themes. 
It is applied to all pages and subpages, so if we wrap this for example with the Component UserProvider, all this pages have access
to the variables provided by the UserContext (user, login, logout, register ). */}