import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import RowFormModal from '../components/RowFormModal';
import { colors, fonts } from '../theme';
import { useData, EpargneRow } from '../store/DataContext';

function toValues(r?: EpargneRow): Record<string, string> {
  return {
    mois: r?.mois ?? '',
    prevu: r ? String(r.prevu) : '',
    reel: r ? String(r.reel) : '',
  };
}

export default function EpargneScreen() {
  const { data, upsertRow, deleteRow } = useData();
  const mois = data.epargne;
  const [editing, setEditing] = useState<EpargneRow | null>(null);
  const [showModal, setShowModal] = useState(false);

  const max = Math.max(1000, ...mois.map((m) => m.reel));
  const cumul = mois.reduce((s, m) => s + m.reel, 0);
  const ecart = mois.reduce((s, m) => s + (m.reel - m.prevu), 0);

  const openEdit = (r: EpargneRow) => {
    setEditing(r);
    setShowModal(true);
  };

  const handleSave = (values: Record<string, string>) => {
    if (!editing) return;
    upsertRow('epargne', {
      id: editing.id,
      mois: editing.mois,
      prevu: Number(values.prevu) || 0,
      reel: Number(values.reel) || 0,
    });
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Gestion de l'épargne" subtitle="Objectif mensuel : 1 000 DH" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.chart}>
            {mois.map((m) => (
              <TouchableOpacity key={m.id} style={styles.barCol} onPress={() => openEdit(m)}>
                <View style={[styles.bar, { height: (m.reel / max) * 90 || 2 }]} />
                <Text style={styles.barLabel}>{m.mois.slice(0, 3)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.hint}>Touchez un mois pour le modifier</Text>
        </Card>

        <View style={styles.gridTwo}>
          <Card style={{ flex: 1, backgroundColor: colors.greenBg, borderColor: colors.greenBorder }}>
            <Text style={[styles.miniLabel, { color: colors.greenText }]}>CUMUL ANNÉE</Text>
            <Text style={[styles.miniValue, { color: colors.greenTextDark }]}>{cumul.toLocaleString()} DH</Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>ÉCART</Text>
            <Text style={[styles.miniValue, { color: colors.textPrimary }]}>{ecart.toLocaleString()} DH</Text>
          </Card>
        </View>
      </ScrollView>

      <RowFormModal
        visible={showModal}
        title={editing ? `Épargne — ${editing.mois}` : ''}
        fields={[
          { key: 'prevu', label: 'Prévu (DH)', keyboardType: 'numeric' },
          { key: 'reel', label: 'Réel (DH)', keyboardType: 'numeric' },
        ]}
        initialValues={toValues(editing ?? undefined)}
        onCancel={() => setShowModal(false)}
        onSave={handleSave}
        onDelete={
          editing
            ? () => {
                deleteRow('epargne', editing.id);
                setShowModal(false);
              }
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 120, justifyContent: 'space-between' },
  barCol: { alignItems: 'center', flex: 1 },
  bar: { width: 10, backgroundColor: '#639922', borderRadius: 3, marginBottom: 4 },
  barLabel: { fontSize: 8, color: colors.textMuted, fontFamily: fonts.regular },
  hint: { fontSize: 10, color: colors.textMuted, textAlign: 'center', marginTop: 8, fontFamily: fonts.regular },
  gridTwo: { flexDirection: 'row', gap: 10, marginTop: 14 },
  miniLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  miniValue: { fontSize: 16, fontWeight: '700', marginVertical: 4 },
});
