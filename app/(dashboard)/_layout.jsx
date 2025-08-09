import { Tabs } from "expo-router"
import { useColorScheme } from "react-native"
import { Colors } from "../../constants/Colors"
import { Ionicons } from "@expo/vector-icons"

export default function DashboardLayout() {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.navBackground, paddingTop: 10, height: 90 },
        tabBarActiveTintColor: theme.iconColorFocused,
        tabBarInactiveTintColor: theme.iconColor,
      }}
    >
      <Tabs.Screen 
        name="profile"
        options={{ title: "Profile", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "person" : "person-outline"} color={color} size={24} /> }} 
      />
      <Tabs.Screen 
        name="books"
        options={{ title: "Books", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "book" : "book-outline"} color={color} size={24} /> }} 
      />
      <Tabs.Screen 
        name="create"
        options={{ title: "Create", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "create" : "create-outline"} color={color} size={24} /> }} 
      />
    </Tabs>
  )
}