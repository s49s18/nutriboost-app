import { StyleSheet, Text, useColorScheme, View } from 'react-native'
import { usePathname } from 'expo-router';
import { Stack, useSegments } from 'expo-router';
import { Colors } from '../constants/Colors'
import { UserProvider } from '../contexts/UserContexts'
import { NutrientsProvider } from '../contexts/NutrientsContext'
import AppHeader from '../components/AppHeader';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { ColorProvider } from '../contexts/ColorContext';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

// Verhindert das automatische Ausblenden des Splash Screens
SplashScreen.preventAutoHideAsync();

const AppWrapper = () => {
  // useTheme hier funktioniert, weil wir innerhalb von ThemeProvider sind
  const { themeName } = useTheme();
  const theme = themeName === 'light' ? Colors.light : Colors.dark;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.navBackground },
          headerTintColor: theme.title,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ title: 'About' }} />
        <Stack.Screen name="contact" options={{ title: 'Contact' }} />
      </Stack>
    </View>
  );
};

const RootLayout = () => {
  // Fonts werden geladen
  const [fontsLoaded] = useFonts({
    'Montserrat': require('../assets/fonts/Montserrat-VariableFont_wght.ttf'),
    //'MyFont-Bold': require('../assets/fonts/MyFont-Bold.ttf'),
  });

  // Zeige den Splash Screen, bis die Fonts geladen sind
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Wenn Fonts noch nicht geladen sind, render nichts
  if (!fontsLoaded) {
    return null;
  }

  return (
      <UserProvider>
        <ThemeProvider>
        <ColorProvider>
        <NutrientsProvider>
          <AppWrapper />
        </NutrientsProvider>
        </ColorProvider>
        </ThemeProvider>
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