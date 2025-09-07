import React, { useState, useContext, useEffect  } from 'react';
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
import { format } from 'date-fns';
import ConfettiCannon from 'react-native-confetti-cannon';


const StartScreen = () => {
  const { user } = useContext(UserContext);
  const { allNutrients, trackedNutrients, takenToday, toggleTaken } = useContext(NutrientsContext);
  const allTaken = trackedNutrients.length > 0 && trackedNutrients.every(id => takenToday[id]);
  const trackedNutrientObjects = allNutrients.filter(n => trackedNutrients.includes(n.id));
  const [showConfetti, setShowConfetti] = useState(false);
  const [funFact, setFunFact] = useState('');

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
    const registerForPushNotificationsAsync = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      // Token hier ggf. an deinen Server senden
    };

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    if (allTaken) {
      setShowConfetti(true);
      // nach ein paar Sekunden automatisch wieder ausblenden
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [allTaken]);

  return (
    <ThemedView style={styles.container}>
       <AppHeader />
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



      {/* Liste */}
      <FlatList
        data={trackedNutrientObjects}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <TouchableOpacity onPress={() => toggleTaken(user.id, item.id)}>
              <FontAwesome
                name={takenToday[item.id] ? 'check-square' : 'square-o'}
                size={24}
                color={takenToday[item.id] ? Colors.secondary: Colors.light.iconColor}
              />
            </TouchableOpacity>
            <ThemedText style={styles.itemText}>
              {item.name} {'  '}
              <ThemedText style={{ fontStyle: 'italic' }}>
                ({takenToday[item.id] ? 'Genommen' : 'Noch nicht'})
              </ThemedText>
            </ThemedText>
          </View>
        )}
      />

      {/* Button "Alle genommen" */}
      {allTaken && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>
            Alle genommen 🎉
          </Text>
        </View>
      )}

      {/* Confetti */}
      {showConfetti && (
        <ConfettiCannon
          count={200}           // wie viele Konfetti
          origin={{x: -20, y: 0}} // Startpunkt 
          fadeOut={true}        // Konfetti verschwinden
          explosionSpeed={350}
          fallSpeed={2500}
          colors={["#00FF00", "#0000FF", "#FFD700", "#FF69B4"]} // Farben des Konfettis
        />
      )}

      {/* Neuer Container für den Fun-Fact */}
      {funFact ? (
        <ThemedCard style={styles.funFactCard}>
          <Text style={styles.funFactTitle}>Fun Fact 🎉</Text>
          <Text style={styles.funFactText}>{funFact}</Text>
        </ThemedCard>
      ) : null}

    </ThemedView>
  );
};

export default StartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //padding: 20,
    alignItems: 'center',
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
    marginVertical: 10,
  },
  itemText: {
    marginLeft: 10,
    fontSize: 16,
  },
  successBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: Colors.tertiary,
    borderRadius: 10,
    alignItems: 'center',
  },
  successText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
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
  }
});
