import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Text, Dimensions, Alert } from 'react-native';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import ThemedHeader from '../../components/ThemedHeader';
import ThemedLineChart from '../../components/ThemedLineChart';
import ThemedLoader from '../../components/ThemedLoader';
import Spacer from '../../components/Spacer';
import { Colors } from '../../constants/Colors';
import { UserContext } from '../../contexts/UserContexts';
import { NutrientsContext } from '../../contexts/NutrientsContext';
import { createClient } from '@supabase/supabase-js';
import { LineChart } from 'react-native-chart-kit';
import { format, subDays, startOfDay } from 'date-fns';
import { supabase } from '../../lib/supabaseClient';
import { differenceInDays, differenceInMonths, subMonths } from 'date-fns';
import { ColorContext } from "../../contexts/ColorContext";
import ThemedAdherenceHeatmap from '../../components/ThemedAdherenceHeatmap';



const screenWidth = Dimensions.get('window').width;

const SupplementOverviewScreen = () => {
  const { user } = useContext(UserContext);
  const { allNutrients, trackedNutrients } = useContext(NutrientsContext);
  const { colors } = useContext(ColorContext);

  //const trackedNutrientObjects = allNutrients.filter(n => trackedNutrients.includes(n.id));

  const [selectedNutrient, setSelectedNutrient] = useState(null);
  const [intakeData, setIntakeData] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [heatmapValues, setHeatmapValues] = useState(null);
  const [adherenceRate, setAdherenceRate] = useState(null);
  const SQUARE = 18;
  const GUTTER = 3;

  // Wieviele Wochen passen in die verfügbare Breite (0.9 * Screen)?
  const weeksThatFit = Math.max(
    1,
    Math.floor((screenWidth * 0.75 + GUTTER) / (SQUARE + GUTTER))
  );

  const [timeRange, setTimeRange] = useState('Wochen'); // '7 Tage', '30 Tage', '180 Tage', '365 Tage'

  const getStartDate = () => {
    const today = new Date();
    switch (timeRange) {
      case '3 Monate':
        return subMonths(today, 3);
      case '6 Monate':
        return subMonths(today, 6);
      case '1 Jahr':
        return subMonths(today, 12);
      case 'Wochen':
      default: {
        // so viele Wochen zurück, wie rechts in die Breite passen
        const days = weeksThatFit * 7 - 1;
        return subDays(today, days);
      }
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
      
      // --- Heatmap-Werte (0/1 pro Tag) ---
      const daysDiff = differenceInDays(new Date(), startDate);
      const dayMap = {};

      for (let i = daysDiff; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const key = format(d, 'yyyy-MM-dd');
        dayMap[key] = 0;
      }

      rawIntakes.forEach(intake => {
        const key = format(new Date(intake.date), 'yyyy-MM-dd');
        if (dayMap[key] !== undefined) dayMap[key] = 1; // binär
      });

      const heatVals = Object.entries(dayMap).map(([date, count]) => ({ date, count }));
      setHeatmapValues(heatVals);

      let labels = [];
      let groupedIntakes = {};

      if (timeRange === 'Wochen' || timeRange === '3 Monate') {
        // Adherence-Rate (Tage mit Einnahme / Gesamt-Tage)
        const takenDays = Object.values(dayMap).reduce((a, b) => a + b , 0);
        const totalDays = Object.values(dayMap).length;
        setAdherenceRate(totalDays ? Math.round((takenDays / totalDays) * 100) : 0);

      } else {
        // Gruppierung nach Monaten
        const monthsDiff = differenceInMonths(new Date(), startDate);

        let internalLabels = [];
        for (let i = monthsDiff; i >= 0; i--) {
          const date = subMonths(new Date(), i);
          const key = format(date, 'MMM yy');
          internalLabels.push(key);
          groupedIntakes[key] = 0;
        }

        rawIntakes.forEach(intake => {
          const key = format(new Date(intake.date), 'MMM yy');
          if (groupedIntakes[key] !== undefined) groupedIntakes[key] += 1;
        });

        // X-Achsen-Labels -> nur erstes/letztes mit Jahr, damit die Achse nicht überfüllt wird
        labels = internalLabels.map((key, idx) => {
          if (idx === 0 || idx === internalLabels.length - 1) {
            return key; // "MMM yy"
          }
          return key.split(' ')[0]; // nur "MMM"
        });
      }

      const data = {
        labels,
        datasets: [
          { data: Object.values(groupedIntakes) }
        ],
      };

      setIntakeData(data);

    } catch (error) {
      console.error('Fehler beim Abrufen der Einnahmedaten:', error.message);
      setMessage('Fehler beim Laden der Daten.');
    }
  };


  useEffect(() => {
    let isActive = true;

    if (selectedNutrient) {
      const fetchData = async () => {
        setIntakeData(null);
        setHeatmapValues(null);
        setAdherenceRate(null);
        setIsLoading(true);

        try {
          await fetchAndFormatIntakeData(selectedNutrient.id);
        } catch (err) {
          if (isActive) console.error('Fehler beim Laden der Daten:', err);
        } finally {
          if (isActive) setIsLoading(false);
        }
      };

      fetchData();
    }

    return () => {
      isActive = false; // Cleanup → verhindert setState auf unmounted component
    };
  }, [selectedNutrient, timeRange]);

  

  return (
    <ThemedView style={styles.container}>
      <Spacer height={20} />
      <ThemedText title={true} style={styles.pageTitle}>Einnahme-Übersicht</ThemedText>
      <Spacer height={20} />

      {/* Nährstoff-Auswahl */}
      <View style={styles.sectionContainer}>
        <ThemedText style={styles.sectionTitle}>Wähle einen Nährstoff:</ThemedText>
        <FlatList
          horizontal
          data={allNutrients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedNutrient(item)}
              style={[
                styles.nutrientPill,
                selectedNutrient && selectedNutrient.id === item.id && { backgroundColor: colors.secondary },
              ]}
            >
              <Text style={[
                styles.pillText,
                selectedNutrient && selectedNutrient.id === item.id && styles.selectedPillText,
              ]}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Zeitraum-Buttons */}
      <View style={styles.rangeButtonContainer}>
         {['Wochen','3 Monate','6 Monate','1 Jahr'].map(range => (
          <TouchableOpacity
            key={range}
            style={[
              styles.rangeButton,
              timeRange === range && {backgroundColor: colors.quaternary}
            ]}
            onPress={() => setTimeRange(range)}
          >
            <Text style={[
              styles.rangeButtonText,
              timeRange === range && styles.selectedRangeButtonText
            ]}>
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Spacer/>

     {/* Diagramm-Anzeige */}
     {isLoading ? (
      <ThemedLoader />
      ) : selectedNutrient ? (
        <>
          {(timeRange === 'Wochen' || timeRange === '3 Monate') && heatmapValues ? (
            <View style={styles.chartContainer}>
              <ThemedText style={styles.chartTitle}>
                {selectedNutrient.name} - {timeRange} (Adherence{adherenceRate !== null ? `: ${adherenceRate}%` : ''})
              </ThemedText>

              {/** numDays-Berechnung **/}
              {(() => {
                const endDate = new Date();
                const startDate = getStartDate();
                const numDays =
                  timeRange === 'Wochen'
                    ? weeksThatFit * 7
                    : differenceInDays(endDate, startDate) + 1; // ≈ 3 Monate

                // Optional: falls du sicherstellen willst, dass volle Wochen dargestellt werden:
                const numDaysAligned = Math.ceil(numDays / 7) * 7;

                return (
                  <ThemedAdherenceHeatmap
                    values={heatmapValues}
                    numDays={numDaysAligned}
                    endDate={endDate}
                    squareSize={SQUARE}
                    gutterSize={GUTTER}
                    // width bleibt bei 0.9 * screenWidth; wenn du exakt pixelgenau willst:
                    // width={(Math.ceil(numDaysAligned/7) * (SQUARE + GUTTER)) - GUTTER}
                  />
                );
              })()}
            </View>
          ) : intakeData ? (
            <View style={styles.chartContainer}>
              <ThemedText style={styles.chartTitle}>
                {selectedNutrient.name} Einnahme ({timeRange})
              </ThemedText>
              <ThemedLineChart data={intakeData} />
            </View>
          ) : (
            <ThemedText style={styles.message}>
              Keine Daten im gewählten Zeitraum.
            </ThemedText>
          )}
        </>
      ) : (
        <ThemedText style={styles.message}>
          Wähle einen Nährstoff, um die Einnahmen anzuzeigen.
        </ThemedText>
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
  selectedPillText: {
    color: '#fff',
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
  rangeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedRangeButtonText: {
    color: '#fff',
  },
});

