import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, Button} from "react-native";

const ConfirmModal = ({ visible, onCancel, onConfirm, theme, colors }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.uiBackground }]}>
            <Text style={[styles.title, { color: theme.text }]}>
            Farben zurücksetzen
            </Text>
            <Text style={{ color: theme.text }}>
            Bist du sicher, dass du deine Farben auf die Standardwerte zurücksetzen möchtest?
            </Text>

            <View style={styles.buttonRow}>
              <Button title="Abbrechen" onPress={onCancel} color={theme.buttonColor} />
              <Button title="Zurücksetzen" onPress={onConfirm} color={colors.senary} />
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
