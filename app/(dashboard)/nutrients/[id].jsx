import { StyleSheet, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../lib/supabaseClient';

import ThemedText from "../../../components/ThemedText";
import ThemedView from "../../../components/ThemedView";
import Spacer from "../../../components/Spacer";
import { Colors } from '../../../constants/Colors';

const NutrientDetail = () => {
    // Holt die dynamische ID aus der URL
    const { id } = useLocalSearchParams();
    const [nutrient, setNutrient] = useState(null);
    const [loading, setLoading] = useState(true);

    // Lade die Daten für den spezifischen Nährstoff
    useEffect(() => {
        async function fetchNutrient() {
            if (!id) return;
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('nutrients')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    console.error('Fehler beim Laden der Nährstoffdetails:', error);
                    setNutrient(null);
                } else {
                    setNutrient(data);
                }
            } catch (error) {
                console.error('Ein unerwarteter Fehler ist aufgetreten:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchNutrient();
    }, [id]); // Führe dies aus, wenn sich die ID ändert

    if (loading) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>Lade Details...</ThemedText>
            </ThemedView>
        );
    }

    if (!nutrient) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>Nährstoff nicht gefunden.</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ThemedText title={true} style={styles.nutrientTitle}>{nutrient.name}</ThemedText>
            <Spacer height={20} />

            <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Min. tägl. Bedarf:</ThemedText>
                <ThemedText style={styles.infoValue}>{nutrient.min_daily}</ThemedText>
            </View>
            <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Max. tägl. Bedarf:</ThemedText>
                <ThemedText style={styles.infoValue}>{nutrient.max_daily}</ThemedText>
            </View>
            <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Einheit:</ThemedText>
                <ThemedText style={styles.infoValue}>{nutrient.unit}</ThemedText>
            </View>
            <Spacer height={20} />
            <ThemedText style={styles.description}>{nutrient.description}</ThemedText>
        </ThemedView>
    );
};

export default NutrientDetail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    nutrientTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        color: Colors.primary,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.iconColor,
    },
    infoLabel: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    infoValue: {
        fontSize: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
    },
});
