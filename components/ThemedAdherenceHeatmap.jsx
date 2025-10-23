// components/ThemedAdherenceHeatmap.tsx
import React, { useContext} from 'react';
import { StyleSheet, Dimensions, View, Text} from 'react-native';
import { ContributionGraph } from 'react-native-chart-kit';
import { Colors } from '../constants/Colors';
import { ColorContext } from "../contexts/ColorContext";
import { useTheme } from '../contexts/ThemeContext';

const screenWidth = Dimensions.get('window').width;

const hexToRgba = (hex, opacity = 1) => {
  const h = hex.replace('#','');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};


const ThemedAdherenceHeatmap = ({
  values,
  numDays,
  endDate = new Date(),
  squareSize = 22,
  gutterSize = 4,
  width,
  height,
}) => {
  const { colors } = useContext(ColorContext);
  const { themeName } = useTheme();
  const theme = themeName === 'dark' ? Colors.dark : Colors.light;

  const accent = colors.secondary || '#5B8DEF';

  const chartConfig = {
    backgroundColor: theme.navBackground,
    backgroundGradientFrom: theme.navBackground,
    backgroundGradientTo: theme.navBackground,
    color: (opacity = 1) => hexToRgba(accent, opacity),
    labelColor: () => theme.text,
    propsForLabels: { fontSize: 10 },
  };

  const graphWidth = width ?? screenWidth * 0.8;
  const defaultHeight = (7 * squareSize) + (6 * gutterSize) + 60;
  const graphHeight = height ?? defaultHeight;

  const weekdayLabels = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
     {/* Linke Spalte: Wochentage */}
     <View style={{
       height: graphHeight - 74, // ohne Labelbereich unten
       justifyContent: 'space-between',
       marginRight: 5,
       paddingTop: squareSize / 2,
     }}>
       {weekdayLabels.map((d) => (
         <Text
           key={d}
           style={{
             color: theme.text,
             fontSize: 8,
             textAlign: 'left',
           }}
         >
           {d}
         </Text>
       ))}
     </View>
     {/* Rechte Spalte: Heatmap selbst */}
     <ContributionGraph
       values={values}
       endDate={endDate}
       numDays={numDays}
       width={graphWidth}
       height={graphHeight}
       chartConfig={chartConfig}
       squareSize={squareSize}
       gutterSize={gutterSize}
       tooltipDataAttrs={() => ({ opacity: 1 })}
       style={styles.graph}
     />
   </View> );
};

export default ThemedAdherenceHeatmap;

const styles = StyleSheet.create({
  graph: {
    borderRadius: 8,
    marginVertical: 8,
    elevation: 4,
  },
});
