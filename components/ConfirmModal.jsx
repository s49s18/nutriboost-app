import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, Button} from "react-native";

const ConfirmModal = ({ visible, onCancel, onConfirm, colors }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.uiBackground }]}>
            <Text style={[styles.title, { color: colors.text }]}>
            Farben zurücksetzen
            </Text>
            <Text style={{ color: colors.text }}>
            Bist du sicher, dass du deine Farben auf die Standardwerte zurücksetzen möchtest?
            </Text>

            <View style={styles.buttonRow}>
              <Button title="Abbrechen" onPress={onCancel} color={colors.uiBackground} />
              <Button title="Zurücksetzen" onPress={onConfirm} color={colors.highlight} />
            </View>
        </View>
        </View>
    </Modal>
  )
};

export default ConfirmModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContainer: {
    width: "85%",
    borderRadius: 12,
    padding: 20
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20
  },
  btn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10
  }
});
