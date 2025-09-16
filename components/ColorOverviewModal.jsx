import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, Button} from "react-native";
import ThemedText from "../components/ThemedText"
import { ColorContext } from "../contexts/ColorContext";
import ColorModal from "./ColorModal";
import ConfirmModal from "./ConfirmModal"
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/Colors';

const ColorOverviewModal = ({ visible, onClose }) => {
  const { colors, updateColors, resetColors } = useContext(ColorContext);
  const { themeName } = useTheme();
  const theme = themeName === 'light' ? Colors.light : Colors.dark;
  const [selectedColorKey, setSelectedColorKey] = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const handleColorResetPress = () => setConfirmVisible(true);

  const handleColorPress = (key) => {
    setSelectedColorKey(key);
    setPickerVisible(true);
  };

  const handlePickerSave = (newColors) => {
    console.log("Neue Farbe gespeichert:", newColors);
    updateColors({ ...colors, ...newColors });
    setPickerVisible(false);
  };

  const handlePickerClose = () => setPickerVisible(false);

  /* const handleColorResetPress = () => {
    Alert.alert(
      "Farben zurücksetzen",
      "Bist du sicher, dass du deine Farben auf die Standardwerte zurücksetzen möchtest?",
      [
        { text: "Abbrechen", style: "cancel" },
        { 
          text: "Zurücksetzen", 
          style: "destructive", 
          onPress: () => resetColors() 
        }
      ]
    );
  }; */

  return (
    <>
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.uiBackground }]}>
          <Text style={[styles.title, { color: theme.bwturned }]}>Farben bearbeiten 🎨</Text>

          <FlatList
            style={{ flex: 1 }}
            data={Object.keys(colors)}
            keyExtractor={(item) => item}
            numColumns={2}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.colorBox, { backgroundColor: colors[item] }]}
                onPress={() => handleColorPress(item)}
              >
                <Text style={styles.colorLabel}>{item}</Text>
              </TouchableOpacity>
            )}
          />
          {/* Farben zurücksetzen */}
          <TouchableOpacity onPress={handleColorResetPress} style={styles.settingRow}>
            <MaterialIcons name="lock-reset" size={22} color={theme.iconColor}/>
            <Text style={[styles.settingText, { color: theme.text }]}>Farben zurücksetzen</Text>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
           <Button title="Schließen" onPress={onClose} color={theme.uiBackground} />
          </View>

          {selectedColorKey && (
            <ColorModal
              visible={pickerVisible}
              onClose={handlePickerClose}
              onSave={handlePickerSave}
              initialColors={{ [selectedColorKey]: colors[selectedColorKey] }}
            />
          )}
        </View>
      </View>
    </Modal>

    {/* ConfirmModal jetzt eigenständig = liegt drüber */}
    <ConfirmModal
      visible={confirmVisible}
      onCancel={() => setConfirmVisible(false)}
      onConfirm={() => {
        resetColors();
        setConfirmVisible(false);
      }}
      colors={theme}
    />
  </>
  );
};

export default ColorOverviewModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    height: "56%",
    borderRadius: 15,
    padding: 22,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  colorBox: {
    flex: 1,
    height: 70,
    margin: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  colorLabel: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  settingText: {
    marginLeft: 10,
    fontSize: 15,
  },
   buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
});
