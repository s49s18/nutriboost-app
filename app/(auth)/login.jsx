import { StyleSheet, Keyboard, Text, TouchableWithoutFeedback, Pressable } from 'react-native'
import { Link, useRouter } from 'expo-router' // <-- Import useRouter
import { useState } from 'react'
import { useUser } from '../../hooks/useUser'  // <-- Import useUser to access user context
import { Colors } from '../../constants/Colors'

import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedButton from '../../components/ThemedButton'
import Spacer from '../../components/Spacer'
import ThemedTextInput from '../../components/ThemedTextInput'

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const router = useRouter(); // <-- Initialize router
    const { user, login } = useUser(); // <-- Use useUser to access user context

    const handleSubmit = async () => {
        setLoading(true);
        setError(null); // Reset error state

        if (!email || !password) {
            setError("Bitte gib sowohl E-Mail als auch Passwort ein.");
            setLoading(false);
            return;
        }
       try {
        const { user, error } = await login(email, password);
        if (error) {
          setError(error);
          setLoading(false);
          return;
        }
        console.log('current user is: ', user);
        router.replace('/dashboard'); // <-- Navigate to dashboard or to '/' index.jsx
      } catch (error) {
        console.log('Login error:', error)
        setError(error)
      }
    }

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ThemedView style={styles.container}>
            <Spacer />
            <ThemedText title={true} style={styles.title}>
                Bei deinem Konto anmelden
            </ThemedText>
            <ThemedTextInput
                style={{ width: '80%', marginBottom: 20 }}
                placeholder="E-Mail"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={setEmail}
                value={email}
            />

            <ThemedTextInput
                style={{ width: '80%', marginBottom: 20 }}
                placeholder="Passwort"
                secureTextEntry
                onChangeText={setPassword}
                value={password}
            />
             {error && <Text style={styles.error}>{error}</Text>}

            <Spacer height={20} />
          {/*   <ThemedButton style={{paddingHorizontal: 140}} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Login</Text>
            </ThemedButton> */}
            <Pressable style={[styles.button]} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Login</Text>
            </Pressable>
            <Spacer height={20}/>
            <Pressable onPress={() => router.push('/forgot-password')}>
              <ThemedText style={styles.link}>Passwort vergessen?</ThemedText>
            </Pressable>
            <Spacer />

            <Spacer height={100} />
            <Link href="/register" replace>
                <ThemedText style={{ textAlign: "center" }}>
                    Zur Registrierung
                </ThemedText>
            </Link>
        </ThemedView>
      </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: 'center',
  },
  title: {
    textAlign: "center",
    fontSize: 20,
    marginBottom: 30,
    fontFamily: 'Comfortaa',
  },
  button: {
    padding: 18,
    paddingHorizontal: 140,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: '#000'
  },
  buttonPressed: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  error: {
      color: Colors.warning,
      padding: 10,
      backgroundColor: Colors.warningBackground,
      marginHorizontal: 10,
      borderWidth: 1,
      borderColor: Colors.warning,
      borderRadius: 6,
  }
})