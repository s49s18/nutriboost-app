import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

export const requestNotificationPermission = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert(
      'Benachrichtigungen deaktiviert',
      'Bitte aktiviere Benachrichtigungen in den App-Einstellungen, um Erinnerungen zu erhalten.'
    );
    return false;
  }

  return true;
};

export const scheduleReminder = async ({ nutrient, time, frequency, days }) => {
  const notificationIds = [];

  if (frequency === "daily") {
    const now = new Date();
    const notificationTime = new Date();
    notificationTime.setHours(time.getHours());
    notificationTime.setMinutes(time.getMinutes());
    notificationTime.setSeconds(0);
    notificationTime.setMilliseconds(0);

    // Wenn die geplante Zeit heute bereits vorbei ist, plane sie für morgen
    if (notificationTime.getTime() <= now.getTime()) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Erinnerung",
        body: `Vergiss nicht, ${nutrient.name} zu nehmen!`,
      },
      trigger: {
        hour: time.getHours(),
        minute: time.getMinutes(),
        repeats: true,
      },
    });
    notificationIds.push(id);

  } else if (frequency === "weekly") {
    for (const weekday of days) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Erinnerung",
          body: `Vergiss nicht, ${nutrient.name} zu nehmen!`,
        },
        trigger: {
          weekday, // 1 = Sonntag, 2 = Montag, …
          hour: time.getHours(),
          minute: time.getMinutes(),
          repeats: true,
        },
      });
      notificationIds.push(id);
    }
  }

  return notificationIds;
};

