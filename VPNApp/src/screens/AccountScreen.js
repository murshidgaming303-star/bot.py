import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  SafeAreaView, StatusBar, Linking, Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useVPN } from '../context/VPNContext';
import { colors, gradients, spacing, radius } from '../theme';

const PlanCard = ({ isPremium, expiry }) => (
  <LinearGradient
    colors={isPremium ? gradients.premium : gradients.card}
    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
    style={styles.planCard}>
    <View>
      <Text style={[styles.planLabel, isPremium && { color: '#000' }]}>Current Plan</Text>
      <Text style={[styles.planName,  isPremium && { color: '#000' }]}>
        {isPremium ? '💎 Premium' : '🆓 Free'}
      </Text>
      {expiry && (
        <Text style={[styles.planExpiry, isPremium && { color: '#00000088' }]}>
          Expires: {expiry}
        </Text>
      )}
    </View>
    {isPremium && <Text style={styles.planBadge}>ACTIVE</Text>}
  </LinearGradient>
);

const FeatureRow = ({ icon, text, available }) => (
  <View style={styles.featureRow}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={[styles.featureText, !available && styles.featureDim]}>{text}</Text>
    <Text style={[styles.featureTick, { color: available ? colors.success : colors.textDim }]}>
      {available ? '✓' : '✕'}
    </Text>
  </View>
);

export default function AccountScreen({ navigation }) {
  const { isPremium, userPlan } = useVPN();

  const openTelegramSupport = () => {
    Linking.openURL('https://t.me/your_support_bot').catch(() =>
      Alert.alert('Error', 'Could not open Telegram.')
    );
  };

  const handleUpgrade = () => {
    Alert.alert(
      '💎 Upgrade to Premium',
      'Contact our support on Telegram to upgrade your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Telegram', onPress: openTelegramSupport },
      ]
    );
  };

  return (
    <LinearGradient colors={gradients.bg} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <StatusBar barStyle="light-content" backgroundColor="#08101E" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>My Account</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <LinearGradient colors={gradients.primary} style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </LinearGradient>
            <Text style={styles.planBadgeMain}>
              {isPremium ? '💎 Premium Member' : '🆓 Free Member'}
            </Text>
          </View>

          {/* Plan card */}
          <PlanCard isPremium={isPremium} expiry={userPlan?.expiry} />

          {/* Features */}
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>Plan Features</Text>
            <FeatureRow icon="🌍" text="3 Free Servers (US, DE, UK)"   available={true}      />
            <FeatureRow icon="🔒" text="WireGuard Encryption"          available={true}      />
            <FeatureRow icon="♾" text="Unlimited Bandwidth"            available={isPremium} />
            <FeatureRow icon="⚡" text="8+ Premium Servers"            available={isPremium} />
            <FeatureRow icon="🚀" text="10 Gbps Speed Servers"         available={isPremium} />
            <FeatureRow icon="📱" text="Multiple Devices"              available={isPremium} />
            <FeatureRow icon="🎧" text="Priority Support"              available={isPremium} />
          </View>

          {/* Upgrade button */}
          {!isPremium && (
            <TouchableOpacity onPress={handleUpgrade} activeOpacity={0.85}
              style={{ marginHorizontal: spacing.md, marginTop: spacing.md }}>
              <LinearGradient colors={gradients.primary} style={styles.upgradeBtn}>
                <Text style={styles.upgradeBtnText}>💎  Upgrade to Premium</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Pricing info */}
          {!isPremium && (
            <View style={styles.pricingCard}>
              <Text style={styles.pricingTitle}>💰 Pricing</Text>
              {[
                ['1 Month',  '$4.99'],
                ['3 Months', '$11.99', 'Save 20%'],
                ['1 Year',   '$34.99', 'Save 42%'],
              ].map(([period, price, badge]) => (
                <View key={period} style={styles.priceRow}>
                  <Text style={styles.pricePeriod}>{period}</Text>
                  {badge && (
                    <View style={styles.saveBadge}>
                      <Text style={styles.saveBadgeText}>{badge}</Text>
                    </View>
                  )}
                  <Text style={styles.priceAmount}>{price}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Support */}
          <TouchableOpacity onPress={openTelegramSupport} style={styles.supportBtn}>
            <Text style={styles.supportIcon}>💬</Text>
            <Text style={styles.supportText}>Contact Support on Telegram</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex:   { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backBtn:  {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.bgLight,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { color: colors.text, fontSize: 28, fontWeight: '300', lineHeight: 32 },
  title:    { color: colors.text, fontSize: 18, fontWeight: '700' },
  scroll:   { paddingBottom: 100 },
  avatarWrap: { alignItems: 'center', paddingVertical: spacing.xl },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText:    { fontSize: 40 },
  planBadgeMain: { color: colors.textSub, fontSize: 14, fontWeight: '600' },
  planCard: {
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  planLabel:  { color: colors.textSub, fontSize: 12, marginBottom: 4 },
  planName:   { color: colors.text, fontSize: 24, fontWeight: '800' },
  planExpiry: { color: colors.textSub, fontSize: 12, marginTop: 4 },
  planBadge:  {
    backgroundColor: '#00000033',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radius.full,
    color: '#000', fontSize: 12, fontWeight: '800',
  },
  featureCard: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  featureTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.md },
  featureRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  featureIcon:  { fontSize: 18, width: 30 },
  featureText:  { color: colors.text, fontSize: 14, flex: 1 },
  featureDim:   { color: colors.textDim },
  featureTick:  { fontSize: 16, fontWeight: '700' },
  upgradeBtn: {
    borderRadius: radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  upgradeBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  pricingCard: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  pricingTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.md },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pricePeriod: { color: colors.text, fontSize: 14, flex: 1 },
  priceAmount: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  saveBadge: {
    backgroundColor: colors.success + '22',
    borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
    marginRight: 10,
  },
  saveBadgeText: { color: colors.success, fontSize: 10, fontWeight: '700' },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  supportIcon: { fontSize: 22 },
  supportText: { color: colors.text, fontSize: 14, flex: 1 },
  chevron:     { color: colors.textSub, fontSize: 22 },
});
