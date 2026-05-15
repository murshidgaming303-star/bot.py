import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual Telegram bot API or VPN backend
const BASE_URL = 'https://your-vpn-backend.example.com/api';

const FREE_SERVERS = [
  {
    id: 1,
    name: 'USA - New York',
    country: 'United States',
    flag: '🇺🇸',
    city: 'New York',
    ping: 45,
    load: 62,
    isPremium: false,
    endpoint: 'us1.vpnserver.example:51820',
    publicKey: 'YOUR_SERVER_PUBLIC_KEY_US1==',
    dns: '1.1.1.1',
  },
  {
    id: 2,
    name: 'Germany - Frankfurt',
    country: 'Germany',
    flag: '🇩🇪',
    city: 'Frankfurt',
    ping: 38,
    load: 45,
    isPremium: false,
    endpoint: 'de1.vpnserver.example:51820',
    publicKey: 'YOUR_SERVER_PUBLIC_KEY_DE1==',
    dns: '1.1.1.1',
  },
  {
    id: 3,
    name: 'UK - London',
    country: 'United Kingdom',
    flag: '🇬🇧',
    city: 'London',
    ping: 52,
    load: 55,
    isPremium: false,
    endpoint: 'uk1.vpnserver.example:51820',
    publicKey: 'YOUR_SERVER_PUBLIC_KEY_UK1==',
    dns: '8.8.8.8',
  },
];

const PREMIUM_SERVERS = [
  {
    id: 4,
    name: 'Japan - Tokyo',
    country: 'Japan',
    flag: '🇯🇵',
    city: 'Tokyo',
    ping: 22,
    load: 30,
    isPremium: true,
    endpoint: 'jp1.vpnserver.example:51820',
    publicKey: 'YOUR_SERVER_PUBLIC_KEY_JP1==',
    dns: '1.1.1.1',
  },
  {
    id: 5,
    name: 'Singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    city: 'Singapore',
    ping: 18,
    load: 25,
    isPremium: true,
    endpoint: 'sg1.vpnserver.example:51820',
    publicKey: 'YOUR_SERVER_PUBLIC_KEY_SG1==',
    dns: '1.1.1.1',
  },
  {
    id: 6,
    name: 'Netherlands',
    country: 'Netherlands',
    flag: '🇳🇱',
    city: 'Amsterdam',
    ping: 35,
    load: 40,
    isPremium: true,
    endpoint: 'nl1.vpnserver.example:51820',
    publicKey: 'YOUR_SERVER_PUBLIC_KEY_NL1==',
    dns: '1.1.1.1',
  },
  {
    id: 7,
    name: 'Canada - Toronto',
    country: 'Canada',
    flag: '🇨🇦',
    city: 'Toronto',
    ping: 60,
    load: 35,
    isPremium: true,
    endpoint: 'ca1.vpnserver.example:51820',
    publicKey: 'YOUR_SERVER_PUBLIC_KEY_CA1==',
    dns: '1.1.1.1',
  },
  {
    id: 8,
    name: 'France - Paris',
    country: 'France',
    flag: '🇫🇷',
    city: 'Paris',
    ping: 42,
    load: 50,
    isPremium: true,
    endpoint: 'fr1.vpnserver.example:51820',
    publicKey: 'YOUR_SERVER_PUBLIC_KEY_FR1==',
    dns: '1.1.1.1',
  },
  {
    id: 9,
    name: 'Australia - Sydney',
    country: 'Australia',
    flag: '🇦🇺',
    city: 'Sydney',
    ping: 95,
    load: 28,
    isPremium: true,
    endpoint: 'au1.vpnserver.example:51820',
    publicKey: 'YOUR_SERVER_PUBLIC_KEY_AU1==',
    dns: '1.1.1.1',
  },
];

export const getAllServers = () => [...FREE_SERVERS, ...PREMIUM_SERVERS];
export const getFreeServers = () => FREE_SERVERS;
export const getPremiumServers = () => PREMIUM_SERVERS;
export const getServerById = id => getAllServers().find(s => s.id === id);

export const getUserPlan = async () => {
  const plan = await AsyncStorage.getItem('user_plan');
  const expiry = await AsyncStorage.getItem('plan_expiry');
  return { plan: plan || 'free', expiry };
};

export const saveUserPlan = async (plan, expiry) => {
  await AsyncStorage.setItem('user_plan', plan);
  await AsyncStorage.setItem('plan_expiry', expiry);
};

export const getLastServer = async () => {
  const data = await AsyncStorage.getItem('last_server');
  return data ? JSON.parse(data) : FREE_SERVERS[0];
};

export const saveLastServer = async server => {
  await AsyncStorage.setItem('last_server', JSON.stringify(server));
};
