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
import { differenceInDays, differenceInMonths, subMonths } from 'date-fns';


const screenWidth = Dimensions.get('window').width;

const SupplementOverviewScreen = () => {
  const { user } = useContext(UserContext);
  const { allNutrients, trackedNutrients } = useContext(NutrientsContext);

  const trackedNutrientObjects = allNutrients.filter(n => trackedNutrients.includes(n.id));

  const [selectedNutrient, setSelectedNutrient] = useState(null);
  const [intakeData, setIntakeData] = useState(null);
  const [message, setMessage] = useState('');
  const [timeRange, setTimeRange] = useState('7 Tage'); // '7 Tage', '30 Tage', '180 Tage', '365 Tage'

  const getStartDate = () => {
    const today = new Date();
    switch (timeRange) {
      case '30 Tage':
        return subDays(today, 29);
      case '6 Monate':
        return subDays(today, 179);
      case '1 Jahr':
        return subDays(today, 364);
      default:
        return subDays(today, 6);
    }
  };

  const fetchAndFormatIntakeData = async (nutrientId) => {
    if (!user || !nutrientId) return;

    try {
      const startDate = getStartDate();

      const { data: rawIntakes, error } = await supabase
        .from('user_nutrient_log')
        .select('*')
        .eq('user_id', user.id)
        .eq('nutrient_id', nutrientId)
        .gte('date', format(startOfDay(startDate), 'yyyy-MM-dd'));

      if (error) throw error;

      let labels = [];
      let dailyIntakes = {};

      if (timeRange === '7 Tage' || timeRange === '30 Tage') {
        // Gruppierung nach Tagen
        for (let i = differenceInDays(new Date(), startDate); i >= 0; i--) {
          const date = subDays(new Date(), i);
          const label = format(date, timeRange === '7 Tage' ? 'EE' : 'dd.MM');
          labels.push(label);
          dailyIntakes[label] = 0;
        }
        rawIntakes.forEach(intake => {
          const label = format(new Date(intake.date), timeRange === '7 Tage' ? 'EE' : 'dd.MM');
          if (dailyIntakes[label] !== undefined) dailyIntakes[label] += 1;
        });
      } else {
        // Gruppierung nach Monaten
        const monthsDiff = differenceInMonths(new Date(), startDate);
        for (let i = monthsDiff; i >= 0; i--) {
          const date = subMonths(new Date(), i);
          const isFirst = i === monthsDiff;
          const isLast = i === 0;
                 
          let label;
          if (isFirst || isLast) {
            // Anzeigen des Monats und des Jahres
            label = format(date, 'MMM yy');
          } else {
            // Nur Monatskürzel anzeigen
            label = format(date, 'MMM');
          }
          labels.push(label);
          dailyIntakes[label] = 0;
        }
        rawIntakes.forEach(intake => {
          const label = format(new Date(intake.date), 'MMM yy');
          if (dailyIntakes[label] !== undefined) dailyIntakes[label] += 1;
        });
      }

      const data = {
        labels,
        datasets: [
          { data: labels.map(label => dailyIntakes[label]) }
        ],
      };

      setIntakeData(data);

    } catch (error) {
      console.error('Fehler beim Abrufen der Einnahmedaten:', error.message);
      setMessage('Fehler beim Laden der Daten.');
    }
  };

  useEffect(() => {
    if (selectedNutrient) {
      fetchAndFormatIntakeData(selectedNutrient.id);
    }
  }, [selectedNutrient, timeRange]);

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

      {/* Zeitraum-Buttons */}
      <View style={styles.rangeButtonContainer}>
        {['7 Tage', '30 Tage', '6 Monate', '1 Jahr'].map(range => (
          <TouchableOpacity
            key={range}
            style={[
              styles.rangeButton,
              timeRange === range && styles.selectedRangeButton
            ]}
            onPress={() => setTimeRange(range)}
          >
            <Text style={[
              styles.rangeButtonText,
              timeRange === range && styles.selectedRangeButtonText
            ]}>
              {range === '7 Tage' ? '7 Tage' :
               range === '30 Tage' ? '30 Tage' :
               range === '6 Monate' ? '6 Monate' : '1 Jahr'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Spacer/>

      {/* Diagramm-Anzeige */}
      {intakeData ? (
        <View style={styles.chartContainer}>
          <ThemedText style={styles.chartTitle}>
            {selectedNutrient.name} Einnahme ({timeRange})
          </ThemedText>
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
  },
  rangeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  rangeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 5,
    borderRadius: 15,
    backgroundColor: '#eee',
  },
  selectedRangeButton: {
    backgroundColor: Colors.primary,
  },
  rangeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedRangeButtonText: {
    color: '#fff',
  },
});

