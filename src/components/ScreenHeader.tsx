import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts } from '../theme';

export default function ScreenHeader({
  title,
  subtitle,
  showBell,
}: {
  title: string;
  subtitle?: string;
  showBell?: boolean;
}) {
  return (
    <LinearGradient colors={[colors.headerFrom, colors.headerTo]} style={styles.header}>
      <View>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {showBell ? (
        <View>
          <Ionicons name="notifications-outline" size={22} color="#fff" />
          <View style={styles.dot} />
        </View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtitle: { color: '#ffffffbf', fontSize: 12, fontFamily: fonts.regular },
  title: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 2, fontFamily: fonts.bold },
  dot: {
    position: 'absolute',
    top: -3,
    right: -5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
});
