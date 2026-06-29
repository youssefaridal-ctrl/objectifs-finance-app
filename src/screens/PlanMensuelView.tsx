import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

export default function PlanMensuelView() {
  const { data, togglePlanMensuelAction } = useData();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {data.planMensuel.map((row) => {
        const style = rubriqueStyle[row.rubrique] ?? { bg: colors.background, color: colors.textPrimary };
        const doneCount = row.actions.filter((a) => a.fait).length;
        const avancement = Math.round((doneCount / row.actions.length) * 100);
        return (
          <Card key={row.id} style={{ marginBottom: 10 }}>
            <View style={styles.headerRow}>
              <View style={[styles.rubriquePill, { backgroundColor: style.bg }]}>
                <Text style={[styles.rubriquePillText, { color: style.color }]}>{row.rubrique}</Text>
              </View>
              <Text style={styles.avancement}>{avancement}%</Text>
            </View>
            <Text style={styles.sousRubrique}>{row.sousRubrique}</Text>
            {row.actions.map((a, i) => (
              <TouchableOpacity
                key={a.mois}
                style={styles.actionRow}
                onPress={() => togglePlanMensuelAction(row.id, i)}
              >
                <Ionicons
                  name={a.fait ? 'checkbox' : 'square-outline'}
                  size={16}
                  color={a.fait ? style.color : colors.textMuted}
                />
                <Text style={styles.moisLabel}>{a.mois}</Text>
                <Text
                  style={[styles.actionText, a.fait ? { textDecorationLine: 'line-through', opacity: 0.5 } : null]}
                >
                  {a.action}
                </Text>
              </TouchableOpacity>
            ))}
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
  avancement: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  sousRubrique: { fontSize: 12, color: colors.textSecondary, fontFamily: fonts.regular, marginBottom: 8 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  moisLabel: { fontSize: 11, fontWeight: '700', width: 64, fontFamily: fonts.bold },
  actionText: { fontSize: 11, flex: 1, fontFamily: fonts.regular, color: colors.textPrimary },
});
