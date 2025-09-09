import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal } from "react-native";
import { ColorContext } from "../contexts/ColorContext";
import ColorModal from "./ColorModal";

const ColorOverviewModal = ({ visible, onClose }) => {
  const { colors, updateColors } = useContext(ColorContext);
  const [selectedColorKey, setSelectedColorKey] = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);


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

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Farben bearbeiten 🎨</Text>

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

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Schließen</Text>
          </TouchableOpacity>

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
    height: "80%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  colorBox: {
    flex: 1,
    height: 100,
    margin: 10,
    borderRadius: 10,
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
  closeButton: {
    marginTop: 10,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#ccc",
    borderRadius: 10,
  },
  closeText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
