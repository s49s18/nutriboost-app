import React, { useContext, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'expo-router';

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"
import { useUser } from '../../hooks/useUser';
import ThemedLoader from '../../components/ThemedLoader';
import { Colors } from '../../constants/Colors';
import { NutrientsContext } from '../../contexts/NutrientsContext';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert, ScrollView, Image} from "react-native";
import { useTheme} from "../../contexts/ThemeContext";
import EditProfileModal from '../../components/EditProfileModal';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import { MaterialIcons } from '@expo/vector-icons';
import ColorOverviewModal from "../../components/ColorOverviewModal";
import { ColorContext } from "../../contexts/ColorContext";

const Profile = () => {
  const { user, updateProfile, updateUser, deleteUser, deleteProfile } =  useUser();
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
      <ScrollView 
      contentContainerStyle={styles.scrollContainer} 
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* RUNDES PROFILBILD */}
        <Spacer height={30} />
       {/*  <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: user.profile.profile_image_url || 'https://via.placeholder.com/120' }} // Passe 'avatar_url' an deine Daten an
            style={styles.profileImage}
          />
        </View> */}
         <Spacer height={5} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <ThemedText style={[styles.headerText, { color: colors.primary }]} title={true}>
             {user.profile.firstname}
          </ThemedText>
          <TouchableOpacity onPress={() => setIsModalVisible(true)}>
            <MaterialIcons name="edit" size={20} color={theme.iconColor} />
          </TouchableOpacity>
        </View>
        <ThemedText> {user.email}</ThemedText>
        
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

        <Spacer height={5} />
        {/* Quote */}
        <ThemedText style={[styles.quote, { color: theme.bwturned }]}>
          "{user.profile.quote || "The best project you'll ever work on is you."}"
        </ThemedText>
        <Spacer height={30} />

        {/* Getrackte Nährstoffe */}
        <View style={[styles.infoBox, { backgroundColor: theme.navBackground, borderColor: theme.uiBackground, borderBottomWidth: 1,
  borderRightWidth: 1, }]}>
          <Text title={true} style={[styles.heading, { color: theme.text }]}>Getrackte Nährstoffe:</Text>
          {trackedNames.length > 0 ? (
            <View style={styles.chipsContainer}>
            {trackedNames.map(name => (
              <View key={name} style={[styles.chip, { backgroundColor: theme.bwturned}]}>
                <Text style={{ color: theme.bw, fontSize: 13, fontWeight: '600' }}>
                  {name}
                </Text>
              </View>
            ))}
            </View>

          /*   <ThemedView style={{ maxWidth: '50%'}}>
              <ThemedText> {trackedNames.join(', ')}</ThemedText>
            </ThemedView> */

          ) : (
            <Text style={{color: theme.text}}>Noch keine</Text>
          )}
        </View>
        <Spacer height={10} />
          {/* Zeigt einen Link nur an, wenn der Benutzer noch keine Nährstoffe hat */}
          {trackedNutrients.length === 0 && (
            <Link href="/nutrients" style={styles.emptyStateLink}>
              <ThemedText style={[styles.emptyStateText, { color: colors.primary }]}>
                Starte jetzt mit dem Tracking deiner Nährstoffe ...
              </ThemedText>
            </Link>
          )}
        {/* Theme Switch */}
        <View style={[styles.switchRow, { borderColor: theme.iconColor }]}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>
            {themeName === "light" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </Text>
          <Switch
            value={themeName === "dark"}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: colors.tertiary}}
            thumbColor={theme.iconColorFocused}
          />
        </View>
        <Spacer height={5} />

        {/* Color Picker Modal */}
        {/* Button zum Öffnen */}
        <TouchableOpacity onPress={() => setIsColorModalVisible(true)} style={styles.settingRow}>
          <MaterialIcons name="palette" size={22} color={colors.tertiary} />
          <ThemedText style={[styles.settingText]}>Themefarben anpassen</ThemedText>
        </TouchableOpacity>

        {/* OverviewModal */}
          <ColorOverviewModal
            visible={isColorModalVisible}
            onClose={() => setIsColorModalVisible(false)}
          />

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
      </View>
      <Spacer height={20} />
      {/* Danger Zone ganz unten rechts */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleDeleteAccount} style={[styles.settingRow]}>
          <MaterialIcons name="cancel" size={16} color={Colors.error} />
          <Text style={[styles.settingText, { color: Colors.error, fontSize: 12 }]}>Account löschen</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </ThemedView>
  )
};

export default Profile;

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
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60, 
    overflow: 'hidden',
    marginTop: 20,
    borderWidth: 3, 
    borderColor: '#eee', 
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, 
  },
  quote: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyStateLink: {
    marginBottom: 30,
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
    width: "100%",
    marginBottom: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    borderWidth: 2,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  infoBox: {
    width: '100%',
    padding: 20,
    alignItems: 'flex-start', // nicht center, damit Text links steht
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // für Android
  },

  heading: {
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 10,
  },

  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 13,
    fontWeight: '500',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
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