import React, { useState } from 'react';
import { View, Text, Modal, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/Colors';

const ChangePasswordModal = ({ visible, onClose, onSave}) => {
  const { themeName } = useTheme();
  const theme = themeName === 'light' ? Colors.light : Colors.dark;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Fehler", "Die Passwörter stimmen nicht überein.");
      return;
    }

    onSave({ newPassword });
    setNewPassword('');
    setConfirmPassword('');
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
          <Text style={[styles.title, { color: theme.text }]}>Profil bearbeiten</Text>

          <TextInput
            placeholder="Neues Passwort"
            value={newPassword}
            onChangeText={setNewPassword}
            style={[styles.input, { color: theme.text, borderColor: theme.text }]}
          />
          <TextInput
            placeholder="Passwort bestätigen"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={[styles.input, { color: theme.text, borderColor: theme.text }]}
          />

          <View style={styles.buttonRow}>
            <Button title="Abbrechen" onPress={onClose} color={theme.highlight} />
            <Button title="Speichern" onPress={handleSave} color={theme.highlight} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ChangePasswordModal;

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
