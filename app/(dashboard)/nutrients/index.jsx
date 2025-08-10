import { StyleSheet, ScrollView, TouchableOpacity, View, Text } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Link } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

import Spacer from "../../../components/Spacer";
import ThemedText from "../../../components/ThemedText";
import ThemedView from "../../../components/ThemedView";
import ThemedLoader from '../../../components/ThemedLoader';
import ThemedHeader from '../../../components/ThemedHeader';
import { UserContext } from '../../../contexts/UserContexts';
import { Colors } from '../../../constants/Colors';


const Nutrients = () => {
  const { user } = useContext(UserContext);
  const [allNutrients, setAllNutrients] = useState([]);
  const [trackedNutrients, setTrackedNutrients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lade alle Nährstoffe und die vom Benutzer verfolgten Nährstoffe
  useEffect(() => {
    async function fetchNutrientsData() {
      setLoading(true);

      try {
        // Hole alle Nährstoffe aus der 'nutrients'-Tabelle
        const { data: nutrientsData, error: nutrientsError } = await supabase
          .from('nutrients')
          .select('*');

        if (nutrientsError) {
          console.error('Fehler beim Laden aller Nährstoffe:', nutrientsError);
          return;
        }

        setAllNutrients(nutrientsData);

        // Hole die vom Benutzer verfolgten Nährstoffe
        if (user) {
          const { data: userNutrientsData, error: userNutrientsError } = await supabase
            .from('user_nutrients')
            .select('nutrient_id')
            .eq('user_id', user.id);

          if (userNutrientsError) {
            console.error('Fehler beim Laden der Benutzer-Nährstoffe:', userNutrientsError);
            return;
          }

          setTrackedNutrients(userNutrientsData.map(item => item.nutrient_id));
        }

      } catch (error) {
        console.error('Ein unerwarteter Fehler ist aufgetreten:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNutrientsData();
  }, [user]);

  // Funktion zum Hinzufügen/Entfernen eines Nährstoffs
  const handleToggleNutrient = async (nutrientId) => {
    if (!user) return; // Beende, wenn kein Benutzer angemeldet ist

    const isTracking = trackedNutrients.includes(nutrientId);
    
    if (isTracking) {
      // Nährstoff entfernen
      const { error } = await supabase
        .from('user_nutrients')
        .delete()
        .eq('user_id', user.id)
        .eq('nutrient_id', nutrientId);

      if (error) {
        console.error('Fehler beim Entfernen des Nährstoffs:', error);
      } else {
        setTrackedNutrients(trackedNutrients.filter(id => id !== nutrientId));
      }
    } else {
      // Nährstoff hinzufügen
      const { error } = await supabase
        .from('user_nutrients')
        .insert([{ user_id: user.id, nutrient_id: nutrientId }]);

      if (error) {
        console.error('Fehler beim Hinzufügen des Nährstoffs:', error);
      } else {
        setTrackedNutrients([...trackedNutrients, nutrientId]);
      }
    }
  };

  if (loading) {
    return (
      <ThemedLoader >
        <ThemedText>Load Nutrients...</ThemedText>
      </ThemedLoader>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Spacer height={10}/>
      <ThemedHeader title={true} style={styles.pageTitle}>Select Nutrients</ThemedHeader>
      <Spacer height={10} />
      <ScrollView style={styles.scrollView}>
        {allNutrients.map((nutrient) => {
          const isTracking = trackedNutrients.includes(nutrient.id);
          return (
            <Link key={nutrient.id} href={`/nutrients/${nutrient.id}`} asChild>
            <TouchableOpacity
              style={styles.cardContainer}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{nutrient.name}</Text>
                <Text style={styles.cardDescription}>
                  Tagesbedarf: {nutrient.min_daily} - {nutrient.max_daily} {nutrient.unit}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => handleToggleNutrient(nutrient.id)}
              >
                <FontAwesome
                  name={isTracking ? 'check-square' : 'square-o'}
                  size={24}
                  color={isTracking ? Colors.quintery : Colors.light.iconColor}
                />
              </TouchableOpacity>
            </TouchableOpacity>
            </Link>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
};

export default Nutrients;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.light.uiBackground,
    backgroundColor: Colors.light.uiBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: Colors.light.uiBackground,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.light.text,
    backgroundColor: Colors.light.uiBackground,
    marginTop: 5,
  },
  checkboxContainer: {
    paddingLeft: 15,
  },
});
