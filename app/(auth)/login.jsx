import { StyleSheet, Keyboard, Text, TouchableWithoutFeedback, Pressable, TouchableOpacity, Platform, View } from 'react-native'
import { Link, useRouter } from 'expo-router' // <-- Import useRouter
import { useState } from 'react'
import { useUser } from '../../hooks/useUser'  // <-- Import useUser to access user context
import { Colors } from '../../constants/Colors'

import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedButton from '../../components/ThemedButton'
import Spacer from '../../components/Spacer'
import ThemedTextInput from '../../components/ThemedTextInput'
import { MaterialIcons } from '@expo/vector-icons';
import GuestOnly from '../../components/auth/GuestOnly'

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
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
        setLoading(false);
        //console.log('current user is: ', user);
        //router.replace('/dashboard'); // <-- Navigate to dashboard or to '/' index.jsx
      } catch (error) {
        console.log('Login error:', error)
        setError(error)
      }
    }

    return (
      <GuestOnly>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ThemedView style={styles.container}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace('/')}
            >
              <MaterialIcons name="keyboard-backspace" size={30} color="black" />
            </TouchableOpacity>
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

            
      <View style={{ width: '80%', position: 'relative', marginBottom: 20 }}>
              <ThemedTextInput
                style={{ paddingRight: 40 }} 
                placeholder="Passwort"
                secureTextEntry={!passwordVisible}
                onChangeText={setPassword}
                value={password}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: [{ translateY: -12 }], 
                }}
              >
                <MaterialIcons
                  name={passwordVisible ? 'visibility' : 'visibility-off'}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
                 
             {error && <Text style={styles.error}>{error}</Text>}

            <Spacer height={20} />
          {/*   <ThemedButton style={{paddingHorizontal: 140}} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Login</Text>
            </ThemedButton> */}
            <TouchableOpacity style={[styles.button]} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Anmelden</Text>
            </TouchableOpacity>
            <Spacer height={20}/>
            <TouchableOpacity onPress={() => router.push('/forgot-password')}>
              <ThemedText style={styles.link}>Passwort vergessen?</ThemedText>
            </TouchableOpacity>
            <Spacer />

            <Spacer height={100} />
        
            <TouchableOpacity onPress={() => router.replace('/register')}>
                <ThemedText>Zur Registrierung</ThemedText>
            </TouchableOpacity>
        </ThemedView>
      </TouchableWithoutFeedback>
      </GuestOnly>
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
      marginHorizontal: 10,
      borderWidth: 1,
      borderColor: Colors.warning,
      borderRadius: 6,
  },
  backButton: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 60 : 40,
      left: 20,
      zIndex: 10,
    },
})