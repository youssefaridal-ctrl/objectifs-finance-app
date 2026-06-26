import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import CompareBar from '../components/CompareBar';
import RowFormModal from '../components/RowFormModal';
import { colors, fonts } from '../theme';
import { useData, CreditRow } from '../store/DataContext';

function toValues(r?: CreditRow): Record<string, string> {
  return {
    nom: r?.nom ?? '',
    montant: r ? String(r.montant) : '',
    taux: r ? String(r.taux) : '5',
    duree: r ? String(r.duree) : '',
    moisPayes: r ? String(r.moisPayes) : '0',
  };
}

export default function CreditsScreen() {
  const { data, upsertRow, deleteRow } = useData();
  const credits = data.credits;
  const [editing, setEditing] = useState<CreditRow | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const total2026 = credits.filter((c) => c.duree <= 7).reduce((s, c) => s + c.montant, 0);
  const total2027 = credits.filter((c) => c.duree > 7).reduce((s, c) => s + c.montant, 0);

  const openEdit = (r: CreditRow) => {
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
    if (!values.nom.trim()) return;
    upsertRow('credits', {
      id: editing?.id ?? String(Date.now()),
      nom: values.nom,
      montant: Number(values.montant) || 0,
      taux: Number(values.taux) || 0,
      duree: Number(values.duree) || 0,
      moisPayes: Math.min(Number(values.moisPayes) || 0, Number(values.duree) || 0),
    });
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Gestion des crédits" subtitle={`${credits.length} crédits en cours`} />
      <ScrollView contentContainerStyle={styles.content}>
        {credits.map((c) => {
          const paye = c.duree > 0 ? (c.montant / c.duree) * c.moisPayes : 0;
          return (
            <Card key={c.id} style={{ marginBottom: 10 }}>
              <View style={styles.rowBetween}>
                <Text style={styles.nom}>{c.nom}</Text>
                <TouchableOpacity onPress={() => openEdit(c)}>
                  <Ionicons name="create-outline" size={14} color={colors.blueAccent} />
                </TouchableOpacity>
              </View>
              <Text style={styles.meta}>{c.montant.toLocaleString()} DH · {c.taux}% · {c.moisPayes}/{c.duree} mois</Text>
              <CompareBar
                doneValue={paye}
                totalValue={c.montant}
                doneColor="#D4537E"
                doneLabel="Réglé"
                remainingLabel="Reste à payer"
              />
            </Card>
          );
        })}

        <Card style={styles.totalsCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.totalsLabel}>Total 2026</Text>
            <Text style={styles.totalsValue}>{total2026.toLocaleString()} DH</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.totalsLabel}>Total 2027</Text>
            <Text style={styles.totalsValue}>{total2027.toLocaleString()} DH</Text>
          </View>
          <View style={[styles.rowBetween, { marginTop: 4, borderTopWidth: 1, borderTopColor: colors.cardBorder, paddingTop: 6 }]}>
            <Text style={[styles.totalsLabel, { fontWeight: '700' }]}>Global</Text>
            <Text style={[styles.totalsValue, { fontWeight: '700' }]}>{(total2026 + total2027).toLocaleString()} DH</Text>
          </View>
        </Card>

        <TouchableOpacity style={styles.addButton} onPress={openAdd}>
          <Ionicons name="add" size={16} color={colors.blueAccent} />
          <Text style={styles.addButtonText}>Ajouter un crédit</Text>
        </TouchableOpacity>
      </ScrollView>

      <RowFormModal
        visible={showModal}
        title={isNew ? 'Nouveau crédit' : 'Modifier le crédit'}
        fields={[
          { key: 'nom', label: 'Nom' },
          { key: 'montant', label: 'Montant (DH)', keyboardType: 'numeric' },
          { key: 'taux', label: 'Taux annuel (%)', keyboardType: 'numeric' },
          { key: 'duree', label: 'Durée (mois)', keyboardType: 'numeric' },
          { key: 'moisPayes', label: 'Mois déjà payés', keyboardType: 'numeric' },
        ]}
        initialValues={toValues(editing ?? undefined)}
        onCancel={() => setShowModal(false)}
        onSave={handleSave}
        onDelete={
          isNew
            ? undefined
            : () => {
                if (editing) deleteRow('credits', editing.id);
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
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  nom: { fontSize: 13, fontWeight: '600', fontFamily: fonts.bold },
  meta: { fontSize: 11, color: colors.textSecondary, marginBottom: 6, fontFamily: fonts.regular },
  progressLabel: { fontSize: 10, color: colors.textSecondary, fontFamily: fonts.regular },
  totalsCard: { marginTop: 4, marginBottom: 14 },
  totalsLabel: { fontSize: 12, fontFamily: fonts.regular },
  totalsValue: { fontSize: 12, fontFamily: fonts.regular },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.cardBorder, backgroundColor: colors.card },
  addButtonText: { fontSize: 13, color: colors.blueAccent, fontWeight: '600' },
});
