import React, { useState } from 'react';
import { SafeAreaView, View, Text, Switch, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation';
import { light, dark } from './theme/colors';

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const pal = isDark ? dark : light;

  return (
    <NavigationContainer>
      <SafeAreaView style={[styles.root, { backgroundColor: pal.bg }]}>
        <View style={styles.topbar}>
          <Text style={[styles.title, { color: pal.text }]}>Habit + Perfil</Text>
          <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
            <Text style={{ color: pal.text }}>{isDark ? 'Oscuro' : 'Claro'}</Text>
            <Switch value={isDark} onValueChange={setIsDark}/>
          </View>
        </View>

        <View style={{ flex:1 }}>
          <RootNavigator />
        </View>
      </SafeAreaView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topbar: { paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontWeight: '800', fontSize: 18 }
});