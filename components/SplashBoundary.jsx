// components/SplashBoundary.tsx
import React, { useEffect, useState } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'
import { useUser } from '../hooks/useUser'

SplashScreen.preventAutoHideAsync()

export default function SplashBoundary({ children }) {
  const [fontsLoaded] = useFonts({
    Montserrat: require('../assets/fonts/Montserrat-VariableFont_wght.ttf'),
    Comfortaa: require('../assets/fonts/Comfortaa-VariableFont_wght.ttf'),
  })
  const { authReady } = useUser()
  const [forcedReady, setForcedReady] = useState(false)

  // Watchdog: spätestens nach 5s Splash aus, egal was ist
  useEffect(() => {
    const t = setTimeout(() => setForcedReady(true), 5000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const canHide = (fontsLoaded && authReady) || forcedReady
    if (canHide) {
      SplashScreen.hideAsync().catch(() => {})
    }
  }, [fontsLoaded, authReady, forcedReady])

  // Solange Splash sichtbar bleiben soll, NICHTS rendern
  if (!fontsLoaded || !(authReady || forcedReady)) return null
  return <>{children}</>
}
