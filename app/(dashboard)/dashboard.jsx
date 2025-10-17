import React, { useRef, useState, useContext, useEffect  } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Text} from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import ThemedCard from '../../components/ThemedCard';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { UserContext } from '../../contexts/UserContexts';
import ThemedLoader from '../../components/ThemedLoader';
import { NutrientsContext } from '../../contexts/NutrientsContext';
import Spacer from '../../components/Spacer';
import * as Notifications from 'expo-notifications';
import AppHeader from '../../components/AppHeader';
import ConfettiCannon from 'react-native-confetti-cannon';
import { ColorContext } from '../../contexts/ColorContext';
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from "date-fns";
import { useTheme } from '../../contexts/ThemeContext';
import { Link } from 'expo-router';
import { scheduleMilestoneNotification } from '../../lib/notifications'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const StartScreen = () => {
  const { user } = useContext(UserContext);
  const { allNutrients, trackedNutrients, takenToday, toggleTaken, loadWeekStreak, loadCurrentStreak } = useContext(NutrientsContext);
  const [weekStreak, setWeekStreak] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const trackedNutrientObjects = allNutrients.filter(n => trackedNutrients.includes(n.id));
  const allTaken = trackedNutrients.length > 0 && trackedNutrients.every(id => takenToday[id]);
  const prevAllTaken = useRef(false); 
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [funFact, setFunFact] = useState('');
  const { colors } = useContext(ColorContext);
  const { themeName } = useTheme();
  const theme = Colors[themeName] ?? Colors.light;
  const [showResetSnackbar, setShowResetSnackbar] = useState(false);
  const prevStreak = useRef(currentStreak);

  // Damit beim ersten Laden keine unerwünschten Effekte ausgelöst werden
  useEffect(() => {
    prevAllTaken.current = allTaken;
    prevStreak.current = currentStreak;
  }, []);

  // Effekt, um einen zufälligen Fun-Fact zu laden, wenn die Komponente geladen wird
  useEffect(() => {
    const fetchRandomFact = async () => {
     try {
      // Alle Fakten abrufen
      const { data, error } = await supabase
       .from('fun_facts')
       .select('fact_text');

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Einen zufälligen Fakt aus dem Array auswählen
        const randomIndex = Math.floor(Math.random() * data.length);
        setFunFact(data[randomIndex].fact_text);
      }
     } catch (error) {
       console.error('Fehler beim Abrufen des Fun-Facts:', error);
     }
    };

   fetchRandomFact();
  }, []);



  useEffect(() => {
    const checkMilestoneNotification = async () => {
      const milestones = [5, 10, 15, 20, 30, 50];
      
      try {
        // Wenn Streak verloren geht, gespeicherte Meilensteine zurücksetzen
        if (currentStreak === 0 && prevStreak.current > 0) {
          await AsyncStorage.removeItem('celebratedMilestones');
          console.log('Streak zurückgesetzt — Meilensteine gelöscht');

          setShowResetSnackbar(true);
          setTimeout(() => setShowResetSnackbar(false), 3000);
          return;
        }
         // Wenn der aktuelle Streak ein Meilenstein ist
        if (milestones.includes(currentStreak)) {
          const stored = await AsyncStorage.getItem('celebratedMilestones');
          const celebrated = stored ? JSON.parse(stored) : [];

          if (!celebrated.includes(currentStreak)) {
            await scheduleMilestoneNotification(currentStreak);

            await AsyncStorage.setItem(
              'celebratedMilestones',
              JSON.stringify([...celebrated, currentStreak])
            );
          }
        }
      } catch (error) {
        console.error('Fehler beim Handhaben der Meilenstein-Benachrichtigungen:', error);
      }
       prevStreak.current = currentStreak;
    };

    checkMilestoneNotification();
  }, [currentStreak]);

  useEffect(() => {
    const checkConfetti = async () => {
      if (allTaken && !prevAllTaken.current) {
        try {
          const today = format(new Date(), 'yyyy-MM-dd');
          const lastCelebrated = await AsyncStorage.getItem('lastConfettiDate');

          if (lastCelebrated !== today) {
            // 🎉 Nur beim ersten Mal pro Tag
            setShowConfetti(true);
            await AsyncStorage.setItem('lastConfettiDate', today);

            setTimeout(() => setShowConfetti(false), 3000);
          }
        } catch (error) {
          console.error('Fehler beim Prüfen der Confetti-Daten:', error);
        }
      }

      prevAllTaken.current = allTaken;
    };

    checkConfetti();
  }, [allTaken]);


  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const streak = await loadWeekStreak();
        setWeekStreak(Array.isArray(streak) ? streak : []);

        const totalStreak = await loadCurrentStreak();
        setCurrentStreak(Number.isFinite(totalStreak) ? totalStreak : 0);
      } catch (e) {
        console.error("Fehler beim Laden der Streaks:", e);
        setCurrentStreak(0);
        setWeekStreak([]);
      }
    };
    fetchStreak();
  }, []);



  const handleToggle = async (userId, nutrientId) => {
    await toggleTaken(userId, nutrientId);
    const streak = await loadWeekStreak();
    setWeekStreak(streak);
    const totalStreak = await loadCurrentStreak();
    setCurrentStreak(totalStreak);
  };


  return (
    <ThemedView style={[styles.container, {flex: 1, justifyContent: 'space-between' }]}>
       <AppHeader />
       {showResetSnackbar && (
        <View style={styles.snackbar}>
          <Text style={styles.snackbarText}>😢 Deine Streak wurde zurückgesetzt!</Text>
        </View>
      )}
      <Spacer width={20}/>
        <ThemedView style={styles.card}>
         {/* Kopfzeile */}
        <Text style={styles.date}>
          {format(new Date(), 'dd.MM.yyyy')}
        </Text>
        <Text style={styles.title}>
          Deine Nährstoffe heute
        </Text>
      </ThemedView>

      <View style={{flexDirection: "row", alignItems: "flex-start", marginBottom: 25}}>
      {/* Liste */}
      {trackedNutrientObjects.length > 0 ? (
      <FlatList
        data={trackedNutrientObjects}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.itemRow} 
            onPress={() => handleToggle(user.id, item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} 
          >
            <FontAwesome
              name={takenToday[item.id] ? 'check-square' : 'square-o'}
              size={28}
              color={takenToday[item.id] ? colors.secondary : theme.iconColor}
              style={{ marginHorizontal: 15 }} 
            />
            <ThemedText style={styles.itemText}>
              {item.name}
            </ThemedText>
          </TouchableOpacity>
        )}
        style={{maxHeight: 220}}
      />) : (
           <View style={styles.emptyStateContainer}>
            <Text style={[styles.emptyStateText, {color: theme.text}]}>
              Du hast noch keine Nährstoffe ausgewählt. Wähle jetzt deine Nährstoffe aus, um dein Dashboard zu personalisieren:
            </Text>
            <Link href="/nutrients" style={[styles.emptyStateLink, {backgroundColor: colors.secondary }]}>
              <Text style={[styles.emptyStateLinkText, { color: '#fff' }]}>
                Nährstoffe auswählen
              </Text>
            </Link>
          </View>
      )}

       {/* Streak rechts daneben */}
      <View style={{
        width: 150,
        alignItems: "center",
        justifyContent: "center",
        padding: 8,
        backgroundColor: colors.card,
        borderRadius: 16,
      }}>
        <FontAwesome name="fire" size={28} color="orange" />
        <ThemedText style={{ fontSize: 16, marginTop: 4 }}>
          {currentStreak}🔥
        </ThemedText>
        <ThemedText style={{ fontSize: 12, color: "gray" }}>
          Tage in Folge
        </ThemedText>

          {/* --- "Alle genommen" Box darunter --- */}
        {allTaken && (
          <View
            style={{
              alignItems: "center",
              width: "100%",
            }}
          >
            <TouchableOpacity
            onPress={() => {
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 4000);
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.successBox, { backgroundColor: theme.iconColor }]}>
              <Text style={[styles.successText, { color: theme.bw }]}>
                Alle genommen 🎉
              </Text>
            </View>
          </TouchableOpacity>
          </View>
        )}
      </View>
    </View>

      {/* Button "Alle genommen" */}
     {/*  {allTaken && (
        <ThemedView style={{ alignItems: 'center', marginBottom: 20 }}>
          <View style={[styles.successBox, {backgroundColor: colors.tertiary}]}>
            <Text style={styles.successText}>
              Alle genommen 🎉
            </Text>
          </View>
        </ThemedView>
      )} */}
      {/* </View> */}

       {/* --- Streak Anzeige --- */}
      <View style={styles.streakContainer}>
        <ThemedText style={styles.streakTitle}>Wöchentliche Streak</ThemedText>
        <View style={styles.streakRow}>
          {weekStreak.map((done, index) => (
            <FontAwesome
              key={index}
              name={done ? 'fire' : 'circle-o'}
              size={20}
              color={done ? 'orange' : 'gray'}
              style={{ marginHorizontal: 4 }}
            />
          ))}
        </View>
        <ThemedText style={styles.streakInfo}>
          {weekStreak.filter(Boolean).length} / 7 Tage geschafft 🎉
        </ThemedText>
      </View>

      {/* Confetti */}
     {showConfetti && (
        <ConfettiCannon
            count={150}            
            origin={{x: -20, y: 0}}
            fadeOut={true}
            explosionSpeed={550}    
            fallSpeed={1500}        
            colors={[colors.primary, colors.secondary, colors.tertiary, colors.quintery, colors.quaterny, colors.senary, "#FF69B4", "#e564ffff"]}
        />
     )}

      {/* Neuer Container für den Fun-Fact */}
      {funFact ? (
        <ThemedView style={{ alignItems: 'center', marginBottom: 20 }}>
          <ThemedCard style={styles.funFactCard}>
            <Text style={styles.funFactTitle}>Fun Fact 🎉</Text>
            <Text style={styles.funFactText}>{funFact}</Text>
          </ThemedCard>
        </ThemedView>
      ) : null}

    </ThemedView>
  );
};

