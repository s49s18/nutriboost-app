import React, { useState, useContext } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert, FlatList, Button } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from 'date-fns';
import { useUser } from '../hooks/useUser';
import { ColorContext } from '../contexts/ColorContext';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/Colors';
import { scheduleReminder } from "../lib/notifications";
import { supabase } from "../lib/supabaseClient";
import { days } from "../lib/constants";
import ThemedText from "./ThemedText";
import ThemedView from "./ThemedView";
import Spacer from "./Spacer";
import { MaterialIcons } from '@expo/vector-icons';

const InfoIcon = ({ onPress, color }) => (
    <TouchableOpacity onPress={onPress} style={{ paddingHorizontal: 10, paddingVertical: 5 }}>
        {/* Verwendung des 'info'-Icons von MaterialIcons */}
        <MaterialIcons name="info" size={24} color={color} style={{fontWeight: 'bold'}} />
    </TouchableOpacity>
);


const InfoModal = ({ visible, onClose, title, content }) => {
    const { colors } = useContext(ColorContext);
    const theme = colors;

    const safeTitle = String(title ?? "");
    const safeContent = String(content ?? "");

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.infoOverlay}>
                <ThemedView style={[styles.infoModal]}>
                    <Text style={[styles.infoTitle, { color: theme.secondary }]}>
                        {safeTitle}
                    </Text>
                    <Spacer height={10} />
                    <ThemedText style={styles.infoContent}>
                        {safeContent}
                    </ThemedText>
                    <Spacer height={20} />
                    <Button title="Schließen" onPress={onClose} color={theme.secondary} />
                </ThemedView>
            </View>
        </Modal>
    );
};


const AddReminderModal = ({ visible, onClose, nutrients, onSave }) => {
    const [selectedNutrient, setSelectedNutrient] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [frequency, setFrequency] = useState("daily");
    const [selectedDays, setSelectedDays] = useState([]);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false); // State für Info-Modal
    
    const { user } = useUser();
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
    
    const getRecommendationsContent = () => {
      if (!selectedNutrient || !selectedNutrient.recommendations) {
        return "Wählen Sie zuerst einen Nährstoff aus, um die Einnahme-Empfehlung anzuzeigen.";
      }
      return String(selectedNutrient.recommendations);
    };
    
    // Funktion zum Öffnen des Info-Modals
    const handleOpenInfoModal = () => {
        if (selectedNutrient && selectedNutrient.recommendations) {
            setShowInfoModal(true);
        } else {
             Alert.alert("Hinweis", "Bitte wählen Sie zuerst einen Nährstoff aus, um die Einnahme-Empfehlung zu sehen.");
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <ThemedView style={styles.modal}>
                    <ThemedText title={true} style={styles.pageTitle}>
                        Neue Erinnerung
                    </ThemedText>
                    <Spacer height={20}/>

                    {/* Picker für Nährstoff mit Icon */}
                    <View style={styles.headerRow}> {/* View für Header und Icon */}
                        <ThemedText style={styles.header}>Nährstoff auswählen</ThemedText>
                        <InfoIcon 
                            onPress={handleOpenInfoModal} 
                            // Icon-Farbe abhängig von Auswahl und Verfügbarkeit der Empfehlung
                            color={(selectedNutrient && selectedNutrient.recommendations) ? colors.secondary : theme.iconColor} 
                        />
                    </View>
                    
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
                    
                    {/* Beschriftung für den Zeit-Picker */}
                    <ThemedText style={styles.header}>Uhrzeit einstellen</ThemedText>

                    {/* Zeit Picker */}
                    <TouchableOpacity
                        onPress={() => setShowTimePicker(true)}
                        style={[styles.input, {borderColor: theme.iconColor}]}
                        >
                        <ThemedText>
                            {selectedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </ThemedText>
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
                    
                    <ThemedText style={styles.header}>Wiederholung</ThemedText>

                    {/* Frequenz */}
                    <View style={styles.row}>
                        <TouchableOpacity onPress={() => setFrequency("daily")}>
                            <ThemedText style={[styles.option, frequency === "daily" && [styles.active, { color: colors.quaternary}]]}>
                                Täglich
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setFrequency("weekly")}>
                            <ThemedText style={[styles.option, frequency === "weekly" && [styles.active, { color: colors.quaternary }]]}>
                                Wöchentlich
                            </ThemedText>
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
                                        {borderColor: theme.uiBackground}
                                    ]}
                                    onPress={() => toggleDay(d.id)}
                                >
                                    <Text style={{ color: selectedDays.includes(d.id) ? theme.bwturned : theme.bwturned }}>
                                        {d.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        <Button title="Abbrechen" onPress={onClose} color={theme.buttonColor} />
                        <Button title="Speichern" onPress={handleSave} color={colors.quaternary} />
                    </View>
                </ThemedView>
            </View>
            
            {/* Info Modal für Einnahme-Empfehlungen */}
            <InfoModal
              visible={showInfoModal}
              onClose={() => setShowInfoModal(false)}
              title={`Einnahme-Empfehlung für ${selectedNutrient?.name ?? "…"}`}
              content={getRecommendationsContent()}
            />
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
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    infoOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.7)",
    },
    infoModal: {
        width: "80%",
        borderRadius: 16,
        padding: 20,
        elevation: 10,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    infoContent: {
        fontSize: 14,
        textAlign: 'justify',
        lineHeight: 22,

    }
});
