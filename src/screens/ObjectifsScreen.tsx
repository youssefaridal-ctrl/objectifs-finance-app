import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import RowFormModal from '../components/RowFormModal';
import { colors, fonts } from '../theme';
import { useData, ObjectifRow } from '../store/DataContext';
import { isGoogleConfigured, useGoogleAuthRequest, createCalendarEvent } from '../calendar/googleCalendar';
import PlanMensuelView from './PlanMensuelView';
import PlanHebdoView from './PlanHebdoView';

const rubriqueStyle: Record<string, { bg: string; color: string }> = {
  Finance: { bg: colors.blueBg, color: colors.blueText },
  Santé: { bg: colors.greenBg, color: colors.greenText },
  Famille: { bg: colors.pinkBg, color: colors.pinkText },
  Religion: { bg: colors.purpleBg, color: colors.purpleText },
  'Développement personnel': { bg: colors.amberBg, color: colors.amberText },
};

function toValues(r?: ObjectifRow): Record<string, string> {
  return {
    rubrique: r?.rubrique ?? '',
    objectifGlobal: r?.objectifGlobal ?? '',
    periode: r?.periode ?? '',
    action: r?.action ?? '',
  };
}

function groupItems(items: ObjectifRow[]) {
  const groups: { rubrique: string; objectifGlobal: string; rows: ObjectifRow[] }[] = [];
  for (const it of items) {
    let g = groups.find((g) => g.rubrique === it.rubrique && g.objectifGlobal === it.objectifGlobal);
    if (!g) {
      g = { rubrique: it.rubrique, objectifGlobal: it.objectifGlobal, rows: [] };
      groups.push(g);
    }
    g.rows.push(it);
  }
  return groups;
}

const TABS = ['3 ans', 'Plan mensuel', 'Plan hebdo'] as const;

export default function ObjectifsScreen() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('3 ans');

  return (
    <View style={styles.container}>
      <ScreenHeader title="Objectifs" subtitle="Stratégie 3 ans · suivi mensuel · suivi hebdomadaire" />
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}
            onPress={() => setActiveTab(t)}
          >
            <Text style={[styles.tabBtnText, activeTab === t && styles.tabBtnTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {activeTab === '3 ans' && <TroisAnsView />}
      {activeTab === 'Plan mensuel' && <PlanMensuelView />}
      {activeTab === 'Plan hebdo' && <PlanHebdoView />}
    </View>
  );
}

function TroisAnsView() {
  const { data, upsertRow, deleteRow } = useData();
  const items = data.objectifs;
  const groups = groupItems(items);
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
      if (result.type !== 'success' || !('authentication' in result)) {
        setSyncing(false);
        return;
      }
      const token = (result as any).authentication?.accessToken ?? (result as any).params?.access_token;
      const today = new Date().toISOString().slice(0, 10);
      for (const it of items) {
        await createCalendarEvent(token, { title: `${it.rubrique} (${it.periode}) — ${it.action}`, date: today });
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
      objectifGlobal: values.objectifGlobal,
      periode: values.periode,
      action: values.action,
    });
    setShowModal(false);
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        {groups.map((g) => {
          const style = rubriqueStyle[g.rubrique] ?? { bg: colors.background, color: colors.textPrimary };
          return (
            <View key={g.rubrique + g.objectifGlobal} style={[styles.groupCard, { backgroundColor: style.bg }]}>
              <Text style={[styles.rubriqueLabel, { color: style.color }]}>{g.rubrique}</Text>
              <Text style={[styles.objectifGlobal, { color: style.color }]}>{g.objectifGlobal}</Text>
              {g.rows.map((row) => (
                <TouchableOpacity key={row.id} style={styles.periodRow} onPress={() => openEdit(row)}>
                  <Text style={[styles.periode, { color: style.color }]}>{row.periode}</Text>
                  <Text style={[styles.action, { color: style.color }]}>{row.action}</Text>
                  <Ionicons name="create-outline" size={13} color={style.color} />
                </TouchableOpacity>
              ))}
            </View>
          );
        })}

        <TouchableOpacity style={styles.addButton} onPress={openAdd}>
          <Ionicons name="add" size={16} color={colors.blueAccent} />
          <Text style={styles.addButtonText}>Ajouter une étape</Text>
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
        title={isNew ? 'Nouvelle étape' : "Modifier l'étape"}
        fields={[
          { key: 'rubrique', label: 'Rubrique (Finance, Santé, Famille, Religion, Développement personnel)' },
          { key: 'objectifGlobal', label: 'Objectif global' },
          { key: 'periode', label: 'Période (ex: 2e semestre 2026, Année 2028)' },
          { key: 'action', label: 'Action / plan' },
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
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  tabBar: { flexDirection: 'row', backgroundColor: colors.card, paddingHorizontal: 12, paddingTop: 10, gap: 8, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 4, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: colors.blueAccent },
  tabBtnText: { fontSize: 12, color: colors.textSecondary, fontFamily: fonts.regular },
  tabBtnTextActive: { color: colors.blueAccent, fontWeight: '700' },
  groupCard: { borderRadius: 10, padding: 12, marginBottom: 10 },
  rubriqueLabel: { fontSize: 13, fontWeight: '700', fontFamily: fonts.bold },
  objectifGlobal: { fontSize: 11, marginTop: 2, marginBottom: 8, fontFamily: fonts.regular, opacity: 0.9 },
  periodRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.07)' },
  periode: { fontSize: 11, fontWeight: '700', width: 110 },
  action: { fontSize: 11, flex: 1, fontFamily: fonts.regular },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4, marginBottom: 10, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.cardBorder, backgroundColor: colors.card },
  addButtonText: { fontSize: 13, color: colors.blueAccent, fontWeight: '600' },
  calendarButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 10, backgroundColor: colors.headerTo },
  calendarButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
