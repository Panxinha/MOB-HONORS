import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

export default function SettingsScreen({ route }) {
  // El toggle real lo maneja App.js con estado global simple via props
  return (
    <View style={styles.box}>
      <Text style={{ fontSize:18, fontWeight:'700' }}>Ajustes</Text>
      <Text style={{ marginTop:12 }}>Usa el switch de la barra (App.js) para cambiar tema.</Text>
    </View>
  );
}
const styles = StyleSheet.create({ box:{ flex:1, padding:20 }});
