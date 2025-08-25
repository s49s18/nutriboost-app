import React from 'react';
import { StyleSheet, Dimensions, useColorScheme, View, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '../constants/Colors';

const screenWidth = Dimensions.get('window').width;

const ThemedLineChart = ({ data }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const chartConfig = {
    backgroundColor: theme.uiBackground,
    backgroundGradientFrom: theme.uiBackground,
    backgroundGradientTo: theme.uiBackground,
    color: (opacity = 1) => theme.text,
    labelColor: (opacity = 1) => theme.text,
    strokeWidth: 2,
    propsForDots: {
      r: "2",
      strokeWidth: "2",
      stroke: theme.header,
      fill: theme.header,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: theme.iconColor,
    },
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 10,
    }
  };

  // Dynamische Label-Reduktion, für bessere Lesbarkeit
  const reduceLabels = (labels) => {
    if (labels.length > 12) {
      // Zeige z. B. nur jeden 2. oder 3. Wert
      const step = Math.ceil(labels.length / 12); 
      return labels.map((label, i) => (i % step === 0 ? label : ''));
    }
    return labels;
  };

  const reducedData = {
    ...data,
    labels: reduceLabels(data.labels),
  };

  return (
      <LineChart
      data={reducedData}
      width={screenWidth * 0.9}
      height={220}
      chartConfig={chartConfig}
      bezier
      style={styles.lineChart}
      formatXLabel={(label) => label}
    />
  );
};

export default ThemedLineChart;

const styles = StyleSheet.create({
  lineChart: {
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
