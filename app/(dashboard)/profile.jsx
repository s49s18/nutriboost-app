import React, { useContext, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'expo-router';

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"
import { UserContext } from '../../contexts/UserContexts';
import ThemedLoader from '../../components/ThemedLoader';
import { Colors } from '../../constants/Colors';
import { NutrientsContext } from '../../contexts/NutrientsContext';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert, Button } from "react-native";
import { useTheme} from "../../contexts/ThemeContext";
import EditProfileModal from '../../components/EditProfileModal';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import { MaterialIcons } from '@expo/vector-icons';
import ColorOverviewModal from "../../components/ColorOverviewModal";
import { ColorContext } from "../../contexts/ColorContext";

const Profile = () => {
  const { user, updateProfile, updateUser, deleteUser, deleteProfile } = useContext(UserContext);
  const { allNutrients, trackedNutrients } = useContext(NutrientsContext);
  const { themeName, toggleTheme } = useTheme();
  const theme = themeName === "light" ? Colors.light : Colors.dark;
  // Modalpages states visible or not
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPWModalVisible, setIsPWModalVisible] = useState(false);
  const { colors } = useContext(ColorContext);
  const [isColorModalVisible, setIsColorModalVisible] = useState(false);


  // Nährstoffnamen der getrackten Nährstoffe
  const trackedNames = trackedNutrients
  .map(id => allNutrients.find(n => n.id === id)?.name)
  .filter(Boolean); 


  // Account löschen
  const handleDeleteAccount = () => {
    Alert.alert(
      "Account löschen?",
      "Dieser Vorgang kann nicht rückgängig gemacht werden!",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Löschen",
          style: "destructive",
          onPress: async () => {
            // 1. Profile löschen
            await deleteProfile();
            // 2. Auth-User löschen
            const result = await deleteUser();
            if (result.success) {
              Alert.alert("Account gelöscht", "Dein Account wurde erfolgreich gelöscht.");
            } else {
              Alert.alert("Fehler", result.error || "Konnte Account nicht löschen.");
            }
          }
        }
      ]
    );
  };

  // Zeige einen Ladezustand, wenn die Daten noch nicht geladen sind
  if (!user) return <ThemedLoader />;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <ThemedText style={[styles.headerText, { color: colors.secondary }]} title={true}>
            My Profile
          </ThemedText>
          <TouchableOpacity onPress={() => setIsModalVisible(true)}>
            <MaterialIcons name="edit" size={20} color={theme.iconColor} />
          </TouchableOpacity>
        </View>
        
        <EditProfileModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          user={user}
          onSave={async (updatedData) => {
            const success = await updateProfile(updatedData);
            if (success) {
              Alert.alert('Erfolg', 'Profil erfolgreich aktualisiert!');
            } else {
              Alert.alert('Fehler', 'Profil konnte nicht gespeichert werden.');
            }
          }}
        />

        <Spacer height={15} />
        {/* Quote */}
        <ThemedText style={[styles.quote, { color: theme.bwturned }]}>
          "{user.profile.quote || "The best project you'll ever work on is you."}"
        </ThemedText>
        <Spacer height={30} />
        
        <ThemedView style={styles.infoRow}>
          <ThemedText title={true} style={styles.heading}>Name:</ThemedText>
          <ThemedText> {user.profile.firstname} {user.profile.lastname}  </ThemedText>
        </ThemedView>
        <ThemedView style={styles.infoRow}>
          <ThemedText title={true} style={styles.heading}>E-Mail:</ThemedText>
          <ThemedText> {user.email}</ThemedText>
        </ThemedView>

        {/* Passwort ändern */}
        <TouchableOpacity style={styles.settingRow} onPress={() => setIsPWModalVisible(true)}>
          <MaterialIcons name="lock-reset" size={22} color={theme.text} />
          <ThemedText style={styles.settingText}>Passwort ändern</ThemedText>
        </TouchableOpacity>
          <ChangePasswordModal
            visible={isPWModalVisible}
            onClose={() => setIsPWModalVisible(false)}
            onSave={async (newPassword) => {
              const result = await updateUser({ newPassword });
              if (result.success) {
                Alert.alert("Erfolg", "Passwort erfolgreich geändert.");
              } else {
                Alert.alert("Fehler", result.error || "Konnte Passwort nicht ändern.");
              }
            }}
          />

        <ThemedView style={styles.infoRow}>
          <ThemedText title={true} style={styles.heading}>Nutritions to track:</ThemedText>
          {trackedNames.length > 0 ? (
            <ThemedView style={styles.chipsContainer}>
            {trackedNames.map(name => (
              <ThemedText key={name} style={[styles.chip, { backgroundColor: colors.primary, color: "#fff"}]}>
                {name}
              </ThemedText>
            ))}
          </ThemedView>
          /*   <ThemedView style={{ maxWidth: '50%'}}>
              <ThemedText> {trackedNames.join(', ')}</ThemedText>
            </ThemedView> */

          ) : (
            <ThemedText>None yet</ThemedText>
          )}
        </ThemedView>
        <Spacer height={20} />
          {/* Zeigt einen Link nur an, wenn der Benutzer noch keine Nährstoffe hat */}
          {trackedNutrients.length === 0 && (
            <Link href="/nutrients" style={styles.emptyStateLink}>
              <ThemedText style={[styles.emptyStateText, { color: colors.primary }]}>
                Time to start tracking some nutritions ...
              </ThemedText>
            </Link>
          )}


        {/* Theme Switch */}
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: Colors.neutral.text }]}>
            {themeName === "light" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </Text>
          <Switch
            value={themeName === "dark"}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: colors.primary }}
            thumbColor={themeName === "dark" ? "#fff" : "#f4f3f4"}
          />
        </View>

        {/* Color Picker Modal */}
        {/* Button zum Öffnen */}
        <TouchableOpacity onPress={() => setIsColorModalVisible(true)} style={styles.settingRow}>
          <MaterialIcons name="palette" size={22} color={colors.primary} />
          <ThemedText style={[styles.settingText]}>Farben anpassen</ThemedText>
        </TouchableOpacity>

        {/* OverviewModal */}
          <ColorOverviewModal
            visible={isColorModalVisible}
            onClose={() => setIsColorModalVisible(false)}
          />
      </View>
      
      {/* Danger Zone ganz unten rechts */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleDeleteAccount} style={[styles.settingRow]}>
          <MaterialIcons name="cancel" size={16} color={Colors.error} />
          <Text style={[styles.settingText, { color: Colors.error, fontSize: 12 }]}>Account löschen</Text>
        </TouchableOpacity>
      </View>

    </ThemedView>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
    //alignItems: "center",
  },
  heading: {
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 26,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    //borderBottomWidth: 1,
    //borderBottomColor: Colors.light.iconColor, // Ein hellerer Grauton für die Trennlinie
  },
  quote: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyStateLink: {
    marginTop: 20,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontStyle: 'italic',
    textDecorationLine: 'underline',
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    backgroundColor: "#e0e0e0",
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  chipsContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 5,
  justifyContent: 'center',
  maxWidth: '50%',
},
chip: {
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 15,
  color: '#fff',
  fontSize: 12,
},
settingRow: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 12,
},
settingText: {
  marginLeft: 10,
  fontSize: 15,
},
content: {
  flexGrow: 1,
  justifyContent: "center",
  alignItems: "center",
},
footer: {
  alignItems: "flex-end",
},
quoteRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
},
})