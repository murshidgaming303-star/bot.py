import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

const formatBytes = bytes => {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1048576)    return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
};

const formatDuration = ms => {
  if (!ms) return '00:00:00';
  const total = Math.floor((Date.now() - ms) / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const StatBox = ({ icon, label, value }) => (
  <View style={styles.box}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

export default function ConnectionStats({ connectedAt, bytesIn, bytesOut, isConnected }) {
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    if (!isConnected || !connectedAt) return;
    const id = setInterval(() => setElapsed(formatDuration(connectedAt)), 1000);
    return () => clearInterval(id);
  }, [isConnected, connectedAt]);

  if (!isConnected) return null;

  return (
    <View style={styles.row}>
      <StatBox icon="⬇" label="Download" value={formatBytes(bytesIn)}  />
      <View style={styles.divider} />
      <StatBox icon="⏱"  label="Duration" value={elapsed}              />
      <View style={styles.divider} />
      <StatBox icon="⬆" label="Upload"   value={formatBytes(bytesOut)} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: '#0F1E35',
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#1E3350',
    marginHorizontal: spacing.md,
  },
  box: { alignItems: 'center', flex: 1 },
  icon:  { fontSize: 18, marginBottom: 4 },
  value: { color: colors.text,    fontSize: 14, fontWeight: '700' },
  label: { color: colors.textSub, fontSize: 11, marginTop: 2 },
  divider: {
    width: 1, height: 36,
    backgroundColor: '#1E3350',
  },
});
