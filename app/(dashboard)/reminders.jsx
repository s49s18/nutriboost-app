import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Text, Platform } from 'react-native';
import { format } from 'date-fns';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';

import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import Spacer from '../../components/Spacer';
import { UserContext } from '../../contexts/UserContexts';
import { NutrientsContext } from '../../contexts/NutrientsContext';
import { ColorContext } from '../../contexts/ColorContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../lib/supabaseClient';
import { scheduleReminder, requestNotificationPermission } from '../../lib/notifications';

const days = [
  { id: 2, label: "Mo" },
  { id: 3, label: "Di" },
  { id: 4, label: "Mi" },
  { id: 5, label: "Do" },
  { id: 6, label: "Fr" },
  { id: 7, label: "Sa" },
  { id: 1, label: "So" },
];

const ReminderScreen = () => {
  const { user } = useContext(UserContext);
  const { allNutrients, trackedNutrients } = useContext(NutrientsContext);
  const { colors } = useContext(ColorContext);
  const { themeName } = useTheme();
  const theme = Colors[themeName] ?? Colors.light;

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

    if (!error) setReminders(data);
  };

  useEffect(() => { fetchReminders(); }, [user]);

  const saveReminder = async () => {
    // Berechtigung prüfen oder anfordern
    let allowed = await requestNotificationPermission();
    if (!allowed) {
      setMessage('Benachrichtigungen sind nicht erlaubt.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (!selectedNutrient) {
      setMessage('Bitte wähle einen Nährstoff aus.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (frequency === "weekly" && selectedDays.length === 0) {
      setMessage("Bitte wähle mindestens einen Wochentag aus.");
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      // Vorhandene Reminder für diesen Nährstoff prüfen
      if (reminders.some(r => r.nutrient_id === selectedNutrient.id)) {
        setMessage('Für diesen Nährstoff ist bereits eine Erinnerung gesetzt.');
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      // Notifications planen
      const notificationIds = await scheduleReminder({
        nutrient: selectedNutrient,
        time: selectedDate,
        frequency,
        days: selectedDays,
      });

      // Reminder in Supabase speichern
      const { error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          nutrient_id: selectedNutrient.id,
          reminder_time: format(selectedDate, 'HH:mm'),
          notification_ids: JSON.stringify(notificationIds),
          frequency,
          days_of_week: frequency === 'weekly' ? JSON.stringify(selectedDays) : null
        });

      if (!error) {
        fetchReminders();
        setMessage('Erinnerung erfolgreich gespeichert!');
        setTimeout(() => setMessage(''), 3000);

        // Form zurücksetzen
        setSelectedNutrient(null);
        setSelectedDate(new Date());
        setSelectedDays([]);
        setFrequency("daily");
      }

    } catch (err) {
      console.error(err);
      setMessage('Fehler beim Speichern der Erinnerung.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const deleteReminder = async (reminderId, notificationIdStr) => {
    try {
      if (notificationIdStr) {
        const ids = JSON.parse(notificationIdStr);
        for (const id of ids) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
      }
      await supabase.from("reminders").delete().eq("id", reminderId);
      fetchReminders();
      setMessage("Erinnerung erfolgreich gelöscht!");
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Fehler beim Löschen der Erinnerung.");
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleTimeChange = (event, selected) => {
    setShowTimePicker(Platform.OS === 'ios');
    const newTime = selected || selectedDate;
    setSelectedDate(newTime);
  };

  const getNutrientReminder = (nutrientId) => reminders.find(r => r.nutrient_id === nutrientId);

  const sortedTrackedNutrientObjects = [...trackedNutrientObjects].sort((a, b) => {
    const hasA = !!getNutrientReminder(a.id);
    const hasB = !!getNutrientReminder(b.id);
    return hasA === hasB ? 0 : hasA ? -1 : 1;
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
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={
          <>
            <Spacer height={20}/>
            <ThemedText title style={styles.pageTitle}>Erinnerungen einstellen</ThemedText>
            <Spacer height={20}/>

            {/* Nährstoffauswahl */}
            <View style={styles.sectionContainer}>
              <ThemedText style={styles.sectionTitle}>1. Wähle einen Nährstoff:</ThemedText>
              <FlatList
                horizontal
                data={trackedNutrientObjects}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setSelectedNutrient(item)}
                    style={[
                      styles.nutrientPill,
                      selectedNutrient?.id === item.id && { backgroundColor: colors.secondary }
                    ]}
                  >
                    <Text style={[
                      styles.pillText,
                      selectedNutrient?.id === item.id && styles.selectedPillText
                    ]}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* Uhrzeit */}
            <View style={styles.sectionContainer}>
              <ThemedText style={styles.sectionTitle}>2. Wähle eine Uhrzeit:</ThemedText>
              <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.timePill}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.pillText}>{format(selectedDate, 'HH:mm')}</Text>
                  <Ionicons name="time-outline" size={18} style={{ marginLeft: 6 }} />
                </View>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="time"
                  is24Hour
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
                  style={[styles.frequencyPill, frequency === 'daily' && { backgroundColor: colors.secondary }]}
                  onPress={() => setFrequency('daily')}
                >
                  <Text style={[styles.pillText, frequency === 'daily' && styles.selectedPillText]}>Täglich</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.frequencyPill, frequency === 'weekly' && { backgroundColor: colors.secondary }]}
                  onPress={() => setFrequency('weekly')}
                >
                  <Text style={[styles.pillText, frequency === 'weekly' && styles.selectedPillText]}>Wöchentlich</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Wochentage */}
            {frequency === 'weekly' && (
              <View style={styles.sectionContainer}>
                <ThemedText style={styles.sectionTitle}>4. Wähle Wochentage:</ThemedText>
                <View style={styles.daysContainer}>
                  {days.map(d => (
                    <TouchableOpacity
                      key={d.id}
                      style={[
                        styles.dayPill,
                        selectedDays.includes(d.id) && { backgroundColor: colors.secondary }
                      ]}
                      onPress={() => toggleDay(d.id)}
                    >
                      <Text style={[
                        styles.pillText,
                        selectedDays.includes(d.id) && styles.selectedPillText
                      ]}>{d.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Speichern */}
            <TouchableOpacity
              onPress={saveReminder}
              style={[styles.saveButton, { backgroundColor: colors.quaternary }]}
            >
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
                    {reminder.reminder_time}{' '}
                    {reminder.frequency === 'weekly' && reminder.days_of_week
                      ? `(${JSON.parse(reminder.days_of_week)
                          .map(d => days.find(day => day.id === d)?.label)
                          .join(', ')})`
                      : '(täglich)'}
                  </ThemedText>
                  <TouchableOpacity
                    onPress={() => deleteReminder(reminder.id, reminder.notification_ids)}
                    style={styles.deleteButton}
                  >
                    <FontAwesome name="trash" size={18} color={theme.iconColor} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.reminderStatusContainer}>
                  <ThemedText style={styles.reminderItemStatus}>Keine</ThemedText>
                  <FontAwesome name="clock-o" size={18} color={theme.iconColor} />
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
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, textAlign: 'center' },
  nutrientPill: { backgroundColor: '#eee', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 15, marginRight: 10 },
  timePill: { backgroundColor: '#eee', borderRadius: 20, paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  pillText: { color: '#000', fontWeight: 'bold' },
  selectedPillText: { color: '#fff' },
  frequencyContainer: { flexDirection: 'row', justifyContent: 'center' },
  frequencyPill: { backgroundColor: '#eee', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 15, marginHorizontal: 6 },
  daysContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  dayPill: { backgroundColor: '#eee', borderRadius: 15, paddingVertical: 6, paddingHorizontal: 12, margin: 4 },
  saveButton: { padding: 15, borderRadius: 10, marginTop: 20, width: '80%', alignItems: 'center', alignSelf: 'center' },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  message: { marginTop: 10, color: 'green', textAlign: 'center' },
  reminderItem: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  reminderItemText: { fontSize: 16, fontWeight: '500' },
  reminderStatusContainer: { flexDirection: 'row', alignItems: 'center' },
  reminderItemStatus: { fontSize: 14, color: '#666', marginRight: 10 },
  deleteButton: { padding: 5 }
});
