// components/AuthGate.tsx
import React, { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useRouter, useSegments } from 'expo-router'
import { useUser } from '../hooks/useUser'

export default function AuthGate({ children }) {
  const { user, authReady } = useUser()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (!authReady) return

    // Expo Router:
    // - Root "index" => segments.length === 0
    // - Gruppen => segments[0] === '(auth)' | '(dashboard)' | ...
    const atRoot = segments.length === 0
    const inAuth = segments[0] === '(auth)' || atRoot // Home gilt als "auth/public"
    const inApp  = segments[0] === '(dashboard)'

    if (user && !inApp) {
      // -> Eingeloggt, aber nicht im App-Bereich: ab ins Dashboard
      // Wähle das Ziel passend zu deiner Dateistruktur:

      // Option A: dein Dashboard ist app/(dashboard)/index.tsx
      //router.replace('/(dashboard)')

      // Option B: dein Dashboard ist app/(dashboard)/dashboard.tsx
       router.replace('/(dashboard)/dashboard')

      return
    }

    if (!user && inApp) {
      // -> Nicht eingeloggt, aber im App-Bereich: zur Login-Seite
      router.replace('/(auth)/login')
    }
  }, [authReady, user, segments, router])

  if (!authReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }

  return <>{children}</>
}
