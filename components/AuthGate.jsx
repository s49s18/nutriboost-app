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
    // Expo Router:
    // - Root "index" => segments.length === 0
    // - Gruppen => segments[0] === '(auth)' | '(dashboard)' | ...
    const atRoot = segments.length === 0
    const inAuth = segments[0] === '(auth)' || atRoot // Home gilt als "auth/public"
    const inApp  = segments[0] === '(dashboard)'

    if (user && inAuth) {
       router.replace('/(dashboard)/dashboard')
      return
    }

    if (!user && inApp) {
      // -> Nicht eingeloggt, aber im App-Bereich: zur Login-Seite
      router.replace('/(auth)/login')
    }
  }, [ user, segments, router])

  return <>{children}</>
}
