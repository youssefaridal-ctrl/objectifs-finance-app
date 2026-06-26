import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleMonthlyReportNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Bilan du mois précédent',
      body: 'Votre rapport mensuel (épargne, crédits, objectifs) est disponible.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      day: 1,
      hour: 9,
      minute: 0,
      repeats: true,
    },
  });
}

export async function scheduleCreditReminder(creditName: string, dayOfMonth: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Échéance crédit',
      body: `Rappel : mensualité "${creditName}" à régler.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      day: dayOfMonth,
      hour: 8,
      minute: 0,
      repeats: true,
    },
  });
}

export async function cancelAllScheduledNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export const notificationsSupportedOnWeb = Platform.OS !== 'web';
