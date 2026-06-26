import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import Donut from '../components/Donut';
import { colors, fonts } from '../theme';
import { useData } from '../store/DataContext';

const palette = ['#85B7EB', '#97C459', '#F0997B', '#D4537E', '#7F77DD', '#B4B2A9', '#EF9F27', '#5DCAA5', '#ED93B1'];

export default function FinanceOverviewScreen() {
  const { data } = useData();
  const moisCourant = data.salaireMois[0];
  const categories = moisCourant?.categories ?? [];
  const salaireTotal = categories.reduce((s, r) => s + r.prevu, 0);
  const resteNonAffecte = (moisCourant?.salaireNet ?? 0) - salaireTotal;
  const creditRestant = data.credits.reduce((s, c) => s + c.montant, 0);
  const epargneCumulee = data.epargne.reduce((s, m) => s + m.reel, 0);

  const legend = categories.map((r, i) => ({ label: r.categorie, value: r.reel, color: palette[i % palette.length] }));

  return (
    <View style={styles.container}>
      <ScreenHeader title="Dashboard finance" subtitle="Salaire · crédits · épargne" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.gridTwo}>
          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>Salaire net</Text>
            <Text style={styles.metricValue}>{(moisCourant?.salaireNet ?? 0).toLocaleString()} DH</Text>
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
});
