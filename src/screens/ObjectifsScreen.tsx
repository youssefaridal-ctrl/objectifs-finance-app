import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import RowFormModal from '../components/RowFormModal';
import { colors, fonts } from '../theme';
import { useData, ObjectifRow } from '../store/DataContext';
import { isGoogleConfigured, useGoogleAuthRequest, createCalendarEvent } from '../calendar/googleCalendar';

const rubriqueStyle: Record<string, { bg: string; color: string }> = {
  Finance: { bg: colors.blueBg, color: colors.blueText },
  Santé: { bg: colors.greenBg, color: colors.greenText },
  Famille: { bg: colors.pinkBg, color: colors.pinkText },
  Religion: { bg: colors.purpleBg, color: colors.purpleText },
  'Développement personnel': { bg: colors.amberBg, color: colors.amberText },
};

function toValues(r?: ObjectifRow): Record<string, string> {
  return { rubrique: r?.rubrique ?? '', action: r?.action ?? '' };
}

export default function ObjectifsScreen() {
  const { data, upsertRow, deleteRow } = useData();
  const items = data.objectifs;
  const [editing, setEditing] = useState<ObjectifRow | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [request, , promptAsync] = useGoogleAuthRequest();

  const handleSyncCalendar = async () => {
    if (!isGoogleConfigured) {
      Alert.alert(
        'Google Agenda non configuré',
        'Créez un Client ID OAuth sur console.cloud.google.com et collez-le dans src/calendar/googleCalendar.ts, puis réessayez.'
      );
      return;
    }
    setSyncing(true);
    try {
      const result = await promptAsync();
      if (result.type !== 'success' || !('authentication' in result) ) {
        setSyncing(false);
        return;
      }
      const token = (result as any).authentication?.accessToken ?? (result as any).params?.access_token;
      const today = new Date().toISOString().slice(0, 10);
      for (const it of items) {
        await createCalendarEvent(token, { title: `${it.rubrique} — ${it.action}`, date: today });
      }
      Alert.alert('Synchronisé', `${items.length} objectifs ajoutés à votre Google Agenda.`);
    } catch (e: any) {
      Alert.alert('Erreur de synchronisation', e.message ?? String(e));
    } finally {
      setSyncing(false);
    }
  };

  const openEdit = (r: ObjectifRow) => {
    setEditing(r);
    setIsNew(false);
    setShowModal(true);
  };
  const openAdd = () => {
    setEditing(null);
    setIsNew(true);
    setShowModal(true);
  };

  const handleSave = (values: Record<string, string>) => {
    upsertRow('objectifs', {
      id: editing?.id ?? String(Date.now()),
      rubrique: values.rubrique,
      action: values.action,
    });
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Objectifs 3 ans" subtitle="2e semestre 2026 · plan mensuel" />
      <ScrollView contentContainerStyle={styles.content}>
        {items.map((it) => {
          const style = rubriqueStyle[it.rubrique] ?? { bg: colors.background, color: colors.textPrimary };
          return (
            <TouchableOpacity key={it.id} style={[styles.item, { backgroundColor: style.bg }]} onPress={() => openEdit(it)}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rub, { color: style.color }]}>{it.rubrique}</Text>
                <Text style={[styles.action, { color: style.color }]}>{it.action}</Text>
              </View>
              <Ionicons name="create-outline" size={14} color={style.color} />
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.addButton} onPress={openAdd}>
          <Ionicons name="add" size={16} color={colors.blueAccent} />
          <Text style={styles.addButtonText}>Ajouter un objectif</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.calendarButton} onPress={handleSyncCalendar} disabled={syncing}>
          <Ionicons name="calendar-outline" size={16} color="#fff" />
          <Text style={styles.calendarButtonText}>
            {syncing ? 'Synchronisation…' : 'Synchroniser Google Agenda'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <RowFormModal
        visible={showModal}
        title={isNew ? 'Nouvel objectif' : 'Modifier l\'objectif'}
        fields={[
          { key: 'rubrique', label: 'Rubrique (Finance, Santé, Famille, Religion, Développement personnel)' },
          { key: 'action', label: 'Action / plan mensuel' },
        ]}
        initialValues={toValues(editing ?? undefined)}
        onCancel={() => setShowModal(false)}
        onSave={handleSave}
        onDelete={
          isNew
            ? undefined
            : () => {
                if (editing) deleteRow('objectifs', editing.id);
                setShowModal(false);
              }
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  item: { borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  rub: { fontSize: 13, fontWeight: '700', fontFamily: fonts.bold },
  action: { fontSize: 11, marginTop: 2, fontFamily: fonts.regular },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4, marginBottom: 10, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.cardBorder, backgroundColor: colors.card },
  addButtonText: { fontSize: 13, color: colors.blueAccent, fontWeight: '600' },
  calendarButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 10, backgroundColor: colors.headerTo },
  calendarButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
