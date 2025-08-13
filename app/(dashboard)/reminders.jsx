import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Text, Platform, Alert } from 'react-native';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import ThemedHeader from '../../components/ThemedHeader';
import { Colors } from '../../constants/Colors';
import { UserContext } from '../../contexts/UserContexts';
import { NutrientsContext } from '../../contexts/NutrientsContext';
import Spacer from '../../components/Spacer';
import { FontAwesome } from '@expo/vector-icons';
import { Ionicons } from "@expo/vector-icons"
import * as Notifications from 'expo-notifications';
import { supabase } from '../../lib/supabaseClient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns'; // Nützlich für die Formatierung der Uhrzeit

const ReminderScreen = () => {
  const { user } = useContext(UserContext);
  const { allNutrients, trackedNutrients } = useContext(NutrientsContext);
  
  // trackedNutrients ist ein Array von IDs, wir filtern die Objekte
  const trackedNutrientObjects = allNutrients.filter(n => trackedNutrients.includes(n.id));

  const [selectedNutrient, setSelectedNutrient] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [message, setMessage] = useState('');
  
  // Funktion zum Laden der vorhandenen Erinnerungen
  const fetchReminders = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Fehler beim Laden der Erinnerungen:', error);
    } else {
      setReminders(data);
    }
  };

  // Effekt, um die Erinnerungen beim ersten Laden abzurufen
  useEffect(() => {
    fetchReminders();
  }, [user]);

  // Funktion zum Speichern der Erinnerung
  const saveReminder = async () => {
    if (!selectedNutrient) {
      setMessage('Bitte wähle einen Nährstoff aus.');
      return;
    }

    try {
      // 1. Überprüfen, ob die Berechtigungen erteilt wurden
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Benachrichtigungen deaktiviert',
          'Bitte aktiviere Benachrichtigungen in den App-Einstellungen, um Erinnerungen zu erhalten.'
        );
        return;
      }
      
      // Überprüfen, ob bereits eine Erinnerung für diesen Nährstoff existiert
      const existingReminder = reminders.find(r => r.nutrient_id === selectedNutrient.id);
      if (existingReminder) {
        setMessage('Für diesen Nährstoff ist bereits eine Erinnerung gesetzt. Bitte lösche diese zuerst.');
        return;
      }

      // 2. Benachrichtigung im Gerät des Benutzers planen
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Erinnerung",
          body: `Vergiss nicht, ${selectedNutrient.name} zu nehmen!`,
        },
        trigger: {
          hour: selectedDate.getHours(),
          minute: selectedDate.getMinutes(),
          repeats: true,
        },
      });

      // 3. Benachrichtigung in Supabase speichern (inkl. der Notification-ID)
      const { error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          nutrient_id: selectedNutrient.id,
          reminder_time: format(selectedDate, 'HH:mm'), // Uhrzeit formatieren
          notification_id: identifier, // Speichern der Notification-ID
        });

      if (error) {
        // Bei Fehler: Lokale Benachrichtigung wieder löschen
        Notifications.cancelScheduledNotificationAsync(identifier);
        throw error;
      }

      // 4. Benutzeroberfläche aktualisieren
      fetchReminders(); 

      setMessage('Erinnerung erfolgreich gespeichert!');
      setSelectedNutrient(null);
      setSelectedDate(new Date()); // Zurücksetzen der Zeit auf die aktuelle
    } catch (error) {
      console.error('Fehler beim Speichern der Erinnerung:', error);
      setMessage('Fehler beim Speichern der Erinnerung.');
    }
  };

  // Funktion zum Löschen der Erinnerung
  const deleteReminder = async (reminderId, notificationId) => {
    try {
      // Hinzugefügte Prüfung, um Abstürze bei fehlender ID zu verhindern
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
      
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId);
      
      if (error) {
        throw error;
      }
      
      fetchReminders();
      setMessage('Erinnerung erfolgreich gelöscht!');
    } catch (error) {
      console.error('Fehler beim Löschen der Erinnerung:', error);
      setMessage('Fehler beim Löschen der Erinnerung.');
    }
  };
  
  const handleTimeChange = (event, selected) => {
    setShowTimePicker(Platform.OS === 'ios');
    const newTime = selected || selectedDate;
    setSelectedDate(newTime);
  };
  

  const getNutrientReminder = (nutrientId) => {
    return reminders.find(r => r.nutrient_id === nutrientId);
  };

  // Sortiere die Liste der getrackten Nährstoffe. Nährstoffe mit einer Erinnerung
  // erscheinen zuerst.
  const sortedTrackedNutrientObjects = [...trackedNutrientObjects].sort((a, b) => {
    const hasReminderA = !!getNutrientReminder(a.id);
    const hasReminderB = !!getNutrientReminder(b.id);

    if (hasReminderA && !hasReminderB) {
      return -1; // a kommt vor b
    }
    if (!hasReminderA && hasReminderB) {
      return 1;  // b kommt vor a
    }
    return 0; // Kein Wechsel, behält die ursprüngliche Reihenfolge bei
  });

  return (
    <ThemedView style={styles.container}>
      <Spacer height={20} />
      <ThemedHeader title={true} style={styles.pageTitle}>Erinnerungen einstellen</ThemedHeader>
      <Spacer height={20} />
      
      {/* Nährstoff-Auswahl */}
      <View style={styles.sectionContainer}>
        <ThemedText style={styles.sectionTitle}>1. Wähle einen Nährstoff:</ThemedText>
        <FlatList
          horizontal
          data={trackedNutrientObjects}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedNutrient(item)}
              style={[
                styles.nutrientPill,
                selectedNutrient && selectedNutrient.id === item.id && styles.selectedNutrientPill,
              ]}
            >
              <Text style={styles.pillText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Uhrzeit-Auswahl */}
      <View style={styles.sectionContainer}>
        <ThemedText style={styles.sectionTitle}>2. Wähle eine Uhrzeit:</ThemedText>
        <TouchableOpacity
          onPress={() => setShowTimePicker(true)}
          style={[
            styles.timePill,
            selectedDate && styles.selectedTimePill,
          ]}
        >
          <Text style={styles.pillText}>{format(selectedDate, 'HH:mm')} <Ionicons name={"time-outline"} size={18} /></Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={selectedDate}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </View>

      {/* Button zum Speichern */}
      <TouchableOpacity onPress={saveReminder} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Erinnerung speichern</Text>
      </TouchableOpacity>
      
      {message ? <ThemedText style={styles.message}>{message}</ThemedText> : null}

      <Spacer/>
  
      
      {/* Anzeige der vorhandenen Erinnerungen */}
      <ThemedText style={styles.title}>Deine Erinnerungen</ThemedText>
      <FlatList
          data={sortedTrackedNutrientObjects}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const reminder = getNutrientReminder(item.id);
            return (
              <View style={styles.reminderItem}>
                <ThemedText style={styles.reminderItemText}>{item.name}</ThemedText>
                {reminder ? (
                  <View style={styles.reminderStatusContainer}>
                    <ThemedText style={styles.reminderItemStatus}>{reminder.reminder_time}</ThemedText>
                    <TouchableOpacity onPress={() => deleteReminder(reminder.id, reminder.notification_id)} style={styles.deleteButton}>
                      <FontAwesome name="trash" size={18} color="red" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <ThemedText style={styles.reminderItemStatus}>  Keine Erinnerung gesetzt</ThemedText>
                )}
              </View>
            );
          }}
        />
    </ThemedView>
  );
};

export default ReminderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionContainer: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 10,
  },
  nutrientPill: {
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  selectedNutrientPill: {
    backgroundColor: Colors.quintery,
  },
  timePill: {
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    alignContent: 'center',
    alignItems: 'center'
  },
  /*selectedTimePill: {
    backgroundColor: Colors.quintery,
  },*/
  pillText: {
    color: '#000',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: Colors.quintery,
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    marginTop: 10,
    color: 'green',
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  reminderItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  reminderStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderItemStatus: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
  }
});
