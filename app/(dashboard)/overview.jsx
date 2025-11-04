import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Text, Dimensions, Alert,  ScrollView } from 'react-native';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import ThemedHeader from '../../components/ThemedHeader';
import ThemedLineChart from '../../components/ThemedLineChart';
import ThemedLoader from '../../components/ThemedLoader';
import Spacer from '../../components/Spacer';
import { Colors } from '../../constants/Colors';
import { useUser } from '../../hooks/useUser';
import { NutrientsContext } from '../../contexts/NutrientsContext';
import { createClient } from '@supabase/supabase-js';
import { LineChart } from 'react-native-chart-kit';
import { format, subDays, startOfDay } from 'date-fns';
import { supabase } from '../../lib/supabaseClient';
import { differenceInDays, differenceInMonths, subMonths } from 'date-fns';
import { ColorContext } from "../../contexts/ColorContext";
import ThemedAdherenceHeatmap from '../../components/ThemedAdherenceHeatmap';
import InfoBadge from "../../components/InfoBadge";



const screenWidth = Dimensions.get('window').width;

const RANGE_PRESETS = {
  'Wochen':    { weeks: 10,  square: 22, gutter: 4, scrollable: false },
  '3 Monate':  { weeks: 12, square: 18, gutter: 5, scrollable: false },
};

