import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DetailScreen({ route }) {
  const { id, name, count } = route.params || {};
  return (
    <View style={styles.box}>
      <Text style={styles.title}>{name}</Text>
      <Text>ID: {id}</Text>
      <Text>Conteo actual: {count}</Text>
      <Text style={{ marginTop: 12 }}>Tip: mantén presionado un hábito en la lista para eliminarlo o desliza a la izquierda.</Text>
    </View>
  );
}
const styles = StyleSheet.create({ box:{ flex:1, padding:20 }, title:{ fontSize:24, fontWeight:'800', marginBottom:6 } });
