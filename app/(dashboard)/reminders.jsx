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
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from 'expo-notifications';
import { supabase } from '../../lib/supabaseClient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

const days = [
  { id: 1, label: "Mo" },
  { id: 2, label: "Di" },
  { id: 3, label: "Mi" },
  { id: 4, label: "Do" },
  { id: 5, label: "Fr" },
  { id: 6, label: "Sa" },
  { id: 7, label: "So" },
];

const ReminderScreen = () => {
  const { user } = useContext(UserContext);
  const { allNutrients, trackedNutrients } = useContext(NutrientsContext);

  const trackedNutrientObjects = allNutrients.filter(n => trackedNutrients.includes(n.id));

  const [selectedNutrient, setSelectedNutrient] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [message, setMessage] = useState('');
  const [frequency, setFrequency] = useState("daily");
  const [selectedDays, setSelectedDays] = useState([]);

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

  useEffect(() => {
    fetchReminders();
  }, [user]);

  const saveReminder = async () => {
    if (!selectedNutrient) {
      setMessage('Bitte wähle einen Nährstoff aus.');
      return;
    }

    if (frequency === "weekly" && selectedDays.length === 0) {
      setMessage("Bitte wähle mindestens einen Wochentag aus.");
      return;
    }

    try {
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

      let identifiers = [];

      if (frequency === "daily") {
        const id = await Notifications.scheduleNotificationAsync({
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
        identifiers.push(id);
      } else {
        for (const day of selectedDays) {
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: "Erinnerung",
              body: `Vergiss nicht, ${selectedNutrient.name} zu nehmen!`,
            },
            trigger: {
              weekday: day,
              hour: selectedDate.getHours(),
              minute: selectedDate.getMinutes(),
              repeats: true,
            },
          });
          identifiers.push(id);
        }
      }

      const { error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          nutrient_id: selectedNutrient.id,
          reminder_time: format(selectedDate, 'HH:mm'),
          notification_id: JSON.stringify(identifiers),
          frequency,
          days_of_week: frequency === "weekly" ? JSON.stringify(selectedDays) : null,
        });

      if (error) {
        for (const id of identifiers) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
        throw error;
      }

      fetchReminders();

      setMessage('Erinnerung erfolgreich gespeichert!');
      setSelectedNutrient(null);
      setSelectedDate(new Date());
      setSelectedDays([]);
      setFrequency("daily");
    } catch (error) {
      console.error('Fehler beim Speichern der Erinnerung:', error);
      setMessage('Fehler beim Speichern der Erinnerung.');
    }
  };

  const deleteReminder = async (reminderId, notificationIds) => {
    try {
      if (notificationIds) {
        const ids = JSON.parse(notificationIds);
        for (const id of ids) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
      }

      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;

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

  const sortedTrackedNutrientObjects = [...trackedNutrientObjects].sort((a, b) => {
    const hasReminderA = !!getNutrientReminder(a.id);
    const hasReminderB = !!getNutrientReminder(b.id);
    return hasReminderA === hasReminderB ? 0 : hasReminderA ? -1 : 1;
  });

  const toggleDay = (dayId) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter(d => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={sortedTrackedNutrientObjects}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
            <Spacer height={20} />
            <ThemedText title={true} style={styles.pageTitle}>Erinnerungen einstellen</ThemedText>
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
                    <Text style={[
                      styles.pillText,
                      selectedNutrient && selectedNutrient.id === item.id && styles.selectedPillText
                    ]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* Uhrzeit */}
            <View style={styles.sectionContainer}>
              <ThemedText style={styles.sectionTitle}>2. Wähle eine Uhrzeit:</ThemedText>
              <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.timePill}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.pillText}>{format(selectedDate, 'HH:mm')}</Text>
                  <Ionicons name={"time-outline"} size={18} style={{ marginLeft: 6 }} />
                </View>
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

            {/* Frequenz */}
            <View style={styles.sectionContainer}>
              <ThemedText style={styles.sectionTitle}>3. Häufigkeit:</ThemedText>
              <View style={styles.frequencyContainer}>
                <TouchableOpacity
                  style={[styles.frequencyPill, frequency === "daily" && styles.selectedFrequencyPill]}
                  onPress={() => setFrequency("daily")}
                >
                  <Text style={[
                    styles.pillText,
                    frequency === "daily" && styles.selectedPillText
                  ]}>
                    Täglich
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.frequencyPill, frequency === "weekly" && styles.selectedFrequencyPill]}
                  onPress={() => setFrequency("weekly")}
                >
                  <Text style={[
                    styles.pillText,
                    frequency === "weekly" && styles.selectedPillText
                  ]}>
                    Wöchentlich
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Wochentage */}
            {frequency === "weekly" && (
              <View style={styles.sectionContainer}>
                <ThemedText style={styles.sectionTitle}>4. Wähle Wochentage:</ThemedText>
                <View style={styles.daysContainer}>
                  {days.map(d => (
                    <TouchableOpacity
                      key={d.id}
                      style={[
                        styles.dayPill,
                        selectedDays.includes(d.id) && styles.selectedDayPill,
                      ]}
                      onPress={() => toggleDay(d.id)}
                    >
                      <Text style={[
                        styles.pillText,
                        selectedDays.includes(d.id) && styles.selectedPillText
                      ]}>
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Speichern */}
            <TouchableOpacity onPress={saveReminder} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Erinnerung speichern</Text>
            </TouchableOpacity>

            {message ? <ThemedText style={styles.message}>{message}</ThemedText> : null}

            <Spacer />
            <ThemedText style={styles.title}>Deine Erinnerungen</ThemedText>
          </>
        }
        renderItem={({ item }) => {
          const reminder = getNutrientReminder(item.id);
          return (
            <View style={styles.reminderItem}>
              <ThemedText style={styles.reminderItemText}>{item.name}</ThemedText>
              {reminder ? (
                <View style={styles.reminderStatusContainer}>
                  <ThemedText style={styles.reminderItemStatus}>
                    {reminder.reminder_time} {reminder.frequency === "weekly" && reminder.days_of_week
                      ? `(${JSON.parse(reminder.days_of_week).map(d => days.find(day => day.id === d)?.label).join(", ")})`
                      : "(täglich)"}
                  </ThemedText>
                  <TouchableOpacity onPress={() => deleteReminder(reminder.id, reminder.notification_id)} style={styles.deleteButton}>
                    <FontAwesome name="trash" size={18} color="black" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.reminderStatusContainer}>
                  <ThemedText style={styles.reminderItemStatus}> Keine </ThemedText>
                  <FontAwesome name="clock-o" size={18} color="#999" />
                </View>
              )}
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </ThemedView>
  );
};

export default ReminderScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center' },
  pageTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  sectionContainer: { width: '100%', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 , textAlign: "center"},

  // Nährstoff-Pills
  nutrientPill: { 
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  selectedNutrientPill: { backgroundColor: Colors.secondary },

  // Uhrzeit
  timePill: { 
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: "center",
  },

  pillText: { color: '#000', fontWeight: 'bold' },
  selectedPillText: { color: '#fff' },

  // Frequenz
  frequencyContainer: { flexDirection: "row", justifyContent: "center" },
  frequencyPill: { 
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginHorizontal: 6,
  },
  selectedFrequencyPill: { backgroundColor: Colors.secondary },

  // Wochentage
  daysContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  dayPill: { 
    backgroundColor: '#eee',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  selectedDayPill: { backgroundColor: Colors.secondary },

  // Save-Button
  saveButton: { 
    backgroundColor: Colors.quaternary,
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
    alignSelf: "center",
  },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  message: { marginTop: 10, color: 'green', textAlign: "center" },

  // Erinnerungen
  reminderItem: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  reminderItemText: { fontSize: 16, fontWeight: '500' },
  reminderStatusContainer: { flexDirection: 'row', alignItems: 'center' },
  reminderItemStatus: { fontSize: 14, color: '#666', marginRight: 10 },
  deleteButton: { padding: 5 }
});

