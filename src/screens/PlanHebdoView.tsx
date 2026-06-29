import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import RowFormModal from '../components/RowFormModal';
import { colors, fonts } from '../theme';
import { useData, PlanHebdoRow } from '../store/DataContext';

const rubriqueStyle: Record<string, { bg: string; color: string }> = {
  Finance: { bg: colors.blueBg, color: colors.blueText },
  Santé: { bg: colors.greenBg, color: colors.greenText },
  Famille: { bg: colors.pinkBg, color: colors.pinkText },
  Religion: { bg: colors.purpleBg, color: colors.purpleText },
  'Développement personnel': { bg: colors.amberBg, color: colors.amberText },
};

const SEMESTRE_DEBUT = new Date(2026, 5, 29); // lundi de la semaine 1 du plan S2 2026

function getCurrentWeekIndex(): number {
  const diffDays = Math.floor((Date.now() - SEMESTRE_DEBUT.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(25, Math.max(0, Math.floor(diffDays / 7)));
}

const MOIS_GROUPES = [
  { label: 'Juillet', size: 4 },
  { label: 'Août', size: 5 },
  { label: 'Septembre', size: 4 },
  { label: 'Octobre', size: 5 },
  { label: 'Novembre', size: 4 },
  { label: 'Décembre', size: 4 },
];

function getStreak(semaines: boolean[], currentWeekIndex: number): number {
  let streak = 0;
  for (let i = currentWeekIndex - 1; i >= 0; i--) {
    if (semaines[i]) streak++;
    else break;
  }
  return streak;
}

function toValues(r?: PlanHebdoRow): Record<string, string> {
  return { rubrique: r?.rubrique ?? '', action: r?.action ?? '' };
}

export default function PlanHebdoView() {
  const { data, toggleSemaineHebdo, upsertPlanHebdoRow, deletePlanHebdoRow } = useData();
  const currentWeekIndex = getCurrentWeekIndex();
  const [editing, setEditing] = useState<PlanHebdoRow | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const openEdit = (r: PlanHebdoRow) => {
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
    upsertPlanHebdoRow(isNew ? null : editing?.id ?? null, values.rubrique, values.action);
    setShowModal(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {data.planHebdo.map((row) => {
        const style = rubriqueStyle[row.rubrique] ?? { bg: colors.background, color: colors.textPrimary };
        const doneCount = row.semaines.filter(Boolean).length;
        const reussite = Math.round((doneCount / row.semaines.length) * 100);
        const streak = getStreak(row.semaines, currentWeekIndex);

        let weekCursor = 0;

        return (
          <Card key={row.id} style={{ marginBottom: 10 }}>
            <View style={styles.headerRow}>
              <View style={[styles.rubriquePill, { backgroundColor: style.bg }]}>
                <Text style={[styles.rubriquePillText, { color: style.color }]}>{row.rubrique}</Text>
              </View>
              <View style={styles.headerRight}>
                <Text style={styles.reussite}>{doneCount}/26 · {reussite}%</Text>
                <TouchableOpacity onPress={() => openEdit(row)}>
                  <Ionicons name="create-outline" size={14} color={colors.blueAccent} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.actionText}>{row.action}</Text>

            <TouchableOpacity
              style={[styles.currentWeekBox, { backgroundColor: style.bg }]}
              onPress={() => toggleSemaineHebdo(row.id, currentWeekIndex)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.currentWeekLabel, { color: style.color }]}>
                  Semaine actuelle · S{currentWeekIndex + 1}
                </Text>
                {streak > 0 && (
                  <Text style={[styles.streakLabel, { color: style.color }]}>
                    {streak} semaine{streak > 1 ? 's' : ''} de suite
                  </Text>
                )}
              </View>
              <Ionicons
                name={row.semaines[currentWeekIndex] ? 'checkbox' : 'square-outline'}
                size={22}
                color={style.color}
              />
            </TouchableOpacity>

            {MOIS_GROUPES.map((groupe) => {
              const start = weekCursor;
              weekCursor += groupe.size;
              const indices = Array.from({ length: groupe.size }, (_, k) => start + k);
              return (
                <View key={groupe.label} style={styles.moisGroupe}>
                  <Text style={styles.moisLabel}>{groupe.label}</Text>
                  <View style={styles.weekGrid}>
                    {indices.map((i) => (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.weekCell,
                          {
                            backgroundColor: row.semaines[i] ? style.color : colors.background,
                            borderColor: style.color,
                            opacity: i === currentWeekIndex ? 1 : 0.7,
                          },
                          i === currentWeekIndex && styles.weekCellCurrent,
                        ]}
                        onPress={() => toggleSemaineHebdo(row.id, i)}
                      >
                        <Text style={[styles.weekCellText, { color: row.semaines[i] ? '#fff' : colors.textMuted }]}>
                          {i + 1}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}
          </Card>
        );
      })}

      <TouchableOpacity style={styles.addButton} onPress={openAdd}>
        <Ionicons name="add" size={16} color={colors.blueAccent} />
        <Text style={styles.addButtonText}>Ajouter un objectif hebdo</Text>
      </TouchableOpacity>

      <RowFormModal
        visible={showModal}
        title={isNew ? 'Nouvel objectif hebdo' : "Modifier l'objectif"}
        fields={[
          { key: 'rubrique', label: 'Rubrique (Finance, Santé, Famille, Religion, Développement personnel)' },
          { key: 'action', label: 'Action / habitude à suivre' },
        ]}
        initialValues={toValues(editing ?? undefined)}
        onCancel={() => setShowModal(false)}
        onSave={handleSave}
        onDelete={
          isNew
            ? undefined
            : () => {
                if (editing) deletePlanHebdoRow(editing.id);
                setShowModal(false);
              }
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rubriquePill: { borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8 },
  rubriquePillText: { fontSize: 11, fontWeight: '700' },
  reussite: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  actionText: { fontSize: 12, color: colors.textSecondary, fontFamily: fonts.regular, marginBottom: 10 },
  currentWeekBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 10, marginBottom: 10 },
  currentWeekLabel: { fontSize: 12, fontWeight: '700', fontFamily: fonts.bold },
  streakLabel: { fontSize: 10, marginTop: 2, fontFamily: fonts.regular },
  moisGroupe: { marginBottom: 6 },
  moisLabel: { fontSize: 9, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 3, fontFamily: fonts.regular },
  weekGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  weekCell: { width: 22, height: 22, borderRadius: 4, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  weekCellCurrent: { borderWidth: 2 },
  weekCellText: { fontSize: 8, fontWeight: '700' },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.cardBorder, backgroundColor: colors.card },
  addButtonText: { fontSize: 13, color: colors.blueAccent, fontWeight: '600' },
});