export default StartScreen;

const styles = StyleSheet.create({
   snackbar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  snackbarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  container: {
    flex: 1,
    //padding: 20,
    //alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: Colors.neutral.uiBackground,
    padding: 25,
    marginBottom: 20,
    marginTop: 40,
    //shadowColor: '#000',
    //shadowOffset: { width: 0, height: 4 },
    //shadowOpacity: 0.1,
    //shadowRadius: 5,
    elevation: 4, // For Android shadow
    alignItems: 'center',
  },
  date: {
    fontWeight: 'bold',
    fontSize: 23,
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingLeft: 40,
  },
  itemText: {
    paddingLeft: 20,
    fontSize: 16,
    flexShrink: 1,
  },
  streakContainer: {
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  streakRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  streakInfo: {
    fontSize: 14,
    color: 'gray',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 5,
    width: 100,
    height: 100,
    borderRadius: 60, 
    overflow: 'hidden',
    marginTop: 25,
    borderWidth: 3, 
    borderColor: '#eee', 
  },
  successText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: "center"
  },
  funFactCard: {
    width: '95%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    alignItems: 'center',
  },
  funFactTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: Colors.quintery,
  },
  funFactText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
    lineHeight: 20,
  },
  reminderButton: {
    marginTop: 10,
    backgroundColor: '#6a5acd', // Eine schöne lilafarbene Farbe
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  reminderButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
   emptyStateLink: {
    marginTop: 20,
    textAlign: 'center',
    paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 8,
  },
  emptyStateText: {
    fontSize: 14,
  textAlign: 'center',
  marginBottom: 3,
  },
  emptyStateLinkText: {
    fontSize: 14,
  },
});
