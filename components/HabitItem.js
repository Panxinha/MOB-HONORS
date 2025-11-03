import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Animated } from 'react-native';

export default function HabitItem({ item, onAdd, onSub, onDelete, disabledMinus, colorText }) {
  const translateX = useRef(new Animated.Value(0)).current;

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,
      onPanResponderMove: (_, g) => { translateX.setValue(g.dx); },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -80) onDelete(item.id); // “swipe left” para borrar
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  return (
    <Animated.View style={{ transform: [{ translateX }] }} {...pan.panHandlers}>
      <View style={styles.row}>
        <Text style={[styles.name, { color: colorText }]}>{item.name} · {item.category}</Text>
        <View style={styles.controls}>
          <TouchableOpacity onPress={() => onSub(item.id)} disabled={disabledMinus} style={[styles.btn, disabledMinus && styles.disabled]}>
            <Text>-</Text>
          </TouchableOpacity>
          <Text style={styles.count}>{item.count}</Text>
          <TouchableOpacity onPress={() => onAdd(item.id)} style={styles.btn}><Text>+</Text></TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontWeight: '600' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#E5E7EB', borderRadius: 8 },
  disabled: { opacity: 0.4 },
  count: { minWidth: 30, textAlign: 'center', fontWeight: '700' }
});
