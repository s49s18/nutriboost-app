import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import { Link } from 'expo-router'
import 'react-native-url-polyfill/auto';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { UserContext } from '../contexts/UserContexts';
import { ColorContext } from '../contexts/ColorContext';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// themed components
import ThemedView from '../components/ThemedView'
import AnimatedLinkButton from '../components/AnimatedLinkButton'
import ThemedTitleLogo from '../components/ThemedTitleLogo'
import Spacer from '../components/Spacer'
import ThemedText from '../components/ThemedText'
import { Colors } from '../constants/Colors';
import TitleLogo from '../assets/img/title_logo_neutral.png'

const Home = () => {

  const imageUrl = 'https://yekfgrbbsvfimdaokldr.supabase.co/storage/v1/object/sign/assets/headerImage.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lM2I3MTU2ZC0zZTliLTQ4ZDAtOGQwMS02OWIyODMxOTk0MzYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvaGVhZGVySW1hZ2UuanBnIiwiaWF0IjoxNzU1MTgwMjY0LCJleHAiOjE3ODY3MTYyNjR9.AIcq5WkmBgil09K10YsKOaLboesih7Mi-v7-JsyLc3U'
  const imageUrl2 = 'https://yekfgrbbsvfimdaokldr.supabase.co/storage/v1/object/sign/assets/header2%20(1).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lM2I3MTU2ZC0zZTliLTQ4ZDAtOGQwMS02OWIyODMxOTk0MzYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvaGVhZGVyMiAoMSkuanBnIiwiaWF0IjoxNzU1MTgyMzMyLCJleHAiOjE3ODY3MTgzMzJ9.UI-keEYYrilIrtRUlp4oKSRPi8p2qlAzTAs-ZfaTAcI'

  const { user } = useContext(UserContext);
  const { colors } = useContext(ColorContext);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/(dashboard)');
    }
  }, [user]);

  return (
    <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1 }}>
    <ThemedView style={styles.container}>
      <Image source={{ uri: imageUrl2 }} style={styles.headerImage} resizeMode="cover" />
      {/* MAIN CONTENT SECTION */}
      <ThemedView style={styles.mainContent}>
         {/* HEADER */}
         {/* *<ThemedTitleLogo style={styles.logo} />
         <View style={styles.header}>
           <ThemedText style={styles.brand}>Nutri-Boost</ThemedText>
        </View> 
        <Spacer height={2}/> 
        <ThemedText style={styles.tagline} title>
            Track Your Health, Boost Your Life
          </ThemedText> */}
          <Image source={TitleLogo} style={styles.logo} />
        {/*   <ThemedText style={styles.description}>
            The App to track and know your most important nutrients
          </ThemedText> */}
          <Spacer height={20} />

          {/* CARD */}
            {user ? (
              <View style={styles.card}>
                <Text style={styles.welcome}>
                  Welcome, {user.profile?.firstname} {user.profile?.lastname}
                </Text>
                <Text style={styles.email}>Email: {user.email}</Text>
              </View>
            ) : (
              <>
              {/*   <Text style={styles.info}>
                  Please log in to start improving your nutrition!
                </Text> */}
                <Spacer height={15} />
                <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={() => router.push('/register')} style={[styles.button, { backgroundColor: '#fff', borderColor: '#000', borderWidth: 1, }]}>
                    <Text style={[styles.buttonText, {color: '#000'}]}>Register</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => router.push('/login')} style={[styles.button, { backgroundColor: '#000' }]}>
                    <Text style={styles.buttonText}>Login</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
      </ThemedView>
    </ThemedView>
    </SafeAreaView>
    </SafeAreaProvider>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    width: '100%',
    height: 200,
    //borderBottomLeftRadius: 20,
    //borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5, // Android
  },
  header: {
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: 200,
  },
  brand: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    width: '85%',
    color: '#555',
    fontFamily: 'Montserrat',
    fontWeight: '500',
  },
  bodyText: {
    fontSize: 22,
    fontFamily: 'Montserrat',
  },
  footerText: {
    fontSize: 16,
    width: '80%',
    textAlign: 'center',
  },
  card: {
    width: '80%',
    backgroundColor: Colors.neutral.uiBackground,//'#e6e6fa', // Light purple background
    borderRadius: 5,
    padding: 25,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8, // For Android shadow
    alignItems: 'center',
  },
   welcome: {
    fontSize: 18,
    fontWeight: '600',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  info: {
    fontSize: 16,
    textAlign: 'center',
  },
  buttonRow: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10, // Abstand zwischen den Buttons
    width: '100%',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 26,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: 188, 
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
