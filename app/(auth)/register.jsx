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
        Register an Account
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

      <ThemedTextInput
        style={{ width: '80%', marginBottom: 20 }}
        placeholder="First Name"
        onChangeText={setFirstname}
        value={firstname}
      />

      <ThemedTextInput
        style={{ width: '80%', marginBottom: 20 }}
        placeholder="Last Name"
        onChangeText={setLastname}
        value={lastname}
      />

      <Spacer height={20} />

      <ThemedButton onPress={handleSubmit}>
          <Text style={{ color: '#f2f2f2' }}>Register</Text>
      </ThemedButton>

      <Spacer height={100} />
      <Link href="/login" replace>
        <ThemedText style={{ textAlign: "center" }}>
          Login instead
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
})