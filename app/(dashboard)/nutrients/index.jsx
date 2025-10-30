import { StyleSheet, View, ScrollView, TouchableOpacity, Text, Animated } from 'react-native';
import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

import { useUser } from '../../../hooks/useUser';
import { NutrientsContext } from '../../../contexts/NutrientsContext';
import { useTheme } from '../../../contexts/ThemeContext';

import ThemedView from '../../../components/ThemedView';
import ThemedText from '../../../components/ThemedText';
import Spacer from '../../../components/Spacer';
import ThemedLoader from '../../../components/ThemedLoader';
import { Colors } from '../../../constants/Colors';
import { ColorContext } from '../../../contexts/ColorContext';


const Nutrients = () => {
  const { user } = useUser();
  const { allNutrients, trackedNutrients, toggleTrackedNutrient, loadingTracked, loadingAll } =useContext(NutrientsContext);
  const { colors } = useContext(ColorContext);
  const { themeName } = useTheme();
  const theme = Colors[themeName] ?? Colors.light;
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  // verhindert Doppel-Taps je Item
  const [pendingId, setPendingId] = useState(null);

 

  const handleToggle = async (nutrient) => {
    if (!user?.id || pendingId === nutrient.id) return;

    const wasTracked = trackedNutrients.includes(nutrient.id);
    setPendingId(nutrient.id);

    // Sofortiges Mini-Feedback (ohne Warten auf DB)
    try { hapticTick(); } catch {}

    try {
      await toggleTrackedNutrient(user.id, nutrient.id);

        const message = wasTracked
          ? ` ${nutrient.name} entfernt` 
          : ` ${nutrient.name} hinzugefügt`;
        // Snackbar anzeigen
        setSnackbar({ visible: true, message: message });
        // Snackbar nach 1200ms ausblenden
        setTimeout(() => {
          setSnackbar({ visible: false, message: '' });
        }, 1200);
      } catch (e) {
        // Fehlermeldung anzeigen
        setSnackbar({ visible: true, message: 'Speichern fehlgeschlagen. Versuche es später erneut.' });
        // Snackbar nach 2000ms ausblenden
        setTimeout(() => {
       setSnackbar({ visible: false, message: '' });
       }, 2000);
          } finally {
            setPendingId(null);
        }
  };

  if (loadingAll || loadingTracked) {
    return (
      <ThemedLoader>
        <ThemedText>Load Nutrients...</ThemedText>
      </ThemedLoader>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Spacer height={10} />
      <ThemedText title={true} style={styles.pageTitle}>Nährstoffe wählen</ThemedText>
      <Spacer height={10} />

      <ScrollView style={styles.scrollView}>
        {allNutrients.map((nutrient) => {
          const isTracking = trackedNutrients.includes(nutrient.id);

          return (
            <Link key={nutrient.id} href={`/nutrients/${nutrient.id}`} asChild>
              <TouchableOpacity style={styles.cardContainer}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{nutrient.name}</Text>
                  <Text style={styles.cardDescription}>
                    Tagesbedarf: {nutrient.min_daily} - {nutrient.max_daily} {nutrient.unit}
                  </Text>

                  <Link href={`/nutrients/${nutrient.id}`} asChild>
                    <TouchableOpacity style={styles.detailsButton}>
                      <Text style={[styles.cardLink, { color: colors.primary }]}>Details</Text>
                    </TouchableOpacity>
                  </Link>
                </View>

                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => handleToggle(nutrient)}
                  disabled={pendingId === nutrient.id}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <FontAwesome
                    name={isTracking ? 'check-square' : 'square-o'}
                    size={30}
                    color={isTracking ? colors.primary : Colors.light.iconColor}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            </Link>
          );
        })}
      </ScrollView>

      {snackbar.visible && (
        <View style={[styles.snackbar, { backgroundColor: theme.text }]}>
          <Text style={[styles.snackbarText, { color: theme.background }]}>{snackbar.message}</Text>
        </View>
      )}
    </ThemedView>
  );
};

export default Nutrients;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  scrollView: { flex: 1 },
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
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', backgroundColor: Colors.light.uiBackground },
  cardDescription: {
    fontSize: 14,
    color: Colors.light.text,
    backgroundColor: Colors.light.uiBackground,
    marginTop: 5,
  },
  checkboxContainer: { paddingLeft: 15 },
  cardLink: { marginTop: 5, paddingLeft: 3, fontSize: 12, textDecorationLine: 'underline' },
  snackbar: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 25,
    elevation: 10,
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  snackbarText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});
