import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import Donut from '../components/Donut';
import ProgressBar from '../components/ProgressBar';
import { colors, fonts } from '../theme';
import { useData } from '../store/DataContext';

const palette = ['#85B7EB', '#97C459', '#F0997B', '#D4537E', '#7F77DD', '#B4B2A9', '#EF9F27', '#5DCAA5', '#ED93B1'];

const rubriqueColor: Record<string, string> = {
  Finance: '#378ADD',
  Santé: '#639922',
  Famille: '#D4537E',
  Religion: '#7F77DD',
  'Développement personnel': '#BA7517',
};

export default function FinanceOverviewScreen() {
  const { data } = useData();
  const moisCourant = data.salaireMois[new Date().getMonth()] ?? data.salaireMois[0];
  const categories = moisCourant?.categories ?? [];
  const salaireNet = moisCourant?.salaireNet ?? 0;
  const salaireTotal = categories.reduce((s, r) => s + r.prevu, 0);
  const resteNonAffecte = salaireNet - salaireTotal;
  const creditRestant = data.credits.reduce((s, c) => s + c.montant, 0);
  const epargneCumulee = data.epargne.reduce((s, m) => s + m.reel, 0);

  const legend = categories.map((r, i) => ({ label: r.categorie, value: r.reel, color: palette[i % palette.length] }));

  const rubriques = Array.from(new Set(data.planMensuel.map((r) => r.rubrique)));
  const avancementParRubrique = rubriques.map((rub) => {
    const rows = data.planMensuel.filter((r) => r.rubrique === rub);
    const actions = rows.flatMap((r) => r.actions);
    const done = actions.filter((a) => a.fait).length;
    return { rubrique: rub, percent: Math.round((done / actions.length) * 100), done, total: actions.length };
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Dashboard finance" subtitle="Salaire · crédits · épargne" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.gridTwo}>
          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>Salaire net</Text>
            <Text style={styles.metricValue}>{salaireNet.toLocaleString()} DH</Text>
          </Card>
          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>Reste non affecté</Text>
            <Text style={styles.metricValue}>{resteNonAffecte.toLocaleString()} DH</Text>
          </Card>
          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>Crédit restant</Text>
            <Text style={styles.metricValue}>{creditRestant.toLocaleString()} DH</Text>
          </Card>
          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>Épargne cumulée</Text>
            <Text style={styles.metricValue}>{epargneCumulee.toLocaleString()} DH</Text>
          </Card>
        </View>

        <Card style={{ marginTop: 14, alignItems: 'center' }}>
          <Donut data={legend} />
          <View style={styles.legendWrap}>
            {legend.map((l) => (
              <View key={l.label} style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: l.color }]} />
                <Text style={styles.legendLabel}>{l.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Salaire — % prévu vs % réel</Text>
        <Card>
          {categories.map((c) => {
            const pctReel = salaireNet > 0 ? Math.round((c.reel / salaireNet) * 100) : 0;
            return (
              <View key={c.id} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{c.categorie}</Text>
                <Text style={styles.detailValue}>
                  Prévu {c.pourcentage}% · Réel {pctReel}%
                </Text>
              </View>
            );
          })}
        </Card>

        <Text style={styles.sectionTitle}>Crédits — avancement</Text>
        <Card>
          {data.credits.map((c) => {
            const avancement = c.duree > 0 ? Math.round((c.moisPayes / c.duree) * 100) : 0;
            return (
              <View key={c.id} style={{ marginBottom: 8 }}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{c.nom}</Text>
                  <Text style={styles.detailValue}>{avancement}% ({c.moisPayes}/{c.duree} mois)</Text>
                </View>
                <ProgressBar percent={avancement} color="#F0997B" />
              </View>
            );
          })}
        </Card>

        <Text style={styles.sectionTitle}>Avancement du plan mensuel par rubrique</Text>
        <Card>
          {avancementParRubrique.map((r) => (
            <View key={r.rubrique} style={{ marginBottom: 8 }}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{r.rubrique}</Text>
                <Text style={styles.detailValue}>{r.percent}% ({r.done}/{r.total})</Text>
              </View>
              <ProgressBar percent={r.percent} color={rubriqueColor[r.rubrique] ?? '#378ADD'} />
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  gridTwo: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard: { width: '47%' },
  metricLabel: { fontSize: 11, color: colors.textSecondary, fontFamily: fonts.regular },
  metricValue: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  legendWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 10, color: colors.textSecondary, fontFamily: fonts.regular },
  sectionTitle: { fontSize: 13, fontWeight: '600', fontFamily: fonts.bold, color: colors.textSecondary, marginTop: 18, marginBottom: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  detailLabel: { fontSize: 12, fontWeight: '600', fontFamily: fonts.bold },
  detailValue: { fontSize: 11, color: colors.textSecondary, fontFamily: fonts.regular },
});
