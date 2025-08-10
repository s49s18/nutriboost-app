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
            setError("Please enter both email and password.");
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
        router.replace('/'); // <-- Navigate to index.jsx (root)
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
                Login to Your Account
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
                placeholder="Password"
                secureTextEntry
                onChangeText={setPassword}
                value={password}
            />

            <Spacer height={20} />
            <ThemedButton onPress={handleSubmit}>
                <Text style={styles.buttonText}>Login</Text>
            </ThemedButton>
            <Spacer height={20}/>
            <Pressable onPress={() => router.push('/forgot-password')}>
              <ThemedText style={styles.link}>Passwort vergessen?</ThemedText>
            </Pressable>
            <Spacer />
            {error && <Text style={styles.error}>{error}</Text>}

            <Spacer height={100} />
            <Link href="/register" replace>
                <ThemedText style={{ textAlign: "center" }}>
                    Register instead
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
    fontSize: 18,
    marginBottom: 30
  },

  buttonText: {
      color: '#f2f2f2',
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
  }
})