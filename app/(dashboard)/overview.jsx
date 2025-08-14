import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Text, Dimensions, Alert } from 'react-native';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import ThemedHeader from '../../components/ThemedHeader';
import ThemedLineChart from '../../components/ThemedLineChart';
import Spacer from '../../components/Spacer';
import { Colors } from '../../constants/Colors';
import { UserContext } from '../../contexts/UserContexts';
import { NutrientsContext } from '../../contexts/NutrientsContext';
import { createClient } from '@supabase/supabase-js';
import { LineChart } from 'react-native-chart-kit';
import { format, subDays, startOfDay } from 'date-fns';
import { supabase } from '../../lib/supabaseClient';


const screenWidth = Dimensions.get('window').width;

const SupplementOverviewScreen = () => {
  const { user } = useContext(UserContext);
  const { allNutrients, trackedNutrients } = useContext(NutrientsContext);

  const trackedNutrientObjects = allNutrients.filter(n => trackedNutrients.includes(n.id));

  const [selectedNutrient, setSelectedNutrient] = useState(null);
  const [intakeData, setIntakeData] = useState(null);
  const [message, setMessage] = useState('');

  // Funktion zum Abrufen und Formatieren der Einnahmedaten aus Supabase
  const fetchAndFormatIntakeData = async (nutrientId) => {
    if (!user || !nutrientId) return;

    try {
      // Hole die Daten der letzten 7 Tage
      const sevenDaysAgo = subDays(new Date(), 6);
      
      const { data: rawIntakes, error } = await supabase
        .from('user_nutrient_log')
        .select('*')
        .eq('user_id', user.id)
        .eq('nutrient_id', nutrientId)
        .gte('date', format(startOfDay(sevenDaysAgo), 'yyyy-MM-dd')); // Filtern nach den letzten 7 Tagen

      if (error) {
        throw error;
      }

      // Initialisiere die Tageszähler für die letzten 7 Tage
      const dailyIntakes = {};
      const labels = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayLabel = format(date, 'EE'); // z.B. "Mo", "Di"
        labels.push(dayLabel);
        dailyIntakes[dayLabel] = 0;
      }

      // Zähle die Einnahmen pro Tag
      if (rawIntakes) {
        rawIntakes.forEach(intake => {
          const intakeDate = new Date(intake.date);
          const dayLabel = format(intakeDate, 'EE');
          if (dailyIntakes.hasOwnProperty(dayLabel)) {
            dailyIntakes[dayLabel] += 1;
          }
        });
      }

      // Erstelle das Datenformat für das Diagramm
      const data = {
        labels: labels,
        datasets: [
          {
            data: labels.map(label => dailyIntakes[label]),
          },
        ],
      };
      
      setIntakeData(data);
      
    } catch (error) {
      console.error('Fehler beim Abrufen der Einnahmedaten:', error.message);
      setMessage('Fehler beim Laden der Daten.');
    }
  };

  // Effekt, um die Einnahmedaten zu laden, wenn ein Nährstoff ausgewählt wird
  useEffect(() => {
    if (selectedNutrient) {
      fetchAndFormatIntakeData(selectedNutrient.id);
    }
  }, [selectedNutrient]);

  return (
    <ThemedView style={styles.container}>
      <Spacer height={20} />
      <ThemedHeader title={true} style={styles.pageTitle}>Einnahme-Übersicht</ThemedHeader>
      <Spacer height={20} />

      {/* Nährstoff-Auswahl */}
      <View style={styles.sectionContainer}>
        <ThemedText style={styles.sectionTitle}>Wähle einen Nährstoff:</ThemedText>
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

      <Spacer/>

      {/* Diagramm-Anzeige */}
      {intakeData ? (
        <View style={styles.chartContainer}>
          <ThemedText style={styles.chartTitle}>{selectedNutrient.name} Einnahme (letzte 7 Tage)</ThemedText>
          {/*<LineChart
            data={intakeData}
            width={screenWidth * 0.9} // Diagrammbreite
            height={220}
            chartConfig={{
              backgroundColor: Colors.secondary,
              backgroundGradientFrom: Colors.secondary,
              backgroundGradientTo: Colors.secondary,
              decimalPlaces: 0, // Keine Dezimalstellen anzeigen
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: Colors.primary,
              }
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />*/}
          <ThemedLineChart data={intakeData} />
        </View>
      ) : (
        <ThemedText style={styles.message}>Wähle einen Nährstoff, um die Einnahmen anzuzeigen.</ThemedText>
      )}
    </ThemedView>
  );
};

export default SupplementOverviewScreen;

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
    backgroundColor: Colors.quinery,
  },
  pillText: {
    color: '#000',
    fontWeight: 'bold',
  },
  logButton: {
    backgroundColor: Colors.secondary,
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  logButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  message: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  }
});
