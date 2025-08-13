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
import { NutrientsContext } from '../../contexts/NutrientsContext';

const Profile = () => {
  const { user } = useContext(UserContext);
  const { allNutrients, trackedNutrients } = useContext(NutrientsContext);

  const trackedNames = trackedNutrients
  .map(id => allNutrients.find(n => n.id === id)?.name)
  .filter(Boolean); 

  // Zeige einen Ladezustand, wenn die Daten noch nicht geladen sind
  if (!user) return <ThemedLoader />;

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
        {trackedNames.length > 0 ? (
          <ThemedView style={{ maxWidth: '50%'}}>
            <ThemedText> {trackedNames.join(', ')}</ThemedText>
          </ThemedView>
        ) : (
          <ThemedText>None yet</ThemedText>
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