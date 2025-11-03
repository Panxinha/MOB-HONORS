import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

export default function HomeScreen({ navigation }) {
  const scale = useRef(new Animated.Value(0.9)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.9, duration: 700, useNativeDriver: true }),
    ])).start();
  }, []);

  const hour = new Date().getHours();
  const saludo = hour < 12 ? '¡Buenos días!' : hour < 19 ? '¡Buenas tardes!' : '¡Buenas noches!';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{saludo}</Text>
      <Text style={styles.subtitle}>Bienvenida a tu app de hábitos y perfil.</Text>

      <Animated.View style={{ transform: [{ scale }], marginTop: 24 }}>
        <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('Habits', { source: 'home' })}>
          <Text style={styles.ctaText}>Empezar</Text>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity onPress={() => navigation.navigate('Upload')} style={styles.link}><Text>Subir imagen</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.link}><Text>Ajustes</Text></TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { marginTop: 8, textAlign: 'center' },
  cta: { backgroundColor: '#3B82F6', paddingHorizontal: 26, paddingVertical: 12, borderRadius: 12 },
  ctaText: { color: 'white', fontWeight: '700' },
  link: { marginTop: 16 }
});
