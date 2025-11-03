import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';

export default function App() {
  // Estado de la lista
  const [exercises, setExercises] = useState([
    { id: '1', name: 'Sentadillas', sets: '3', reps: '12', done: false },
    { id: '2', name: 'Puente de glúteos', sets: '4', reps: '10', done: false },
  ]);

  // Estado del formulario
  const [name, setName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');

  function addExercise() {
    if (!name.trim()) {
      Alert.alert('Falta el nombre', 'Escribe el nombre del ejercicio.');
      return;
    }
    if (!sets.trim() || isNaN(Number(sets))) {
      Alert.alert('Series inválidas', 'Ingresa un número en "series".');
      return;
    }
    if (!reps.trim() || isNaN(Number(reps))) {
      Alert.alert('Reps inválidas', 'Ingresa un número en "repeticiones".');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      name: name.trim(),
      sets: String(Number(sets)),
      reps: String(Number(reps)),
      done: false,
    };

    setExercises(prev => [newItem, ...prev]);
    setName('');
    setSets('');
    setReps('');
  }

  function toggleDone(id) {
    setExercises(prev =>
      prev.map(item =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  }

  function removeExercise(id) {
    Alert.alert('Eliminar', '¿Seguro que quieres eliminar este ejercicio?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () =>
          setExercises(prev => prev.filter(item => item.id !== id)),
      },
    ]);
  }

  function renderItem({ item }) {
    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, item.done && styles.strike]}>
            {item.name}
          </Text>
          <Text style={styles.subtitle}>
            {item.sets} series × {item.reps} repeticiones
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => toggleDone(item.id)}
          style={[styles.badge, item.done ? styles.badgeDone : styles.badgePending]}
        >
          <Text style={styles.badgeText}>{item.done ? 'Hecho' : 'Pendiente'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => removeExercise(item.id)} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header con imagen */}
        <View style={styles.header}>
          <Image
            source={require('./assets/dumbbell.png')}
            style={styles.headerImage}
            resizeMode="contain"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Mis ejercicios</Text>
            <Text style={styles.headerCaption}>Registra tus rutinas simple y rápido</Text>
          </View>
        </View>

        {/* Lista */}
        <FlatList
          data={exercises}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#777', marginTop: 12 }}>
              No hay ejercicios aún. ¡Agrega el primero!
            </Text>
          }
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 12 }}
        />

        {/* Formulario */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Agregar ejercicio</Text>

          <TextInput
            placeholder="Nombre (p. ej. Zancadas)"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <View style={styles.row}>
            <TextInput
              placeholder="Series"
              value={sets}
              onChangeText={setSets}
              keyboardType="numeric"
              style={[styles.input, styles.inputHalf]}
            />
            <TextInput
              placeholder="Reps"
              value={reps}
              onChangeText={setReps}
              keyboardType="numeric"
              style={[styles.input, styles.inputHalf]}
            />
          </View>

          <Button title="Agregar" onPress={addExercise} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f7f7' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  headerImage: { width: 64, height: 64, marginRight: 8 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  headerCaption: { color: '#666' },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    gap: 8,
  },
  title: { fontSize: 16, fontWeight: '600' },
  strike: { textDecorationLine: 'line-through', color: '#999' },
  subtitle: { color: '#666', marginTop: 2 },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeDone: { backgroundColor: '#d1fadf' },
  badgePending: { backgroundColor: '#ffe8b2' },
  badgeText: { fontWeight: '600' },

  deleteBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  deleteText: { color: '#d33', fontWeight: '700' },

  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    marginBottom: 10,
    gap: 8,
  },
  formTitle: { fontWeight: '700', marginBottom: 4, fontSize: 16 },
  input: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', gap: 8 },
  inputHalf: { flex: 1 },
});
