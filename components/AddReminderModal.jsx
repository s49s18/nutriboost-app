import React, { useState, useContext } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert, FlatList, Button } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from 'date-fns';
import { UserContext } from '../contexts/UserContexts';
import { ColorContext } from '../contexts/ColorContext';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/Colors';
import { scheduleReminder } from "../lib/notifications";
import { supabase } from "../lib/supabaseClient";
import { days } from "../lib/constants";
import ThemedText from "./ThemedText";
import ThemedView from "./ThemedView";
import Spacer from "./Spacer";

const AddReminderModal = ({ visible, onClose, nutrients, onSave }) => {
  const [selectedNutrient, setSelectedNutrient] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [frequency, setFrequency] = useState("daily");
  const [selectedDays, setSelectedDays] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { user } = useContext(UserContext);
  const { colors } = useContext(ColorContext);
  const { themeName } = useTheme();
  const theme = themeName === 'light' ? Colors.light : Colors.dark;

  const handleTimeChange = (event, date) => {
    setShowTimePicker(false);
    if (date) {
        setSelectedDate(date);
    }
  };

  const toggleDay = (dayId) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const handleSave = async () => {
    if (!selectedNutrient) {
      Alert.alert("Fehler", "Bitte einen Nährstoff auswählen.");
      return;
    }

    const notificationIds = await scheduleReminder({
            nutrient: selectedNutrient,
            time: selectedDate,
            frequency,
            days: selectedDays,
          });

    // Reminder in Supabase speichern
    const { data, error } = await supabase.from("reminders").insert([
      {
        user_id: user.id,
        nutrient_id: selectedNutrient.id,
        reminder_time: format(selectedDate, 'HH:mm'), // HH:mm
        notification_ids: JSON.stringify(notificationIds), // JSON-Array
        frequency,
        days_of_week: frequency === 'weekly' ? JSON.stringify(selectedDays) : null,
      },
    ]);

    if (error) {
      Alert.alert("Fehler", error.message);
      return;
    }

    Alert.alert("Erfolg", "Erinnerung gespeichert!");
    if (onSave) {
        onSave();
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <ThemedView style={styles.modal}>
          <ThemedText title={true} style={styles.pageTitle}>
            Neue Erinnerung
          </ThemedText>
            <Spacer height={20}/>

          {/* Picker für Nährstoff */}
          <ThemedText style={styles.header}>Nährstoff auswählen</ThemedText>
          <FlatList
            horizontal
            data={nutrients}
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
           <Spacer height={10}/>
        {/*   <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedNutrient}
              onValueChange={(value) => setSelectedNutrient(value)}
            >
              <Picker.Item label="Bitte auswählen..." value={null} />
              {nutrients.map((n) => (
                <Picker.Item key={n.id} label={n.name} value={n} />
              ))}
            </Picker>
          </View> */}


          {/* Zeit Picker */}
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            style={styles.input}
            >
            <Text>
                {selectedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
                value={selectedDate}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={handleTimeChange}
            />
          )}

          {/* Frequenz */}
          <View style={styles.row}>
            <TouchableOpacity onPress={() => setFrequency("daily")}>
              <Text style={[styles.option, frequency === "daily" && [styles.active, { color: colors.quaternary}]]}>
                Täglich
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFrequency("weekly")}>
              <Text style={[styles.option, frequency === "weekly" && [styles.active, { color: colors.quaternary }]]}>
                Wöchentlich
              </Text>
            </TouchableOpacity>
          </View>

          {/* Wochentage nur wenn weekly */}
          {frequency === "weekly" && (
            <View style={styles.daysRow}>
              {days.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  style={[
                    styles.dayChip,
                    selectedDays.includes(d.id) && { backgroundColor: colors.secondary },
                  ]}
                  onPress={() => toggleDay(d.id)}
                >
                  <Text style={{ color: selectedDays.includes(d.id) ? "#fff" : "#000" }}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Buttons */}
         {/*  <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text>Abbrechen</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
              <Text style={{ color: "#fff" }}>Speichern</Text>
            </TouchableOpacity>
          </View> */}

          <View style={styles.buttonRow}>
            <Button title="Abbrechen" onPress={onClose} color={theme.uiBackground} />
            <Button title="Speichern" onPress={handleSave} color={theme.highlight} />
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
};

export default AddReminderModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    width: "90%",
    borderRadius: 16,
    padding: 20,
  },
  header: {
    fontSize: 16,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  pageTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  input: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginVertical: 10,
  },
  option: {
    fontSize: 16,
    padding: 6,
  },
  active: {
    fontWeight: "bold",
    color: "blue",
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 10,
  },
  dayChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  nutrientPill: { backgroundColor: '#eee', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 15, marginRight: 10 },
  timePill: { backgroundColor: '#eee', borderRadius: 20, paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  pillText: { color: '#000', fontWeight: 'bold' },
  selectedPillText: { color: '#fff' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
});
