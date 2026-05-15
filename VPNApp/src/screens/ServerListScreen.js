import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ServerCard  from '../components/ServerCard';
import { useVPN } from '../context/VPNContext';
import { getAllServers } from '../services/ApiService';
import { colors, gradients, spacing, radius } from '../theme';

const TABS = ['All', 'Free', 'Premium'];

export default function ServerListScreen({ navigation }) {
  const { selectedServer, selectServer, isPremium } = useVPN();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('All');

  const allServers = useMemo(() => getAllServers(), []);

  const filtered = useMemo(() => {
    let list = allServers;
    if (tab === 'Free')    list = list.filter(s => !s.isPremium);
    if (tab === 'Premium') list = list.filter(s =>  s.isPremium);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allServers, tab, search]);

  const handleSelect = server => {
    if (server.isPremium && !isPremium) {
      Alert.alert(
        '💎 Premium Required',
        'Upgrade to Premium to access this server.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Account') },
        ]
      );
      return;
    }
    selectServer(server);
    navigation.goBack();
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
          <Text style={styles.title}>Select Server</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search country or city..."
            placeholderTextColor={colors.textDim}
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tab, tab === t && styles.tabActive]}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Server count */}
        <Text style={styles.countText}>{filtered.length} servers available</Text>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <ServerCard
              server={item}
              isSelected={selectedServer?.id === item.id}
              isPremium={isPremium}
              onPress={() => handleSelect(item)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🌐</Text>
              <Text style={styles.emptyText}>No servers found</Text>
            </View>
          }
        />
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon:  { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    color: colors.text,
    paddingVertical: 12,
    fontSize: 14,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  tabActive: { backgroundColor: colors.primary + '22', borderWidth: 1, borderColor: colors.primary },
  tabText:       { color: colors.textSub, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: colors.primary },
  countText: {
    color: colors.textDim,
    fontSize: 12,
    marginHorizontal: spacing.md + 4,
    marginBottom: 8,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: colors.textSub, fontSize: 15, marginTop: 12 },
});
