import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity, Animated, StyleSheet, View, Text,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, gradients } from '../theme';

const OUTER = 200;
const INNER = 160;
const CORE  = 120;

export default function ConnectButton({ isConnected, isConnecting, onPress }) {
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale  = useRef(new Animated.Value(1)).current;

  // Pulse rings when connected
  useEffect(() => {
    if (isConnected) {
      const p = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulse1, { toValue: 1.35, duration: 1200, useNativeDriver: true }),
            Animated.timing(pulse2, { toValue: 1.15, duration: 1200, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(pulse1, { toValue: 1,    duration: 1200, useNativeDriver: true }),
            Animated.timing(pulse2, { toValue: 1,    duration: 1200, useNativeDriver: true }),
          ]),
        ])
      );
      p.start();
      return () => p.stop();
    } else {
      pulse1.setValue(1);
      pulse2.setValue(1);
    }
  }, [isConnected]);

  // Spin ring while connecting
  useEffect(() => {
    if (isConnecting) {
      const spin = Animated.loop(
        Animated.timing(rotate, { toValue: 1, duration: 1200, useNativeDriver: true })
      );
      spin.start();
      return () => spin.stop();
    } else {
      rotate.setValue(0);
    }
  }, [isConnecting]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.92, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1,    duration: 150, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const ringColor     = isConnected ? 'rgba(0,230,118,0.18)' : 'rgba(0,198,255,0.12)';
  const midRingColor  = isConnected ? 'rgba(0,230,118,0.10)' : 'rgba(0,198,255,0.07)';
  const gradientColors = isConnected   ? gradients.success
                       : isConnecting  ? ['#1A2E4A', '#0F1E35']
                       : gradients.primary;

  return (
    <View style={styles.wrapper}>
      {/* Outer pulse ring */}
      <Animated.View style={[styles.ring, { width: OUTER, height: OUTER, borderRadius: OUTER / 2,
        backgroundColor: ringColor, transform: [{ scale: pulse1 }] }]} />
      {/* Mid pulse ring */}
      <Animated.View style={[styles.ring, { width: INNER, height: INNER, borderRadius: INNER / 2,
        backgroundColor: midRingColor, transform: [{ scale: pulse2 }] }]} />

      {/* Spinner arc while connecting */}
      {isConnecting && (
        <Animated.View style={[styles.spinnerRing, { transform: [{ rotate: spin }] }]} />
      )}

      {/* Core button */}
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity activeOpacity={0.85} onPress={handlePress}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.core}>
            <Text style={styles.powerIcon}>⏻</Text>
            <Text style={styles.label}>
              {isConnecting ? 'WAIT...' : isConnected ? 'CONNECTED' : 'CONNECT'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: OUTER,
    height: OUTER,
  },
  ring: {
    position: 'absolute',
  },
  spinnerRing: {
    position: 'absolute',
    width: INNER + 8,
    height: INNER + 8,
    borderRadius: (INNER + 8) / 2,
    borderWidth: 3,
    borderColor: colors.primary,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  core: {
    width: CORE,
    height: CORE,
    borderRadius: CORE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 14,
  },
  powerIcon: {
    fontSize: 36,
    color: '#fff',
    marginBottom: 2,
  },
  label: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
