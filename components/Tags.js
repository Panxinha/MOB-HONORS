import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function Tag({ label }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#e5e7eb', marginRight: 8, marginBottom: 8 },
  text: { fontWeight: '600' }
});
