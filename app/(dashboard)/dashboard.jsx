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

const StartScreen = () => {
  const { user } = useContext(UserContext);
  const { allNutrients, trackedNutrients, takenToday, toggleTaken } = useContext(NutrientsContext);
  const allTaken = trackedNutrients.length > 0 && trackedNutrients.every(id => takenToday[id]);
  const trackedNutrientObjects = allNutrients.filter(n => trackedNutrients.includes(n.id));
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

  return (
    <ThemedView style={styles.container}>
       <AppHeader />
      <Spacer width={20}/>
        <ThemedView style={styles.card}>
         {/* Kopfzeile */}
        <Text style={styles.date}>
          Heute: {new Date().toLocaleDateString('at-AT')}
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
                color={takenToday[item.id] ? Colors.quintery : Colors.light.iconColor}
              />
            </TouchableOpacity>
            <ThemedText style={styles.itemText}>
              {item.name} {'  '}
              <ThemedText style={{ fontStyle: 'italic', color: Colors.light.text }}>
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
    padding: 20,
    alignItems: 'center',
   // backgroundColor: Colors.light.background,
  },
  card: {
    width: '100%',
    backgroundColor: '#e6e6fa', // Light purple background
    borderRadius: 10,
    padding: 25,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8, // For Android shadow
    alignItems: 'center',
  },
  date: {
    fontWeight: 'bold',
    fontSize: 16,
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
    backgroundColor: Colors.quintery,
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
