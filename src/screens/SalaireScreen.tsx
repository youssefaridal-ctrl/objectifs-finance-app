import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import RowFormModal from '../components/RowFormModal';
import { colors, fonts } from '../theme';
import { useData, SalaireRow, moisSuivant } from '../store/DataContext';

function toValues(r?: SalaireRow): Record<string, string> {
  return {
    categorie: r?.categorie ?? '',
    pourcentage: r ? String(r.pourcentage) : '',
    prevu: r ? String(r.prevu) : '',
    reel: r ? String(r.reel) : '',
  };
}

export default function SalaireScreen() {
  const { data, upsertSalaireCategorie, deleteSalaireCategorie, cloturerMoisSalaire } = useData();
  const [moisCourant, ...historique] = data.salaireMois;
  const rows = moisCourant?.categories ?? [];
  const [editing, setEditing] = useState<SalaireRow | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const totalPrevu = rows.reduce((s, r) => s + r.prevu, 0);
  const totalReel = rows.reduce((s, r) => s + r.reel, 0);
  const resteNonAffecte = (moisCourant?.salaireNet ?? 0) - totalPrevu;

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
    if (!moisCourant) return;
    upsertSalaireCategorie(moisCourant.id, {
      id: editing?.id ?? String(Date.now()),
      categorie: values.categorie,
      pourcentage: Number(values.pourcentage) || 0,
      prevu: Number(values.prevu) || 0,
      reel: Number(values.reel) || 0,
    });
    setShowModal(false);
  };

  const handleCloturer = () => {
    Alert.alert(
      `Clôturer ${moisCourant?.mois} ?`,
      `${moisCourant?.mois} passera dans l'historique et ${moisSuivant(moisCourant?.mois ?? '')} deviendra le mois actif (montants réels réinitialisés à 0).`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Clôturer', onPress: cloturerMoisSalaire },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Répartition du salaire" subtitle={`${moisCourant?.mois ?? ''} · ${(moisCourant?.salaireNet ?? 0).toLocaleString()} DH`} />
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
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={[styles.cell, { flex: 2, fontWeight: '700', color: resteNonAffecte < 0 ? colors.danger : colors.greenText }]}>
              Reste non affecté
            </Text>
            <Text style={{ flex: 3, textAlign: 'right', fontSize: 12, fontWeight: '700', color: resteNonAffecte < 0 ? colors.danger : colors.greenText }}>
              {resteNonAffecte.toLocaleString()} DH
            </Text>
            <View style={{ width: 20 }} />
          </View>
        </Card>

        <TouchableOpacity style={styles.addButton} onPress={openAdd}>
          <Ionicons name="add" size={16} color={colors.blueAccent} />
          <Text style={styles.addButtonText}>Ajouter une catégorie</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cloturerButton} onPress={handleCloturer}>
          <Ionicons name="arrow-down-circle-outline" size={16} color="#fff" />
          <Text style={styles.cloturerButtonText}>
            Clôturer {moisCourant?.mois} → passer à {moisSuivant(moisCourant?.mois ?? '')}
          </Text>
        </TouchableOpacity>

        {historique.length > 0 && (
          <View style={styles.historiqueSection}>
            <Text style={styles.historiqueTitle}>Mois précédents</Text>
            {historique.map((m) => {
              const tp = m.categories.reduce((s, c) => s + c.prevu, 0);
              const tr = m.categories.reduce((s, c) => s + c.reel, 0);
              return (
                <Card key={m.id} style={{ marginBottom: 8 }}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.historiqueMois}>{m.mois}</Text>
                    <Text style={styles.historiqueValeurs}>
                      Prévu {tp.toLocaleString()} DH · Réel {tr.toLocaleString()} DH
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
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
          isNew || !moisCourant
            ? undefined
            : () => {
                if (editing) deleteSalaireCategorie(moisCourant.id, editing.id);
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
  cloturerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10, paddingVertical: 12, borderRadius: 10, backgroundColor: colors.headerTo },
  cloturerButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  historiqueSection: { marginTop: 20 },
  historiqueTitle: { fontSize: 13, fontWeight: '600', fontFamily: fonts.bold, color: colors.textSecondary, marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historiqueMois: { fontSize: 13, fontWeight: '600', fontFamily: fonts.bold },
  historiqueValeurs: { fontSize: 11, color: colors.textSecondary, fontFamily: fonts.regular },
});
