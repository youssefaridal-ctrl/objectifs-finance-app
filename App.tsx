import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from './src/screens/DashboardScreen';
import FinanceOverviewScreen from './src/screens/FinanceOverviewScreen';
import SalaireScreen from './src/screens/SalaireScreen';
import CreditsScreen from './src/screens/CreditsScreen';
import EpargneScreen from './src/screens/EpargneScreen';
import ObjectifsScreen from './src/screens/ObjectifsScreen';
import ParametresScreen from './src/screens/ParametresScreen';
import { colors } from './src/theme';
import { DataProvider } from './src/store/DataContext';

const Tab = createBottomTabNavigator();

const iconFor: Record<string, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'home-outline',
  Finance: 'pie-chart-outline',
  Salaire: 'wallet-outline',
  Credits: 'card-outline',
  Epargne: 'cash-outline',
  Objectifs: 'flag-outline',
  Parametres: 'settings-outline',
};

export default function App() {
  return (
    <DataProvider>
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.headerTo,
          tabBarInactiveTintColor: colors.navInactive,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={iconFor[route.name]} color={color} size={size} />
          ),
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Accueil' }} />
        <Tab.Screen name="Finance" component={FinanceOverviewScreen} options={{ title: 'Finance' }} />
        <Tab.Screen name="Salaire" component={SalaireScreen} options={{ title: 'Salaire' }} />
        <Tab.Screen name="Credits" component={CreditsScreen} options={{ title: 'Crédits' }} />
        <Tab.Screen name="Epargne" component={EpargneScreen} options={{ title: 'Épargne' }} />
        <Tab.Screen name="Objectifs" component={ObjectifsScreen} options={{ title: 'Objectifs' }} />
        <Tab.Screen name="Parametres" component={ParametresScreen} options={{ title: 'Réglages' }} />
      </Tab.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
    </DataProvider>
  );
}
