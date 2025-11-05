import { ActivityIndicator, useColorScheme } from 'react-native'
import { Colors } from '../constants/Colors'

import ThemedView from './ThemedView'
import { useTheme } from '../contexts/ThemeContext';

const ThemedLoader = () => {
    const { themeName } = useTheme();
    const theme = Colors[themeName] ?? Colors.light;

    return (
        <ThemedView style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <ActivityIndicator size="large" color={theme.highlight} />
        </ThemedView>
    )
}

export default ThemedLoader
