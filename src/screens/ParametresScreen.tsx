import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import Badge from '../components/Badge';
import { colors, fonts } from '../theme';
import { useData } from '../store/DataContext';
import { isFirebaseConfigured } from '../firebase/config';
import { isGoogleConfigured, useGoogleAuthRequest } from '../calendar/googleCalendar';
import {
  requestNotificationPermission,
  scheduleMonthlyReportNotification,
  notificationsSupportedOnWeb,
} from '../notifications/notifications';

export default function ParametresScreen() {
  const { cloudStatus } = useData();
  const [request, , promptAsync] = useGoogleAuthRequest();
  const [googleConnected, setGoogleConnected] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);

  const cloudLabel =
    cloudStatus === 'synced' ? 'Connecté' : cloudStatus === 'connecting' ? 'Connexion…' : 'Non configuré';
  const cloudColor =
    cloudStatus === 'synced'
      ? { bg: colors.successChipBg, color: colors.successChipText }
      : { bg: colors.amberChipBg, color: colors.amberChipText };

  const handleGoogleConnect = async () => {
    if (!isGoogleConfigured) {
      Alert.alert(
        'Google Agenda non configuré',
        "Créez un Client ID OAuth sur console.cloud.google.com et collez-le dans src/calendar/googleCalendar.ts"
      );
      return;
    }
    const result = await promptAsync();
    if (result.type === 'success') setGoogleConnected(true);
  };

  const handleEnableNotifications = async () => {
    if (!notificationsSupportedOnWeb) {
      Alert.alert('Indisponible sur web', 'Les notifications fonctionnent sur l\'app mobile (build APK ou Expo Go).');
      return;
    }
    const granted = await requestNotificationPermission();
    if (granted) {
      await scheduleMonthlyReportNotification();
      setNotifEnabled(true);
    } else {
      Alert.alert('Permission refusée', 'Activez les notifications dans les réglages du téléphone.');
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Paramètres" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="person-outline" size={18} color={colors.textPrimary} />
            <Text style={styles.label}>Mon compte</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>

        <TouchableOpacity style={styles.row} onPress={handleGoogleConnect}>
          <View style={styles.rowLeft}>
            <Ionicons name="calendar-outline" size={18} color={colors.textPrimary} />
            <Text style={styles.label}>Google Agenda</Text>
          </View>
          {googleConnected ? (
            <Badge label="Connecté" bg={colors.successChipBg} color={colors.successChipText} />
          ) : (
            <Text style={styles.sub}>{isGoogleConfigured ? 'Connecter' : 'À configurer'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={handleEnableNotifications}>
          <View style={styles.rowLeft}>
            <Ionicons name="notifications-outline" size={18} color={colors.textPrimary} />
            <Text style={styles.label}>Notifications</Text>
          </View>
          <Text style={styles.sub}>{notifEnabled ? 'Activées' : 'Rappels + bilan mensuel'}</Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="cloud-outline" size={18} color={colors.textPrimary} />
            <Text style={styles.label}>Sauvegarde cloud</Text>
          </View>
          <Badge label={cloudLabel} bg={cloudColor.bg} color={cloudColor.color} />
        </View>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="download-outline" size={18} color={colors.textPrimary} />
            <Text style={styles.label}>Exporter mes données</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>

        {!isFirebaseConfigured && (
          <Text style={styles.hint}>
            Sauvegarde cloud désactivée : ajoutez vos clés Firebase dans src/firebase/config.ts
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontSize: 13, fontFamily: fonts.regular },
  sub: { fontSize: 11, color: colors.textSecondary, fontFamily: fonts.regular },
  hint: { fontSize: 11, color: colors.textMuted, marginTop: 14, fontFamily: fonts.regular },
});
