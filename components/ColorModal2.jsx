import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, Button, ScrollView } from "react-native";
import ColorPicker from 'react-native-wheel-color-picker';
import { useTheme } from "../contexts/ThemeContext";
import { Colors as DefaultColors } from "../constants/Colors";

const ColorModal = ({ visible, onClose, onSave, initialColors }) => {
  const { themeName } = useTheme();
  const theme = themeName === "light" ? DefaultColors.light : DefaultColors.dark;

  const [tempColors, setTempColors] = useState(initialColors);

  const handleColorChange = (key, color) => {
    setTempColors({ ...tempColors, [key]: color });
  };

  const handleSave = () => {
    onSave(tempColors);
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
          <Text style={[styles.title, { color: theme.text }]}>Farben anpassen 🎨</Text>
          
          <ScrollView style={{ flex: 1 }}>
            {Object.keys(initialColors).map((key) => (
              <View key={key} style={styles.colorRow}>
                <Text style={[styles.label, { color: theme.text }]}>{key}</Text>
                <ColorPicker
                  color={tempColors[key]}
                  onColorChange={(color) => handleColorChange(key, color)}
                  thumbSize={30}
                  sliderSize={30}
                  noSnap={true}
                  row={false}  // Wheel-Layout
                  swatches={false}
                  style={styles.picker}
                />
              </View>
            ))}
          </ScrollView>

          <View style={styles.buttonRow}>
            <Button title="Abbrechen" onPress={onClose} color={theme.uiBackground} />
            <Button title="Speichern" onPress={handleSave} color={theme.highlight} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ColorModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    height: "80%",
    borderRadius: 15,
    padding: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  colorRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    height: 250,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
});
