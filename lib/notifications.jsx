import * as Notifications from 'expo-notifications';
import { Platform, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const requestNotificationPermission = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert(
      "Benachrichtigungen deaktiviert",
      "Bitte aktiviere Benachrichtigungen in den App-Einstellungen, um Erinnerungen zu erhalten.",
      [
        {
          text: "Abbrechen",
          style: "cancel",
        },
        {
          text: "Einstellungen öffnen",
          onPress: () => {
            if (Platform.OS === "ios") {
              Linking.openURL("app-settings:"); // öffnet direkt die App Settings unter iOS
            } else {
              Linking.openSettings(); // funktioniert unter Android
            }
          },
        },
      ]
    );

    return false;
  }

  return true;
};

// Plant Reminder (daily oder weekly)
export const scheduleReminder = async ({ nutrient, time, frequency, days }) => {
  // Berechtigung sicherstellen
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return [];

  // Android Channel Setup
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  const notificationIds = [];
  const hour = time.getHours();
  const minute = time.getMinutes();

  if (frequency === "daily") {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Erinnerung",
        body: `Vergiss nicht, ${nutrient.name} zu nehmen!`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        repeats: true,
        channelId: Platform.OS === "android" ? "default" : undefined,
      },
    });
    notificationIds.push(id);
  }

  if (frequency === "weekly" && Array.isArray(days)) {
    for (let day of days) {
      // Expo: 1 = Sonntag, 2 = Montag, …  
      const weekday = day; // ggf. anpassen je nachdem, wie dein State dayId definiert
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Wöchentliche Erinnerung",
          body: `Vergiss nicht, ${nutrient.name} zu nehmen!`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday,
          hour,
          minute,
          repeats: true,
          channelId: Platform.OS === "android" ? "default" : undefined,
        },
      });
      notificationIds.push(id);
    }
  }

  // Debug: Alle geplanten Notifications ausgeben
  const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
  console.log("Geplante Notifications:", allScheduled);

  return notificationIds;
};

const STREAK_MILESTONE_ID = 'streak_milestone_reminder';

export const scheduleMilestoneNotification = async (currentStreak) => {
    // 1. Berechtigung prüfen/anfragen
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
        console.log("Benachrichtigungsberechtigung nicht erteilt, kann Meilenstein nicht planen.");
        return;
    }

    // 2. Vorherige Meilenstein-Benachrichtigung löschen (wichtig für die Update-Logik)
    try {
        await Notifications.cancelScheduledNotificationAsync(STREAK_MILESTONE_ID);
    } catch (e) {
        // Ignorieren, falls keine alte gefunden wurde
    }

    // 3. Neue Meilenstein-Benachrichtigung planen
    await Notifications.scheduleNotificationAsync({
        identifier: STREAK_MILESTONE_ID, // Eindeutige ID
        content: {
            title: "Streak-Meilenstein erreicht! 🔥",
            body: `Glückwunsch zur ${currentStreak}-Tage Serie! Mach weiter so!`,
            data: { streak: currentStreak, type: 'streak_milestone' },
        },
        trigger: {
            // Auslösen in 5 Sekunden, um den Erfolg sofort zu feiern
            seconds: 5, 
            repeats: false,
        },
    });
};

export const scheduleDailyReminderIfNeeded = async (currentStreak, allTaken) => {
  // Wenn User schon alles genommen hat, Reminder nicht planen
  if (allTaken) return;

  // Prüfen, ob heute schon eine Notification geplant wurde
  const todayKey = `reminderSent-${format(new Date(), 'yyyy-MM-dd')}`;
  const alreadySent = await AsyncStorage.getItem(todayKey);
  if (alreadySent) return;

  // Notification planen (z. B. 20 Uhr)
  const now = new Date();
  const trigger = new Date();
  trigger.setHours(20, 0, 0, 0);
  if (trigger <= now) trigger.setDate(trigger.getDate() + 1); // für morgen planen, falls 20 Uhr vorbei

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Vergiss nicht deine Nährstoffe!",
      body: `Trage noch deine Nährwerte ein, um deine ${currentStreak}-Tage Streak nicht zu verlieren!`,
      sound: true,
    },
    trigger,
  });

  // Speichern, dass Reminder heute geplant wurde
  await AsyncStorage.setItem(todayKey, "true");
};
