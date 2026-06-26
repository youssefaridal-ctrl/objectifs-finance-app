import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import CompareBar from '../components/CompareBar';
import Badge from '../components/Badge';
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

  const cumul = mois.reduce((s, m) => s + m.reel, 0);
  const totalPrevu = mois.reduce((s, m) => s + m.prevu, 0);
  const ecart = cumul - totalPrevu;

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
      <ScreenHeader title="Gestion de l'épargne" subtitle="Suivi mensuel" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={{ backgroundColor: colors.greenBg, borderColor: colors.greenBorder, marginBottom: 14 }}>
          <View style={styles.rowBetween}>
            <Text style={[styles.objectifTitle, { color: colors.greenText }]}>Objectif annuel</Text>
            <Text style={[styles.objectifEcart, { color: ecart >= 0 ? colors.greenText : colors.redText }]}>
              {ecart >= 0 ? '+' : ''}{ecart.toLocaleString()} DH
            </Text>
          </View>
          <CompareBar
            doneValue={cumul}
            totalValue={totalPrevu}
            doneColor="#3b6d11"
            doneLabel="Épargné"
            remainingLabel="Objectif restant"
          />
        </Card>

        {mois.map((m) => {
          const atteint = m.reel >= m.prevu && m.prevu > 0;
          return (
            <TouchableOpacity key={m.id} onPress={() => openEdit(m)}>
              <Card style={{ marginBottom: 10 }}>
                <View style={styles.rowBetween}>
                  <View style={styles.moisHeader}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.moisLabel}>{m.mois}</Text>
                  </View>
                  {m.prevu > 0 && (
                    <Badge
                      label={atteint ? 'Objectif atteint' : 'En cours'}
                      bg={atteint ? colors.successChipBg : colors.amberChipBg}
                      color={atteint ? colors.successChipText : colors.amberChipText}
                    />
                  )}
                </View>
                <CompareBar
                  doneValue={m.reel}
                  totalValue={m.prevu}
                  doneColor={atteint ? '#639922' : '#EF9F27'}
                  doneLabel="Réel"
                  remainingLabel="Prévu restant"
                />
              </Card>
            </TouchableOpacity>
          );
        })}
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
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  objectifTitle: { fontSize: 13, fontWeight: '700', fontFamily: fonts.bold },
  objectifEcart: { fontSize: 13, fontWeight: '700' },
  moisHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  moisLabel: { fontSize: 13, fontWeight: '600', fontFamily: fonts.bold },
});
