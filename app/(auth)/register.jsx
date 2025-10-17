import { StyleSheet, Text, Keyboard, View, KeyboardAvoidingView, ScrollView,  Platform, TouchableWithoutFeedback, Alert, TouchableOpacity } from 'react-native'
import { Link, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useUser } from '../../hooks/useUser' // <-- Import useUser to access user context
import { Colors } from '../../constants/Colors'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import ThemedTextInput from '../../components/ThemedTextInput'
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'
import ThemedButton from '../../components/ThemedButton'
import { MaterialIcons } from '@expo/vector-icons';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');

    const router = useRouter(); // Initialize router
    const { user, register } = useUser();

    const handleSubmit = async () => {

      if (password !== confirmPassword) {
        Alert.alert('Fehler', 'Die Passwörter stimmen nicht überein.');
        return;
      }

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

      Alert.alert('Erfolg', 'Registrierung erfolgreich!');
      router.replace('/');
    };


  return (
   <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
     <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 80}
        keyboardShouldPersistTaps="handled"
      >
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace('/')}
      >
        <MaterialIcons name="keyboard-backspace" size={30} color="black" />
      </TouchableOpacity>

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

      <View style={{ width: '80%', position: 'relative', marginBottom: 20 }}>
        <ThemedTextInput
          style={{ paddingRight: 40  }}
          placeholder="Passwort bestätigen"
          secureTextEntry={!confirmPasswordVisible}
          onChangeText={setConfirmPassword}
          value={confirmPassword}
        />
        <TouchableOpacity
          onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: [{ translateY: -12 }],
          }}
        >
          <MaterialIcons
            name={confirmPasswordVisible ? 'visibility' : 'visibility-off'}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      </View>

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
     </KeyboardAwareScrollView>
   </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
   scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
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
  },
  homeIcon: {
    position: 'absolute',
    top: 70,
    left: 30,
    zIndex: 10,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 10,
  },
})