import { StyleSheet, Text, Keyboard, TouchableWithoutFeedback } from 'react-native'
import { Link, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useUser } from '../../hooks/useUser' // <-- Import useUser to access user context
import { Colors } from '../../constants/Colors'

import ThemedTextInput from '../../components/ThemedTextInput'
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'
import ThemedButton from '../../components/ThemedButton'

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');

    const router = useRouter(); // Initialize router
    const { user, register } = useUser();

    const handleSubmit = async () => {
      const result = await register(
        email.trim(),
        password,
        firstname.trim(),
        lastname.trim()
      );

      if (!result.success) {
        if (result.message) {
          alert(result.message); // z. B. E-Mail-Bestätigung
          router.replace('/login');
        } else {
          alert('Registrierung fehlgeschlagen: ' + result.error);
        }
        return;
      }

      alert('Registrierung erfolgreich! Du bist eingeloggt.');
      router.replace('/');
    };


  return (
   <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ThemedView style={styles.container}>

      <Spacer />
      <ThemedText title={true} style={styles.title}>
        Neues Konto anlegen
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

      <ThemedTextInput
        style={{ width: '80%', marginBottom: 20 }}
        placeholder="Vorname"
        onChangeText={setFirstname}
        value={firstname}
      />

      <ThemedTextInput
        style={{ width: '80%', marginBottom: 20 }}
        placeholder="Nachname"
        onChangeText={setLastname}
        value={lastname}
      />

      <Spacer height={20} />

      <ThemedButton style={{backgroundColor: Colors.secondary, paddingHorizontal: 110}} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Registrieren</Text>
      </ThemedButton>

      <Spacer height={100} />
      <Link href="/login" replace>
        <ThemedText style={{ textAlign: "center" }}>
          Zum Login
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
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  }
})