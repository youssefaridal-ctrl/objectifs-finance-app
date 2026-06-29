import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from '../components/Card';
import { colors, fonts } from '../theme';
import { useData } from '../store/DataContext';

const rubriqueStyle: Record<string, { bg: string; color: string }> = {
  Finance: { bg: colors.blueBg, color: colors.blueText },
  Santé: { bg: colors.greenBg, color: colors.greenText },
  Famille: { bg: colors.pinkBg, color: colors.pinkText },
  Religion: { bg: colors.purpleBg, color: colors.purpleText },
  'Développement personnel': { bg: colors.amberBg, color: colors.amberText },
};

export default function PlanHebdoView() {
  const { data, toggleSemaineHebdo } = useData();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {data.planHebdo.map((row) => {
        const style = rubriqueStyle[row.rubrique] ?? { bg: colors.background, color: colors.textPrimary };
        const doneCount = row.semaines.filter(Boolean).length;
        const reussite = Math.round((doneCount / row.semaines.length) * 100);
        return (
          <Card key={row.id} style={{ marginBottom: 10 }}>
            <View style={styles.headerRow}>
              <View style={[styles.rubriquePill, { backgroundColor: style.bg }]}>
                <Text style={[styles.rubriquePillText, { color: style.color }]}>{row.rubrique}</Text>
              </View>
              <Text style={styles.reussite}>{doneCount}/26 · {reussite}%</Text>
            </View>
            <Text style={styles.actionText}>{row.action}</Text>
            <View style={styles.weekGrid}>
              {row.semaines.map((done, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.weekCell,
                    { backgroundColor: done ? style.color : colors.background, borderColor: style.color },
                  ]}
                  onPress={() => toggleSemaineHebdo(row.id, i)}
                >
                  <Text style={[styles.weekCellText, { color: done ? '#fff' : colors.textMuted }]}>{i + 1}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  rubriquePill: { borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8 },
  rubriquePillText: { fontSize: 11, fontWeight: '700' },
  reussite: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  actionText: { fontSize: 12, color: colors.textSecondary, fontFamily: fonts.regular, marginBottom: 8 },
  weekGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  weekCell: { width: 22, height: 22, borderRadius: 4, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  weekCellText: { fontSize: 8, fontWeight: '700' },
});
