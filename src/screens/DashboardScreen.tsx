import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import Badge from '../components/Badge';
import { colors, fonts } from '../theme';
import { useData } from '../store/DataContext';

const rubriques = [
  { label: 'Finance', icon: 'cash-outline', bg: colors.blueBg, color: colors.blueText },
  { label: 'Santé', icon: 'heart-outline', bg: colors.greenBg, color: colors.greenText },
  { label: 'Famille', icon: 'people-outline', bg: colors.pinkBg, color: colors.pinkText },
  { label: 'Religion', icon: 'moon-outline', bg: colors.purpleBg, color: colors.purpleText },
  { label: 'Dev. personnel', icon: 'book-outline', bg: colors.amberBg, color: colors.amberText },
];

export default function DashboardScreen() {
  const { data } = useData();
  const epargneCumulee = data.epargne.reduce((s, m) => s + m.reel, 0);
  const creditRestant = data.credits.reduce((s, c) => s + c.montant, 0);
  const mensualiteTotal = data.credits.reduce((s, c) => s + (c.duree > 0 ? c.montant / c.duree : 0), 0);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Tableau de bord global" subtitle="Bienvenue" showBell />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={[styles.alert, { backgroundColor: colors.blueBg, borderLeftWidth: 4, borderLeftColor: colors.blueAccent, borderRadius: 0, borderTopRightRadius: 10, borderBottomRightRadius: 10 }]}>
          <Text style={[styles.alertTitle, { color: colors.blueText }]}>Rapport mensuel disponible</Text>
          <Text style={styles.alertBody}>Vos économies du mois dernier ont augmenté. Le mois à venir s'annonce stable.</Text>
        </Card>

        <Card style={{ marginTop: 14 }}>
          <View style={styles.rowBetween}>
            <Text style={[styles.sectionTitle, { color: colors.amberText }]}>Objectifs plan 3 ans</Text>
          </View>
          <View style={{ marginBottom: 10 }}>
            <View style={styles.rowBetween}>
              <Text style={styles.progressLabel}>2e semestre 2026</Text>
              <Text style={[styles.progressValue, { color: colors.greenText }]}>32%</Text>
            </View>
            <ProgressBar percent={32} color="#639922" />
          </View>
          <View>
            <View style={styles.rowBetween}>
              <Text style={[styles.progressLabel, { color: colors.textMuted }]}>Objectif global 2028</Text>
              <Text style={[styles.progressValue, { color: colors.textMuted }]}>18%</Text>
            </View>
            <ProgressBar percent={18} color="#EF9F27" />
          </View>
        </Card>

        <Card style={{ marginTop: 14 }}>
          <Text style={[styles.sectionTitle, { color: colors.blueText, marginBottom: 8 }]}>Prochaine échéance</Text>
          <View style={styles.rowBetween}>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13 }}>Crédit — {Math.round(mensualiteTotal)} DH</Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary }}>5 juillet</Text>
          </View>
        </Card>

        <View style={styles.gridTwo}>
          <Card style={{ flex: 1, backgroundColor: colors.greenBg, borderColor: colors.greenBorder }}>
            <Text style={[styles.miniLabel, { color: colors.greenText }]}>ÉCONOMIES</Text>
            <Text style={[styles.miniValue, { color: colors.greenTextDark }]}>{epargneCumulee.toLocaleString()} DH</Text>
            <Badge label="Suivi en cours" bg={colors.successChipBg} color={colors.successChipText} />
          </Card>
          <Card style={{ flex: 1, backgroundColor: colors.redBg, borderColor: colors.redBorder }}>
            <Text style={[styles.miniLabel, { color: colors.redText }]}>DETTES CRÉDITS</Text>
            <Text style={[styles.miniValue, { color: colors.redTextDark }]}>{creditRestant.toLocaleString()} DH</Text>
            <Text style={{ fontSize: 10, color: colors.redText, fontFamily: fonts.regular }}>-{Math.round(mensualiteTotal).toLocaleString()} DH/mois</Text>
          </Card>
        </View>

        <Text style={[styles.sectionTitleStandalone, { color: colors.blueText }]}>Rubriques</Text>
        <View style={styles.rubriquesGrid}>
          {rubriques.map((r) => (
            <View key={r.label} style={[styles.rubriqueChip, { backgroundColor: r.bg }]}>
              <Ionicons name={r.icon as any} size={18} color={r.color} />
              <Text style={[styles.rubriqueLabel, { color: r.color }]}>{r.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  alert: { padding: 10 },
  alertTitle: { fontSize: 12, fontWeight: '600', fontFamily: fonts.bold },
  alertBody: { fontSize: 11, color: colors.textSecondary, marginTop: 4, fontFamily: fonts.regular },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 13, fontWeight: '600', fontFamily: fonts.bold },
  sectionTitleStandalone: { fontSize: 13, fontWeight: '600', fontFamily: fonts.bold, marginTop: 16, marginBottom: 8 },
  progressLabel: { fontSize: 11, fontWeight: '600', fontFamily: fonts.regular },
  progressValue: { fontSize: 11, fontWeight: '600' },
  gridTwo: { flexDirection: 'row', gap: 10, marginTop: 14 },
  miniLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  miniValue: { fontSize: 16, fontWeight: '700', marginVertical: 4 },
  rubriquesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rubriqueChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10 },
  rubriqueLabel: { fontSize: 11, fontWeight: '600' },
});
