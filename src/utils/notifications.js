import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function requestNotificationPermission() {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) return true;
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert:true, allowSound:true, allowAnnouncements:true }
  });
  return status === 'granted' || status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('sankalp7-reminders', {
    name: 'Sankalp Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 200, 200],
    sound: 'default',
    bypassDnd: false
  });
}

export async function scheduleDefaultSevenReminders() {
  const times = ['06:00','09:00','12:00','15:00','18:00','20:00','22:00'];
  await cancelAllReminders();
  await scheduleSevenAtTimes(times);
}

export async function scheduleSevenAtTimes(times) {
  for (const t of times) {
    const [hour, minute] = t.split(':').map(Number);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🕉️ Sankalp 7',
        body: 'Jai Hanuman 🙏 Time for today’s Chalisa path — tap to play.',
        categoryIdentifier: 'PLAY_NOW',
        interruptionLevel: 'time-sensitive'
      },
      trigger: { hour, minute, repeats: true, channelId: 'sankalp7-reminders' }
    });
  }
}

export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
