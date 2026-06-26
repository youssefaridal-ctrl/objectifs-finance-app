import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 10, paddingVertical: 2, paddingHorizontal: 8, alignSelf: 'flex-start' },
  text: { fontSize: 10, fontWeight: '600' },
});
