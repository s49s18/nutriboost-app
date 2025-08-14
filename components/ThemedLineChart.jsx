import React from 'react';
import { StyleSheet, Dimensions, useColorScheme } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '../constants/Colors'; // Adjust the import path as needed

const screenWidth = Dimensions.get('window').width;

const ThemedLineChart = ({ data }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const chartConfig = {
    // Background colors for the chart area
    backgroundColor: theme.uiBackground,
    backgroundGradientFrom: theme.uiBackground,
    backgroundGradientTo: theme.uiBackground,

    // Label and axis colors
    color: (opacity = 1) => theme.text,
    labelColor: (opacity = 1) => theme.text,

    // Style for the line and dots
    strokeWidth: 2,
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: theme.header, // Use a highlight color for dots
      fill: theme.header,   // Fill the dots with the highlight color
    },
    
    // Style for the main line
    propsForBackgroundLines: {
      strokeDasharray: '', // Make the background grid lines solid
      stroke: theme.iconColor, // Use a subtle color for grid lines
    },
    
    // Y-axis configuration
    decimalPlaces: 0,
  };

  return (
    <LineChart
      data={data}
      width={screenWidth * 0.9}
      height={220}
      chartConfig={chartConfig}
      bezier // Adds a smooth curve to the line
      style={styles.lineChart}
    />
  );
};

export default ThemedLineChart;

const styles = StyleSheet.create({
  lineChart: {
    marginVertical: 8,
    borderRadius: 16,
    // Add shadow for a more polished look
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});