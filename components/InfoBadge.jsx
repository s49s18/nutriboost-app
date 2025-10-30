// components/InfoBadge.tsx
import React, { useState } from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/Colors'
import ThemedText from "./ThemedText";

export default function InfoBadge({ title = "Info", children }) {
  const [open, setOpen] = useState(false);
  const { themeName } = useTheme();
  const theme = Colors[themeName] ?? Colors.light;
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title} anzeigen`}
        onPress={() => setOpen(true)}
        style={{
          marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2,
          borderRadius: 12, alignSelf: "center"
        }}
      >
        <MaterialIcons name="info" size={24} style={{fontWeight: 'bold', color: theme.text}} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex:1, backgroundColor:"rgba(0,0,0,0.3)" }} onPress={() => setOpen(false)}>
          <View
            style={{
              marginHorizontal: 24, marginTop: 120, borderRadius: 14,
              backgroundColor: theme.background, padding: 16, elevation: 8, 
            }}
          >
            {children}
            <Pressable
              onPress={() => setOpen(false)}
              style={{
                marginTop: 12, alignSelf: "flex-end",
                paddingHorizontal: 12, paddingVertical: 8, borderRadius: 3, backgroundColor: theme.buttonColor
              }}
              accessibilityRole="button"
              accessibilityLabel="Info schließen"
            >
              <Text style={{ fontWeight: "600" }}>Schließen</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
