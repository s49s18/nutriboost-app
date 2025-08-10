import { StyleSheet } from 'react-native'
import React, { useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'expo-router';

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"
import { UserContext } from '../../contexts/UserContexts';
import ThemedLoader from '../../components/ThemedLoader';
import { Colors } from '../../constants/Colors';

const Profile = () => {
  const { user } = useContext(UserContext);
  const [trackedNutrients, setTrackedNutrients] = useState([]);
  const [loadingNutrients, setLoadingNutrients] = useState(true);

   // Laden der Nährstoffe, die der Benutzer verfolgt
  useEffect(() => {
    async function fetchNutrients() {
      if (!user) return; // Beende, wenn kein Benutzer angemeldet ist
      setLoadingNutrients(true);

      try {
        // Schritt 1: Hole die Nutrient-IDs des Benutzers
        const { data: userNutrientsData, error: userNutrientsError } = await supabase
          .from('user_nutrients')
          .select('nutrient_id')
          .eq('user_id', user.id);

        if (userNutrientsError) {
          console.error('Fehler beim Laden der Benutzer-Nährstoffe:', userNutrientsError);
          setLoadingNutrients(false);
          return;
        }

        const nutrientIds = userNutrientsData.map(item => item.nutrient_id);

        if (nutrientIds.length === 0) {
          setTrackedNutrients([]);
          setLoadingNutrients(false);
          return;
        }

        // Schritt 2: Hole die Nährstoffnamen anhand der IDs
        const { data: nutrients, error: nutrientsError } = await supabase
          .from('nutrients')
          .select('name')
          .in('id', nutrientIds);

        if (nutrientsError) {
          console.error('Fehler beim Laden der Nährstoffnamen:', nutrientsError);
          setLoadingNutrients(false);
          return;
        }

        setTrackedNutrients(nutrients.map(n => n.name));

      } catch (error) {
        console.error('Ein unerwarteter Fehler ist aufgetreten:', error);
      } finally {
        setLoadingNutrients(false);
      }
    }

    fetchNutrients();
  }, [user]); // Führe dies aus, wenn der Benutzer-Kontext geladen oder geändert wird

  // Zeige einen Ladezustand, wenn die Daten noch nicht geladen sind
  if (loadingNutrients) {
    return (
      <ThemedLoader/>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={[styles.headerText, { color: Colors.secondary }]} title={true}>
         My Profile
      </ThemedText>
      <Spacer height={20} />
      <ThemedView style={styles.infoRow}>
        <ThemedText title={true} style={styles.heading}>E-Mail:</ThemedText>
        <ThemedText> {user.email}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.infoRow}>
        <ThemedText title={true} style={styles.heading}>Nutritions to track:</ThemedText>
        {trackedNutrients.length > 0 ? (
            <ThemedText> {trackedNutrients.join(', ')}</ThemedText>
         ) : (
            <ThemedText> None yet</ThemedText>
         )}
      </ThemedView>
      <Spacer height={20} />
        {/* Zeigt einen Link nur an, wenn der Benutzer noch keine Nährstoffe hat */}
        {trackedNutrients.length === 0 && (
          <Link href="/nutrients" style={styles.emptyStateLink}>
            <ThemedText style={styles.emptyStateText}>
              Time to start tracking some nutritions ...
            </ThemedText>
          </Link>
        )}
    </ThemedView>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 26,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    //borderBottomWidth: 1,
    //borderBottomColor: Colors.light.iconColor, // Ein hellerer Grauton für die Trennlinie
  },
  quote: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    color: Colors.light.iconColor,
  },
  emptyStateLink: {
    marginTop: 20,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: Colors.primary, // Verwende die primäre Farbe, um es als Link zu kennzeichnen
    textDecorationLine: 'underline',
  },
})