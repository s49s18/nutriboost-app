import { StyleSheet, Keyboard, TouchableWithoutFeedback, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useUser } from '../../hooks/useUser';
import { Colors } from '../../constants/Colors';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedButton from '../../components/ThemedButton';
import Spacer from '../../components/Spacer';
import ThemedTextInput from '../../components/ThemedTextInput';
import { Alert, ActivityIndicator } from 'react-native';


export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter(); // Initialize router
  const { user, resetPassword } = useUser();

  const handlePasswordReset = async () => {
    setError(null);
    if (!email) {
      setError('Bitte gib deine E-Mail-Adresse ein.');
      return;
    }
  
    setLoading(true);
    try {
      const { error } = await resetPassword(email.trim());
      setLoading(false);
  
      if (error) {
        console.log('resetPasswordForEmail error', error);
        setError(error.message || 'Konnte Reset-Mail nicht senden.');
        return;
      }
  
      Alert.alert(
        'E-Mail verschickt',
        'Wenn es einen Account mit dieser E-Mail gibt, wurde eine Reset-Mail versendet. Bitte prüfe dein Postfach.'
      );
  
      router.replace('/login');
    } catch (err) {
      setLoading(false);
      console.error('Unerwarteter Fehler beim Passwort-Reset', err);
      setError(err.message || 'Unerwarteter Fehler');
    }
  };
  

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ThemedView style={styles.container}>
      <Spacer />
      <ThemedText title={true} style={styles.title}>Passwort zurücksetzen</ThemedText>

      <ThemedTextInput
        style={{width: '80%', marginBottom: 20 }}
        placeholder="E-Mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Spacer height={5} />

      {loading ? (
        <ActivityIndicator />
      ) : (
        <ThemedButton title="Reset-Link senden" onPress={handlePasswordReset}>
            <Text style={styles.buttonText}>Reset-Link Senden</Text>
        </ThemedButton>
      )}
      <Spacer height={20} />
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}
      <Spacer height={100} />

      <TouchableOpacity onPress={() => router.replace('/login')}>
          <ThemedText>Zurück zur Anmeldung</ThemedText>
      </TouchableOpacity>
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
  fontSize: 20,
  marginBottom: 30,
  fontFamily: 'Comfortaa',
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
  textAlign: 'center',
 },
});