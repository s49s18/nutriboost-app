import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import Spacer from '../../components/Spacer';
import { UserContext } from '../../contexts/UserContexts';
import { NutrientsContext } from '../../contexts/NutrientsContext';
import { ColorContext } from '../../contexts/ColorContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../lib/supabaseClient';
import { days } from '../../lib/constants';
import * as Notifications from 'expo-notifications';
import AddReminderModal from '../../components/AddReminderModal';

const ReminderList = () => {
  const { user } = useContext(UserContext);
  const { allNutrients = [] } = useContext(NutrientsContext); // fallback
  const { colors } = useContext(ColorContext);
  const { themeName } = useTheme();
  const theme = Colors[themeName] ?? Colors.light;

  const [reminders, setReminders] = useState([]);
  const [isSetReminderModalVisible, setIsSetReminderModalVisible] = useState(false);

  // Reminder laden
  const fetchReminders = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error("Fehler beim Laden:", error);
    } else {
      setReminders(data || []);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [user]);

  // Reminder löschen
  const deleteReminder = async (reminderId, notificationIdStr) => {
    try {
      if (notificationIdStr) {
        const ids = JSON.parse(notificationIdStr);
        for (const id of ids) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
      }
      await supabase.from("reminders").delete().eq("id", reminderId);
      setReminders((prev) => prev.filter(r => r.id !== reminderId));
    } catch (err) {
      console.error("Fehler beim Löschen:", err);
    }
  };

  // Nutrient Name
  const getNutrientName = (id) =>
    allNutrients.find(n => n.id === id)?.name ?? 'Nährstoff';

  return (
    <ThemedView style={styles.container}>
      <Spacer height={20} />
      <ThemedText title style={styles.pageTitle}>Deine Erinnerungen</ThemedText>
      <Spacer height={20} />

      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.reminderItem}>
            <ThemedText style={styles.reminderItemText}>
              {getNutrientName(item.nutrient_id)}
            </ThemedText>

            <View style={styles.reminderStatusContainer}>
              <ThemedText style={styles.reminderItemStatus}>
                {item.reminder_time}{' '}
                {item.frequency === 'weekly' && item.days_of_week
                  ? `(${JSON.parse(item.days_of_week || "[]")
                      .map(d => days.find(day => day.id === d)?.label)
                      .join(', ')})`
                  : '(täglich)'}
              </ThemedText>

              <TouchableOpacity
                onPress={() => deleteReminder(item.id, item.notification_ids)}
                style={styles.deleteButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} 
              >
                <FontAwesome name="trash" size={19} color={theme.iconColor} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Button für neuen Reminder */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.tertiary }]}
        onPress={() => setIsSetReminderModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Erinnerung hinzufügen</Text>
      </TouchableOpacity>
      {/* Modal */}
      <AddReminderModal
        visible={isSetReminderModalVisible}
        onClose={() => setIsSetReminderModalVisible(false)}
        nutrients={allNutrients}
        onSave={() => {
          try {
            setIsSetReminderModalVisible(false);
            fetchReminders();
          } catch (err) {
            console.error("Unerwarteter Fehler:", err);
          } 
        }}
      />
    </ThemedView>
  );
};

export default ReminderList;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  reminderItemText: { fontSize: 16, fontWeight: '500' },
  reminderStatusContainer: { flexDirection: 'row', alignItems: 'center' },
  reminderItemStatus: { fontSize: 14, marginRight: 10 },
  addButton: {
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center'
  },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
