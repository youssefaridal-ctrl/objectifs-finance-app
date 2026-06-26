import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function ProgressBar({ percent, color }: { percent: number; color: string }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, percent))}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: 4, backgroundColor: '#eeeeee', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});
