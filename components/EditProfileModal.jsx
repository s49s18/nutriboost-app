// components/EditProfileModal.js
import React, { useState } from 'react';
import { View, Text, Modal, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/Colors';

const EditProfileModal = ({ visible, onClose, user, onSave }) => {
  const { themeName } = useTheme();
  const theme = themeName === 'light' ? Colors.light : Colors.dark;

  const [firstname, setFirstname] = useState(user?.profile?.firstname || '');
  const [lastname, setLastname] = useState(user?.profile?.lastname || '');
  const [quote, setQuote] = useState(user?.profile?.quote || '');

  const handleSave = () => {
    if (!firstname.trim() || !lastname.trim()) {
      Alert.alert('Fehler', 'Vorname und Nachname dürfen nicht leer sein.');
      return;
    }

    onSave({ firstname, lastname, quote });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.uiBackground }]}>
          <Text style={[styles.title, { color: theme.bwturned }]}>Profil bearbeiten</Text>

          <TextInput
            placeholder="Vorname"
            value={firstname}
            onChangeText={setFirstname}
            style={[styles.input, { color: theme.text, borderColor: theme.text }]}
          />
          <TextInput
            placeholder="Nachname"
            value={lastname}
            onChangeText={setLastname}
            style={[styles.input, { color: theme.text, borderColor: theme.text }]}
          />
          <TextInput
            placeholder="Schreibe hier deine neue Quote..."
            placeholderTextColor={theme.text}
            value={quote}
            onChangeText={setQuote}
            style={[
                styles.input, 
                { 
                color: theme.text, 
                borderColor: theme.text, 
                height: 100,       // Höhe des Textfelds
                textAlignVertical: 'top', // Text startet oben
                padding: 10
                }
            ]}
            multiline={true}
            numberOfLines={4} // optional: initial sichtbare Zeilen
            />


          <View style={styles.buttonRow}>
            <Button title="Abbrechen" onPress={onClose} color={theme.uiBackground} />
            <Button title="Speichern" onPress={handleSave} color={theme.highlight} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditProfileModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    borderRadius: 15,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
});
