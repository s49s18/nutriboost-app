import React from 'react';
import { Stack } from 'expo-router';
import { useTheme} from "../../../contexts/ThemeContext";
import { Colors } from '../../../constants/Colors';

export default function NutrientsLayout() {

  const { themeName, toggleTheme } = useTheme();
  const theme = themeName === "light" ? Colors.light : Colors.dark;

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Nährstoffe",
          headerShown: false, // Kopfzeile für die Übersichtsseite nicht anzeigen
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: "Details",
          headerBackTitleVisible: false, // Zeigt keinen Titel für den Zurück-Button an
          headerStyle: {
          backgroundColor: theme.navBackground,
            },
          headerTintColor: theme.text,
        }} 
      />
    </Stack>
  );
}
