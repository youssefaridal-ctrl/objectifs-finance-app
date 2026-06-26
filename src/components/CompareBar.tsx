import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

export default function CompareBar({
  doneValue,
  totalValue,
  doneColor,
  doneLabel,
  remainingLabel,
  unit = 'DH',
}: {
  doneValue: number;
  totalValue: number;
  doneColor: string;
  doneLabel: string;
  remainingLabel: string;
  unit?: string;
}) {
  const total = Math.max(totalValue, doneValue, 1);
  const donePct = Math.min(100, Math.max(0, (doneValue / total) * 100));
  const remaining = Math.max(0, totalValue - doneValue);

  return (
    <View>
      <View style={styles.track}>
        <View style={[styles.doneFill, { width: `${donePct}%`, backgroundColor: doneColor }]} />
      </View>
      <View style={styles.labelsRow}>
        <Text style={[styles.label, { color: doneColor }]}>
          {doneLabel}: {Math.round(doneValue).toLocaleString()} {unit}
        </Text>
        <Text style={styles.labelMuted}>
          {remainingLabel}: {Math.round(remaining).toLocaleString()} {unit}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 14, borderRadius: 7, backgroundColor: colors.cardBorder, overflow: 'hidden' },
  doneFill: { height: '100%', borderRadius: 7 },
  labelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  label: { fontSize: 10, fontWeight: '700', fontFamily: fonts.bold },
  labelMuted: { fontSize: 10, color: colors.textMuted, fontFamily: fonts.regular },
});
