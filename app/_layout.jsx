import { StyleSheet, Text, useColorScheme, View } from 'react-native'
import React, { use } from 'react'
import { Stack } from 'expo-router'
import { Colors } from '../constants/Colors'
import { UserProvider } from '../contexts/UserContexts'
import { NutrientsProvider } from '../contexts/NutrientsContext'

const RootLayout = () => {

    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme ] ?? Colors.light

  return (
    <UserProvider>
      <NutrientsProvider>
        <Stack screenOptions={{ 
            headerStyle: { backgroundColor: theme.navBackground },
            headerTintColor: theme.title,

         }}>
            <Stack.Screen name="index" options={{ headerShown: false  }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
            <Stack.Screen name="about" options={{ title: 'About' }} />
            <Stack.Screen name="contact" options={{ title: 'Contact' }} />
        </Stack>
       </NutrientsProvider>
    </UserProvider>
  )
}

export default RootLayout

const styles = StyleSheet.create({})

{/* This file is used to define the layout of the app.
It wraps around all the pages and can be used to add common elements like headers or footers.
You can also use it to define global styles or themes. 
It is applied to all pages and subpages, so if we wrap this for example with the Component UserProvider, all this pages have access
to the variables provided by the UserContext (user, login, logout, register ). */}