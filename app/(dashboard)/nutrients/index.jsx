import { StyleSheet, View, ScrollView, TouchableOpacity, Text } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

import { UserContext } from '../../../contexts/UserContexts';
import { NutrientsContext } from '../../../contexts/NutrientsContext';

import ThemedView from '../../../components/ThemedView';
import ThemedText from '../../../components/ThemedText';
import ThemedHeader from '../../../components/ThemedHeader';
import Spacer from '../../../components/Spacer';
import ThemedLoader from '../../../components/ThemedLoader';
import { Colors } from '../../../constants/Colors';

const Nutrients = () => {
  const { user } = useContext(UserContext);
  const { allNutrients, trackedNutrients, toggleTrackedNutrient, loadingTracked, loadingAll} = useContext(NutrientsContext);

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
                </View>

                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => toggleTrackedNutrient(user.id, nutrient.id)}
                >
                  <FontAwesome
                    name={isTracking ? 'check-square' : 'square-o'}
                    size={24}
                    color={isTracking ? Colors.secondary : Colors.light.iconColor}
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