const SupplementOverviewScreen = () => {
  const { user } = useUser();
  const { allNutrients, trackedNutrients } = useContext(NutrientsContext);
  const { colors } = useContext(ColorContext);

  //const trackedNutrientObjects = allNutrients.filter(n => trackedNutrients.includes(n.id));

  const [selectedNutrient, setSelectedNutrient] = useState(null);
  const [intakeData, setIntakeData] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [heatmapValues, setHeatmapValues] = useState(null);
  const [adherenceRate, setAdherenceRate] = useState(null);
 /*  const SQUARE = 18;
  const GUTTER = 3;*/

   const computeStreaks = (list = []) => {
    let cur = 0, best = 0;
    for (const v of list) {
      if (v.count > 0) {
        cur += 1;
        best = Math.max(best, cur);
      } else {
        cur = 0;
      }
    }
    return { current: cur, best };
  };

  // Week-Adherence pro 7 Tage-Block
  const computeWeekAdherence = (list = []) => {
    const blocks = [];
    let buf = [];
    for (let i = list.length - 1; i >= 0; i--) {
      buf.push(list[i].count);
      if (buf.length === 7) {
        blocks.unshift(Math.round((buf.reduce((a,b)=>a+b,0)/7)*100));
        buf = [];
      }
    }
    if (buf.length) {
      const pct = Math.round((buf.reduce((a,b)=>a+b,0)/buf.length)*100);
      blocks.unshift(pct);
    }
    return blocks;
  };

  // Wochentags-Verteilung
  const weekdayHistogram = (list = []) => {
    const out = Array(7).fill(0);
    list.forEach(v => {
      const d = new Date(v.date);
      const wd = d.getDay(); // 0 So ... 6 Sa
      out[wd] += v.count;
    });
    return out; // [So..Sa]
  };

  // Wieviele Wochen passen in die verfügbare Breite (0.9 * Screen)?
  const weeksThatFit = Math.max(
    1,
    Math.floor((screenWidth * 0.75 + GUTTER) / (SQUARE + GUTTER))
  );

  const [timeRange, setTimeRange] = useState('Wochen'); // '7 Tage', '30 Tage', '180 Tage', '365 Tage'
  const preset = RANGE_PRESETS[timeRange] ?? { square: 16, gutter: 3, scrollable: false };
  const SQUARE = preset.square;
  const GUTTER = preset.gutter;

 /*  const getStartDate = () => {
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
  }; */

  const getStartDate = () => {
    const today = new Date();
    try {
      if (timeRange === 'Wochen' || timeRange === '3 Monate') {
        const weeks = preset.weeks ?? 4;
        return subDays(today, weeks * 7 - 1);
      }
      if (timeRange === '6 Monate') return subMonths(today, 6);
      if (timeRange === '1 Jahr') return subMonths(today, 12);
      // Sicherer Fallback:
      return subDays(today, 28);
    } catch (err) {
      console.warn('getStartDate failed', err);
      return new Date(); // verhindert Folgefehler
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

  const endDate = new Date();
  const startDate = getStartDate();
  const numDaysBase = (timeRange === 'Wochen' || timeRange === '3 Monate') && preset.weeks
    ? preset.weeks * 7
    : differenceInDays(endDate, startDate) + 1;
  const numDaysAligned = Math.ceil(numDaysBase / 7) * 7;

  const columns = Math.ceil(numDaysAligned / 7);
  const contentWidth = (columns * (preset.square + preset.gutter)) - preset.gutter;
  const visibleWidth = screenWidth * 0.84;
  const heatmapWidth = RANGE_PRESETS[timeRange]?.scrollable ? contentWidth : visibleWidth;
  const graphHeight = (7 * SQUARE) + (6 * GUTTER) + 80;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
              {/* Headline + Zeitraum + Info */}
              <View style={{ width:"100%", alignItems:"center", marginBottom: 6 }}>
                <ThemedText style={styles.chartTitle}>
                  {selectedNutrient.name} - {timeRange}
                </ThemedText>

                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                  <ThemedText style={{ fontSize: 12 }}>
                    Zeitraum: Letzten {preset.weeks ?? 10} Wochen · {format(startDate, "dd.MM.yyyy")} - {format(endDate, "dd.MM.yyyy")}
                  </ThemedText>

                  <InfoBadge title="Adherence">
                    <ThemedText title style={{ fontSize: 18, marginBottom: 8 }}>Adherence</ThemedText>
                    <ThemedText style={{ textAlign: 'justify', marginBottom: 6 }}>
                      <Text style={{ fontWeight: "600" }}>Adherence</Text> = Anteil der Tage im ausgewählten Zeitraum,
                      an denen du {selectedNutrient.name} mindestens einmal eingenommen hast (0/1 pro Tag).
                    </ThemedText>
                  </InfoBadge>
                </View>

                {adherenceRate !== null && (
                  <ThemedText style={{marginTop: 2 }}>
                    Adherence (gesamt): <Text style={{ fontWeight:"700" }}>{adherenceRate}%</Text>
                  </ThemedText>
                )}
              </View>


                   {/* Heatmap */}
              <ThemedAdherenceHeatmap
                values={heatmapValues}
                numDays={numDaysAligned}
                endDate={endDate}
                squareSize={preset.square}
                gutterSize={preset.gutter}
                width={heatmapWidth}
                height={graphHeight}
              />

                {/* Zusatz-Insights nur im Wochen-View */}
                {timeRange === 'Wochen' && heatmapValues && (
                  <>
                    {/* Streak + Wochen-Scores */}
                    {(() => {
                      const { current, best } = computeStreaks(heatmapValues);
                      const weekScores = computeWeekAdherence(heatmapValues);
                      return (
                        <View style={{ marginTop: 32, marginBottom: 20, width: "100%", alignItems: "center" }}>
                          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15,}}>
                            <View style={{ flexDirection: "column", alignItems: "center" }}>
                              <ThemedText style={{ fontWeight: "700" }}>Streak & Wochen-Score</ThemedText>
                              <ThemedText style={{ marginBottom: 8 }}>
                                Streak: {current} Tage · Beste Streak: {best} Tage ·
                              </ThemedText>
                            </View>
                          <InfoBadge title="Streak & Wochen-Score">
                            <ThemedText title style={{ fontSize: 18, marginBottom: 8 }}>Streak & Wochen-Score</ThemedText>
                            <ThemedText style={{ textAlign: 'justify' }}>
                              <Text style={{ fontWeight: "600" }}>Streak</Text> bedeutet: Wie viele Tage hintereinander du deinen Nährstoff eingenommen hast.
                            </ThemedText>
                            <Spacer height={6}/>
                            <ThemedText style={{ textAlign: 'justify' }}>
                              <Text style={{ fontWeight: "600" }}>Wochen-Score</Text> = Prozentualer Anteil der Tage pro Woche,
                              an denen du den Nährstoff genommen hast - also {( "Tage mit Einnahme ÷ 7 x 100" )}.
                            </ThemedText>
                          </InfoBadge>
                        </View>

                          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8  }}>
                            {weekScores.map((pct, i) => (
                              <View key={`wk-${i}`} style={{ alignItems: 'center' }}>
                                <View
                                  accessible
                                  accessibilityLabel={`Woche ${i + 1}, Score ${pct} Prozent`}
                                  style={{
                                    width: 16,
                                    height: Math.max(6, Math.round((pct/100) * 90)),
                                    backgroundColor: colors.secondary,
                                    borderRadius: 6
                                  }}
                                />
                                <ThemedText style={{ fontSize: 10, marginTop: 4 }}>{pct}%</ThemedText>
                              </View>
                            ))}
                          </View>
                        </View>
                      );
                    })()}

                    {/* Wochentagsmuster */}
                    {(() => {
                      const days = ['So','Mo','Di','Mi','Do','Fr','Sa'];
                      const hist = weekdayHistogram(heatmapValues);
                      const max = Math.max(1, ...hist);
                      return (
                        <View style={{ marginTop: 16, marginBottom: 40,}}>
                           <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15, }}>
                            <ThemedText style={{ fontWeight: "700"}}>Wochentags-Muster</ThemedText>
                            <InfoBadge title="Wochentags-Muster">
                              <ThemedText title style={{ fontSize: 18, marginBottom: 8 }}>Wochentags-Muster</ThemedText>
                              <ThemedText style={{textAlign: 'justify'}}>
                                Zeigt, an welchen Tagen du relativ am häufigsten eingenommen hast.
                              </ThemedText>
                              <ThemedText style={{textAlign: 'justify'}}>
                                Die Balkenhöhe ist im Verhältnis zum häufigsten Tag skaliert.
                              </ThemedText>
                            </InfoBadge>
                          </View>
                          <View style={{ flexDirection: 'row', gap: 15, alignItems: 'flex-end', justifyContent: 'center' }}>
                            {days.map((d, i) => {
                              const h = Math.round((hist[i]/max)*60);
                              return (
                                <View key={d} style={{ alignItems: 'center' }}>
                                  <View
                                    accessible
                                    accessibilityLabel={`${d}: ${hist[i]} Einnahmen, Balkenhöhe relativ`}
                                    style={{
                                      width: 16,
                                      height: h,
                                      backgroundColor: colors.quaternary,
                                      borderRadius: 6
                                    }}
                                  />
                                  <ThemedText style={{ fontSize: 10, marginTop: 4 }}>{d}</ThemedText>
                                </View>
                              );
                            })}
                          </View>
                        </View>
                      );
                    })()}
                  </>
                )}
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
      </ScrollView>
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

