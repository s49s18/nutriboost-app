import { Tabs } from "expo-router"
import { useColorScheme } from "react-native"
import { Colors } from "../../constants/Colors"
import { Ionicons } from "@expo/vector-icons"
import UserOnly from "../../components/auth/UserOnly"
import { useTheme } from "../../contexts/ThemeContext"
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardLayout() {
  const { themeName } = useTheme();
  const theme = Colors[themeName] ?? Colors.light;

  return (
    <UserOnly>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.uiBackground }} edges={['bottom']}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: theme.navBackground, paddingTop: 10, height: 90 },
          tabBarActiveTintColor: theme.iconColorFocused,
          tabBarInactiveTintColor: theme.iconColor,
        }}
      >
        <Tabs.Screen 
          name="dashboard"
          options={{ title: "Home", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "home" : "home-outline"} color={color} size={24} /> }} 
        />
        <Tabs.Screen 
          name="nutrients"
          options={{ title: "Nährstoffe", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "nutrition" : "nutrition-outline"} color={color} size={24} /> }} 
        />
        <Tabs.Screen 
          name="overview"
          options={{ title: "Verlauf", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} color={color} size={24} /> }} 
        />
        <Tabs.Screen 
          name="reminderList"
          options={{ title: "Erinnerungen", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "time" : "time-outline"} color={color} size={24} /> }} 
        />
        <Tabs.Screen 
          name="profile"
          options={{ title: "Einstellungen", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "settings" : "settings-outline"} color={color} size={24} /> }} 
        />
      </Tabs>
      </SafeAreaView>
    </UserOnly>
  )
}