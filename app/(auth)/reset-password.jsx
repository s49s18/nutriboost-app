import React, { useState, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, Keyboard, TouchableWithoutFeedback, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useUser } from '../../hooks/useUser';
import { supabase } from '../../lib/supabaseClient';

// Import custom themed components
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedButton from '../../components/ThemedButton';
import Spacer from '../../components/Spacer';
import ThemedTextInput from '../../components/ThemedTextInput';
import { Colors } from '../../constants/Colors';

export default function ResetPasswordScreen() {
  const router = useRouter();
  // Nutze den Ladezustand und das user-Objekt aus der globalen Hook
  const { updateUser, user, loading: userLoading } = useUser();

  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  
  const [hasProcessedUrl, setHasProcessedUrl] = useState(false);

  // Custom function to handle session from the URL fragment
  const handleSessionFromUrl = async (url) => {
    // Fügen Sie einen Debug-Log hinzu, um die empfangene URL zu überprüfen
    console.log('Received URL:', url);
    if (!url) return;

    // Split the URL at '#' to get the fragment which contains the tokens.
    const urlParts = url.split('#');
    if (urlParts.length > 1) {
      const fragment = urlParts[1];
      const params = new URLSearchParams(fragment);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        try {
          // Manually set the session with the tokens from the URL.
          // This should trigger the onAuthStateChange listener in the UserProvider.
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Error setting session:', sessionError);
            setError('Konnte Sitzung nicht wiederherstellen. Der Token ist möglicherweise ungültig oder abgelaufen.');
          }
        } catch (e) {
          console.error('Unexpected error setting session:', e);
          setError('Ein unerwarteter Fehler ist aufgetreten.');
        }
      } else {
        // Dieser Block wird ausgeführt, wenn der Link keinen Token enthält
        console.error('URL fragment does not contain access_token or refresh_token.');
        setError('Der Link zum Zurücksetzen des Passworts ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen Link an.');
      }
    } else {
      // Dieser Block wird ausgeführt, wenn die URL gar kein Fragment hat
      console.error('URL does not contain a fragment (#).');
      setError('Der Link zum Zurücksetzen des Passworts ist ungültig. Möglicherweise wurde er von Ihrem E-Mail-Client oder Browser manipuliert.');
    }
  };

  useEffect(() => {
    let subscription;

    const processInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      handleSessionFromUrl(initialUrl);

      subscription = Linking.addEventListener('url', (event) => {
        handleSessionFromUrl(event.url);
      });
      
      setHasProcessedUrl(true);
    };

    processInitialUrl();

    // Cleanup function for the useEffect hook.
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const handleUpdatePassword = async () => {
    setError(null);
    if (!password || password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    try {
      const { success, error: updateError } = await updateUser(password);
  
      if (success) {
        Alert.alert('Erfolg', 'Dein Passwort wurde geändert. Bitte logge dich erneut ein.');
        router.replace('/login');
      } else {
        setError(updateError || 'Konnte Passwort nicht ändern.');
      }
    } catch (e) {
      console.error("Unerwarteter Fehler beim Passwort-Update:", e);
      setError('Ein unerwarteter Fehler ist aufgetreten.');
    }
  };
  
  // Zeige den Ladezustand an, solange die Hook lädt oder die URL verarbeitet wird
  const showLoadingState = userLoading || !hasProcessedUrl;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView style={styles.container}>
        {showLoadingState ? (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <ThemedText style={styles.loadingText}>Sitzung wird geladen...</ThemedText>
            {error && (
              <>
                <Text style={styles.error}>{error}</Text>
                <Spacer height={20} />
                <ThemedButton onPress={() => router.replace('/login')} disabled={userLoading}>
                  <Text style={styles.buttonText}>Zurück zur Anmeldung</Text>
                </ThemedButton>
              </>
            )}
          </ThemedView>
        ) : (
          // Zeige den Passwort-Ändern-Bildschirm nur, wenn eine Session existiert
          user ? (
            <>
              <Spacer />
              <ThemedText title={true} style={styles.title}>
                Passwort ändern
              </ThemedText>
              <ThemedTextInput
                style={{ width: '80%', marginBottom: 20 }}
                placeholder="Neues Passwort"
                secureTextEntry
                onChangeText={setPassword}
                value={password}
              />

              <Spacer height={20} />
              <ThemedButton onPress={handleUpdatePassword} disabled={userLoading}>
                {userLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Passwort ändern</Text>
                )}
              </ThemedButton>
              <Spacer />
              {error && <Text style={styles.error}>{error}</Text>}
              <Spacer height={100} />
            </>
          ) : (
            // Zeige eine Fehlermeldung an, wenn keine Session geladen werden konnte
            <ThemedView style={styles.loadingContainer}>
              <Text style={styles.error}>Sitzung konnte nicht geladen werden. Bitte fordern Sie einen neuen Link an oder überprüfen Sie die URL-Konfiguration in Supabase.</Text>
              <Spacer height={20} />
              <ThemedButton onPress={() => router.replace('/login')} disabled={userLoading}>
                <Text style={styles.buttonText}>Zurück zur Anmeldung</Text>
              </ThemedButton>
            </ThemedView>
          )
        )}
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 30,
  },
  buttonText: {
    color: '#f2f2f2',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  error: {
    color: Colors.warning,
    padding: 10,
    backgroundColor: '#f5c1c8',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.warning,
    borderRadius: 6,
    textAlign: 'center',
    marginTop: 20
  },
});
