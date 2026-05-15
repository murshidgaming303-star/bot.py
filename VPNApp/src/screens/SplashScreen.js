import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme';

export default function SplashScreen({ navigation }) {
  const logoScale  = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale,   { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => navigation.replace('Main'), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={['#08101E', '#0F1E35', '#08101E']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#08101E" />

      <Animated.View style={{ transform: [{ scale: logoScale }], opacity: logoOpacity }}>
        <LinearGradient
          colors={['#0072FF', '#00C6FF']}
          style={styles.logoCircle}>
          <Text style={styles.logoIcon}>🛡</Text>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={{ opacity: textOpacity, alignItems: 'center', marginTop: 28 }}>
        <Text style={styles.appName}>TurboVPN</Text>
        <Text style={styles.tagline}>Fast • Secure • Free</Text>
      </Animated.View>

      {/* Bottom dots */}
      <View style={styles.dotsRow}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00C6FF',
    shadowOpacity: 0.7,
    shadowRadius: 30,
    elevation: 20,
  },
  logoIcon:  { fontSize: 52 },
  appName:   { color: '#fff', fontSize: 34, fontWeight: '900', letterSpacing: 2 },
  tagline:   { color: '#7E9BB5', fontSize: 14, marginTop: 6, letterSpacing: 1.5 },
  dotsRow: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#1E3350',
  },
  dotActive: { backgroundColor: colors.primary, width: 24 },
});
