import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import HabitsScreen from '../screens/HabitsScreen';
import DetailScreen from '../screens/DetailScreen';
import UploadScreen from '../screens/UploadScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }}/>
      <Stack.Screen name="Habits" component={HabitsScreen} options={{ title: 'Hábitos' }}/>
      <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Detalle' }}/>
      <Stack.Screen name="Upload" component={UploadScreen} options={{ title: 'Subir imagen' }}/>
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ajustes' }}/>
    </Stack.Navigator>
  );
}
