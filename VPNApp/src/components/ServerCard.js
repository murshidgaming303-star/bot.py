import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, gradients, radius, spacing } from '../theme';

const PingDot = ({ ping }) => {
  const c = ping < 40 ? '#00E676' : ping < 80 ? '#FFD700' : '#FF4757';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View style={[styles.pingDot, { backgroundColor: c }]} />
      <Text style={[styles.pingText, { color: c }]}>{ping}ms</Text>
    </View>
  );
};

const LoadBar = ({ load }) => {
  const c = load < 50 ? colors.success : load < 75 ? colors.warning : colors.danger;
  return (
    <View style={styles.loadBarBg}>
      <View style={[styles.loadBarFill, { width: `${load}%`, backgroundColor: c }]} />
    </View>
  );
};

export default function ServerCard({ server, isSelected, isPremium, onPress }) {
  const locked = server.isPremium && !isPremium;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} disabled={locked}>
      <LinearGradient
        colors={isSelected ? gradients.primary : gradients.card}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.card, isSelected && styles.cardSelected]}>
        {/* Flag + Info */}
        <View style={styles.left}>
          <Text style={styles.flag}>{server.flag}</Text>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{server.name}</Text>
              {server.isPremium && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumText}>PRO</Text>
                </View>
              )}
            </View>
            <Text style={styles.city}>{server.city}</Text>
            <LoadBar load={server.load} />
          </View>
        </View>

        {/* Right: ping or lock */}
        <View style={styles.right}>
          {locked
            ? <Text style={styles.lockIcon}>🔒</Text>
            : <PingDot ping={server.ping} />}
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardSelected: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  flag: { fontSize: 36 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  city: {
    color: colors.textSub,
    fontSize: 12,
    marginBottom: 6,
  },
  premiumBadge: {
    backgroundColor: colors.premium,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  premiumText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  lockIcon: { fontSize: 18 },
  checkmark: {
    color: colors.success,
    fontSize: 18,
    fontWeight: '700',
  },
  pingDot: {
    width: 8, height: 8, borderRadius: 4,
  },
  pingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadBarBg: {
    height: 3,
    width: 80,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});
