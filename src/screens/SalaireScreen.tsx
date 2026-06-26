import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import RowFormModal from '../components/RowFormModal';
import { colors, fonts } from '../theme';
import { useData, SalaireRow } from '../store/DataContext';

function toValues(r?: SalaireRow): Record<string, string> {
  return {
    categorie: r?.categorie ?? '',
    pourcentage: r ? String(r.pourcentage) : '',
    prevu: r ? String(r.prevu) : '',
    reel: r ? String(r.reel) : '',
  };
}

export default function SalaireScreen() {
  const { data, upsertRow, deleteRow } = useData();
  const rows = data.salaire;
  const [editing, setEditing] = useState<SalaireRow | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const totalPrevu = rows.reduce((s, r) => s + r.prevu, 0);
  const totalReel = rows.reduce((s, r) => s + r.reel, 0);

  const openEdit = (r: SalaireRow) => {
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
    upsertRow('salaire', {
      id: editing?.id ?? String(Date.now()),
      categorie: values.categorie,
      pourcentage: Number(values.pourcentage) || 0,
      prevu: Number(values.prevu) || 0,
      reel: Number(values.reel) || 0,
    });
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Répartition du salaire" subtitle="Mai · 10 000 DH" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.headerRow}>
            <Text style={[styles.th, { flex: 2 }]}>Catégorie</Text>
            <Text style={styles.th}>%</Text>
            <Text style={styles.th}>Prévu</Text>
            <Text style={styles.th}>Réel</Text>
            <Text style={[styles.th, { width: 20 }]}> </Text>
          </View>
          {rows.map((r) => (
            <View key={r.id} style={styles.row}>
              <Text style={[styles.cell, { flex: 2, fontWeight: '600' }]}>{r.categorie}</Text>
              <Text style={styles.cell}>{r.pourcentage}%</Text>
              <Text style={styles.cell}>{r.prevu}</Text>
              <Text style={[styles.cell, r.reel > r.prevu ? { color: colors.danger } : null]}>{r.reel}</Text>
              <TouchableOpacity style={{ width: 20 }} onPress={() => openEdit(r)}>
                <Ionicons name="create-outline" size={14} color={colors.blueAccent} />
              </TouchableOpacity>
            </View>
          ))}
          <View style={[styles.row, styles.totalRow]}>
            <Text style={[styles.cell, { flex: 2, fontWeight: '700' }]}>Total</Text>
            <Text style={[styles.cell, { fontWeight: '700' }]}>{rows.reduce((s, r) => s + r.pourcentage, 0)}%</Text>
            <Text style={[styles.cell, { fontWeight: '700' }]}>{totalPrevu}</Text>
            <Text style={[styles.cell, { fontWeight: '700' }]}>{totalReel}</Text>
            <View style={{ width: 20 }} />
          </View>
        </Card>

        <TouchableOpacity style={styles.addButton} onPress={openAdd}>
          <Ionicons name="add" size={16} color={colors.blueAccent} />
          <Text style={styles.addButtonText}>Ajouter une catégorie</Text>
        </TouchableOpacity>
      </ScrollView>

      <RowFormModal
        visible={showModal}
        title={isNew ? 'Nouvelle catégorie' : 'Modifier la catégorie'}
        fields={[
          { key: 'categorie', label: 'Catégorie' },
          { key: 'pourcentage', label: 'Pourcentage (%)', keyboardType: 'numeric' },
          { key: 'prevu', label: 'Montant prévu (DH)', keyboardType: 'numeric' },
          { key: 'reel', label: 'Montant réel (DH)', keyboardType: 'numeric' },
        ]}
        initialValues={toValues(editing ?? undefined)}
        onCancel={() => setShowModal(false)}
        onSave={handleSave}
        onDelete={
          isNew
            ? undefined
            : () => {
                if (editing) deleteRow('salaire', editing.id);
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
  headerRow: { flexDirection: 'row', paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  th: { flex: 1, fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', fontFamily: fonts.regular },
  row: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5', alignItems: 'center' },
  cell: { flex: 1, fontSize: 12, fontFamily: fonts.regular },
  totalRow: { borderBottomWidth: 0, borderTopWidth: 1, borderTopColor: colors.cardBorder, marginTop: 4 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.cardBorder, backgroundColor: colors.card },
  addButtonText: { fontSize: 13, color: colors.blueAccent, fontWeight: '600' },
});
