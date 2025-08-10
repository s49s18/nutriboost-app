import React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../../constants/Colors';

export default function NutrientsLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

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
        }} 
      />
    </Stack>
  );
}
