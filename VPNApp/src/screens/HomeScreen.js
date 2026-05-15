import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
  ScrollView, SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ConnectButton     from '../components/ConnectButton';
import ConnectionStats   from '../components/ConnectionStats';
import { useVPN }        from '../context/VPNContext';
import { colors, gradients, spacing, radius } from '../theme';
import { VPNState }      from '../services/WireGuardService';

const StatusChip = ({ vpnState }) => {
  const cfg = {
    [VPNState.CONNECTED]:    { label: '● Connected',    color: colors.success  },
    [VPNState.CONNECTING]:   { label: '◌ Connecting…',  color: colors.primary  },
    [VPNState.DISCONNECTING]:{ label: '◌ Disconnecting',color: colors.warning  },
    [VPNState.ERROR]:        { label: '✕ Error',         color: colors.danger   },
    [VPNState.DISCONNECTED]: { label: '○ Not Connected', color: colors.textSub  },
  }[vpnState] ?? { label: '○ Not Connected', color: colors.textSub };

  return (
    <View style={[styles.chip, { borderColor: cfg.color + '55', backgroundColor: cfg.color + '18' }]}>
      <Text style={[styles.chipText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

export default function HomeScreen({ navigation }) {
  const {
    vpnState, selectedServer, isConnected, isConnecting,
    connectedAt, bytesIn, bytesOut, isPremium,
    connect, disconnect,
  } = useVPN();

  const handleToggle = () => {
    if (isConnected || vpnState === VPNState.CONNECTED) {
      disconnect();
    } else if (!isConnecting) {
      connect();
    }
  };

  return (
    <LinearGradient colors={gradients.bg} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <StatusBar barStyle="light-content" backgroundColor="#08101E" />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Text style={styles.logoText}>🛡 TurboVPN</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Account')}
              style={styles.avatarBtn}>
              <Text style={styles.avatarIcon}>👤</Text>
            </TouchableOpacity>
          </View>

          {/* Status chip */}
          <View style={styles.centered}>
            <StatusChip vpnState={vpnState} />
          </View>

          {/* Connect Button */}
          <View style={[styles.centered, { marginTop: spacing.xl, marginBottom: spacing.xl }]}>
            <ConnectButton
              isConnected={isConnected}
              isConnecting={isConnecting}
              onPress={handleToggle}
            />
          </View>

          {/* Connection Stats */}
          <ConnectionStats
            isConnected={isConnected}
            connectedAt={connectedAt}
            bytesIn={bytesIn}
            bytesOut={bytesOut}
          />

          {/* Selected Server Card */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Servers')}
            activeOpacity={0.8}
            style={{ marginTop: spacing.lg, marginHorizontal: spacing.md }}>
            <LinearGradient
              colors={gradients.card}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.serverCard}>
              <View style={styles.serverLeft}>
                <Text style={styles.serverFlag}>
                  {selectedServer?.flag ?? '🌐'}
                </Text>
                <View>
                  <Text style={styles.serverName}>
                    {selectedServer?.name ?? 'Select Server'}
                  </Text>
                  <Text style={styles.serverSub}>
                    {selectedServer
                      ? `${selectedServer.ping}ms  •  ${selectedServer.load}% load`
                      : 'Tap to choose a location'}
                  </Text>
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Quick tip */}
          {!isConnected && !isConnecting && (
            <View style={styles.tipBox}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>
                Tap the button above to connect instantly.{'\n'}
                Your data will be fully encrypted.
              </Text>
            </View>
          )}

          {/* Premium banner if free user */}
          {!isPremium && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Account')}
              activeOpacity={0.85}
              style={{ marginHorizontal: spacing.md, marginTop: spacing.lg }}>
              <LinearGradient
                colors={gradients.premium}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.premiumBanner}>
                <Text style={styles.premiumIcon}>💎</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                  <Text style={styles.premiumSub}>Unlock 8+ fast servers worldwide</Text>
                </View>
                <Text style={styles.chevronDark}>›</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  logoRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText:  { color: colors.text, fontSize: 20, fontWeight: '800' },
  avatarBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.bgLight,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarIcon: { fontSize: 18 },
  centered: { alignItems: 'center' },
  chip: {
    marginTop: spacing.sm,
    paddingHorizontal: 18, paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  serverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serverLeft:  { flexDirection: 'row', alignItems: 'center', gap: 14 },
  serverFlag:  { fontSize: 36 },
  serverName:  { color: colors.text,    fontSize: 16, fontWeight: '600' },
  serverSub:   { color: colors.textSub, fontSize: 12, marginTop: 2 },
  chevron:     { color: colors.textSub, fontSize: 26, fontWeight: '300' },
  chevronDark: { color: '#00000088', fontSize: 26, fontWeight: '300' },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipIcon: { fontSize: 22 },
  tipText: { color: colors.textSub, fontSize: 13, lineHeight: 20, flex: 1 },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 12,
  },
  premiumIcon:  { fontSize: 28 },
  premiumTitle: { color: '#000', fontSize: 15, fontWeight: '800' },
  premiumSub:   { color: '#00000088', fontSize: 12, marginTop: 1 },
});
