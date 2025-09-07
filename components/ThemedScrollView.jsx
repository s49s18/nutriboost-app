import { useColorScheme, ScrollView } from 'react-native'
import { Colors } from '../constants/Colors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../contexts/ThemeContext';

const ThemedScrollView = ({ style, safe = false, ...props }) => {
  const { themeName } = useTheme();
  const theme = Colors[themeName] ?? Colors.light;

  if (!safe) return (
    <ScrollView
      style={[{ backgroundColor: theme.background }, style]}
      {...props}
    />
  )

  const insets = useSafeAreaInsets()

  return (
    <ScrollView 
      style={[{ 
        backgroundColor: theme.background,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }, style]} 
      {...props}
    />
  )
}

export default ThemedScrollView