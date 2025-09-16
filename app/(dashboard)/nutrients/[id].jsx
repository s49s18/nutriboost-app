import { StyleSheet, View, Image, ScrollView, Text } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { NutrientsContext } from '../../../contexts/NutrientsContext';

import ThemedText from "../../../components/ThemedText";
import ThemedScrollView from "../../../components/ThemedScrollView";
import Spacer from "../../../components/Spacer";
import { Colors } from '../../../constants/Colors';
import ThemedLoader from '../../../components/ThemedLoader';
import { ColorContext } from '../../../contexts/ColorContext';

const NutrientDetail = () => {
  const { id } = useLocalSearchParams();
  const { fetchNutrientById } = useContext(NutrientsContext);
  const { colors } = useContext(ColorContext);

  const [nutrient, setNutrient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
            if (!id) return;
            setLoading(true);

            const data = await fetchNutrientById(id);
            setNutrient(data);

            setLoading(false);
        }

        loadData();
    }, [id]);

  if (loading) {
    return <ThemedLoader/>;
  }

  if (!nutrient) {
    return <ThemedText>Nährstoff nicht gefunden.</ThemedText>;
  }

  return (
    <ThemedScrollView style={styles.container}>
      {/* Headerbild */}
      {nutrient.image_url && (
        <Image source={{ uri: nutrient.image_url }} style={styles.headerImage} />
      )}

      {/* Titel */}
      <Spacer height={10} />
      <ThemedText title style={[styles.nutrientTitle, { color: colors.secondary }]}>
        {nutrient.name}
      </ThemedText>
      <ThemedText style={[styles.category, colors.iconColor]}>{nutrient.category}</ThemedText>
      <Spacer height={5} />
      {/* Basisinfos */}
      <View style={styles.infoCard}>
        <InfoRow label="Min. tägl. Bedarf" value={`${nutrient.min_daily} ${nutrient.unit}`} />
        <InfoRow label="Max. tägl. Bedarf" value={`${nutrient.max_daily} ${nutrient.unit}`} />
        {nutrient.sources && <InfoRow label="Hauptquellen" value={nutrient.sources} />}
      </View>

      <Spacer height={5} />

      {/* Kurzbeschreibung */}
      {nutrient.short_description && (
        <>
          <ThemedText style={styles.sectionTitle}>Kurzbeschreibung</ThemedText>
          <ThemedText style={styles.text}>{nutrient.short_description}</ThemedText>
          <Spacer height={10} />
        </>
      )}

      {/* Lebensmittel */}
      {nutrient.vegan_sources && (
        <>
          <ThemedText style={styles.sectionTitle}>Lebensmittel</ThemedText>
          <ThemedText style={styles.text}>{nutrient.vegan_sources}</ThemedText>
          <Spacer height={10} />
        </>
      )}

      {/* Einnahmeempfehlungen */}
      {nutrient.recommended_intake && (
        <>
          <ThemedText style={styles.sectionTitle}>Empfehlungen zur Einnahme</ThemedText>
          <ThemedText style={styles.text}>{nutrient.recommended_intake}</ThemedText>
          <Spacer height={10} />
        </>
      )}

      {/* Beschreibung*/}
      {nutrient.description && (
        <>
          <ThemedText style={styles.sectionTitle}>Wichtigste Informationen</ThemedText>
          <ThemedText style={styles.text}>{nutrient.description}</ThemedText>
          <Spacer height={10} />
        </>
      )}

      {nutrient.functions && (
        <>
          <ThemedText style={styles.sectionTitle}>Funktionen im Körper</ThemedText>
          <ThemedText style={styles.text}>{nutrient.functions}</ThemedText>
          <Spacer height={10} />
        </>
      )}

      {nutrient.deficiency && (
        <>
          <ThemedText style={styles.sectionTitle}>Mangelerscheinungen</ThemedText>
          <ThemedText style={styles.text}>{nutrient.deficiency}</ThemedText>
          <Spacer height={10} />
        </>
      )}

    </ThemedScrollView>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

export default NutrientDetail;

const styles = StyleSheet.create({
  container: { flex: 1,  },
  headerImage: { width: '100%', height: 200, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  nutrientTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginTop: 15},
  category: { fontSize: 14, textAlign: 'center'},
  infoCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginHorizontal: 15,
    marginTop: 5,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  infoLabel: { fontWeight: 'bold', fontSize: 15 },
  infoValue: { fontSize: 15 },
  sectionTitle: { fontWeight: 'bold', fontSize: 18, marginHorizontal: 15, marginTop: 10 },
  text: { fontSize: 15, lineHeight: 22, marginHorizontal: 15 },
});
