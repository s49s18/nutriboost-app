// components/EditProfileModal.js
import React, { useState, useContext } from 'react';
import { View, Text, Modal, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import { ColorContext } from '../contexts/ColorContext';

const EditProfileModal = ({ visible, onClose, user, onSave }) => {
  const { themeName } = useTheme();
  const theme = themeName === 'light' ? Colors.light : Colors.dark;
  const { colors } = useContext(ColorContext);

  const [firstname, setFirstname] = useState(user?.profile?.firstname || '');
  const [lastname, setLastname] = useState(user?.profile?.lastname || '');
  const [quote, setQuote] = useState(user?.profile?.quote || '');
 /*  const [avatar, setAvatar] = useState(user?.profile?.avatar_url || null);

  const pickImage = async () => {
  // Berechtigungen anfordern
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert("Erlaubnis benötigt", "Bitte erlaube den Zugriff auf deine Fotos.");
    return;
  }

  // Bild auswählen
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaType.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    // Pfad zum Bild setzen
    setAvatar(result.assets[0].uri);
  }
};  */


  const handleSave = () => {
    if (!firstname.trim() || !lastname.trim()) {
      Alert.alert('Fehler', 'Vorname und Nachname dürfen nicht leer sein.');
      return;
    }

    onSave({ firstname, lastname, quote /*, avatar_url: avatar */});
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
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <Text style={[styles.title, { color: theme.bwturned }]}>Profil bearbeiten</Text>
          {/*  <TouchableOpacity onPress={pickImage} style={{ alignSelf: 'center', marginBottom: 15 }}>
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                style={{ width: 100, height: 100, borderRadius: 50 }}
              />
            ) : (
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: '#ccc',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text>+</Text>
              </View>
            )}
          </TouchableOpacity> */}


          <TextInput
            placeholder="Vorname"
            value={firstname}
            onChangeText={setFirstname}
            style={[styles.input, { color: theme.text, borderColor: theme.text }]}
             placeholderTextColor={theme.iconColor}
          />
          <TextInput
            placeholder="Nachname"
            value={lastname}
            onChangeText={setLastname}
            style={[styles.input, { color: theme.text, borderColor: theme.text }]}
            placeholderTextColor={theme.iconColor}
          />
          <TextInput
            placeholder="Schreibe hier deine neue Quote..."
            placeholderTextColor={theme.iconColor}
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
            <Button title="Abbrechen" onPress={onClose} color={theme.buttonColor} />
            <Button title="Speichern" onPress={handleSave} color={colors.senary} />
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
