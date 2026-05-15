import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

import { VPNProvider } from './src/context/VPNContext';
import SplashScreen    from './src/screens/SplashScreen';
import HomeScreen      from './src/screens/HomeScreen';
import ServerListScreen from './src/screens/ServerListScreen';
import AccountScreen   from './src/screens/AccountScreen';
import { colors }      from './src/theme';

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

const TabIcon = ({ icon, label, focused }) => (
  <View style={[tabStyles.wrap, focused && tabStyles.wrapActive]}>
    <Text style={tabStyles.icon}>{icon}</Text>
    <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
  </View>
);

const tabStyles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingTop: 6 },
  wrapActive: {},
  icon:  { fontSize: 22 },
  label: { color: colors.textDim, fontSize: 10, marginTop: 2, fontWeight: '600' },
  labelActive: { color: colors.primary },
});

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F1E35',
          borderTopColor: '#1E3350',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
        },
        tabBarActiveTintColor:   colors.primary,
        tabBarInactiveTintColor: colors.textDim,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🛡" label="VPN" focused={focused} />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Servers"
        component={ServerListScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🌍" label="Servers" focused={focused} />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" label="Account" focused={focused} />
          ),
          tabBarLabel: () => null,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <VPNProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Main"   component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </VPNProvider>
  );
}
