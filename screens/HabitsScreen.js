import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Keyboard, Alert, ScrollView, Share } from 'react-native';
import HabitItem from '../components/HabitItem';
import Tag from '../components/Tag';

const CATS = ['Salud','Estudio','Gym','Otro'];

export default function HabitsScreen({ route, navigation }) {
  const [habits, setHabits] = useState([]);
  const [name, setName] = useState('');
  const [cat, setCat] = useState('Salud');
  const [query, setQuery] = useState('');
  const [onlyFav, setOnlyFav] = useState(false);

  const addHabit = () => {
    if (!name.trim()) { Alert.alert('Ups', 'Escribe un nombre'); return; }
    setHabits(prev => [{ id: Date.now().toString(), name, category: cat, count: 0, fav: false }, ...prev]);
    setName(''); Keyboard.dismiss(); // cerrar teclado
  };

  const inc = id => setHabits(prev => prev.map(h => h.id===id ? { ...h, count: h.count+1 } : h));
  const dec = id => setHabits(prev => prev.map(h => h.id===id && h.count>0 ? { ...h, count: h.count-1 } : h));
  const del = id => setHabits(prev => prev.filter(h => h.id!==id));
  const toggleFav = id => setHabits(prev => prev.map(h => h.id===id ? { ...h, fav: !h.fav } : h));

  const filtered = habits
    .filter(h => h.name.toLowerCase().includes(query.toLowerCase()))
    .filter(h => onlyFav ? h.fav : true)
    .filter(h => !route.params?.source || h); // solo para mostrar que recibimos params

  const shareStats = async () => {
    const top = habits.sort((a,b)=>b.count-a.count)[0];
    const msg = top ? `Mi hábito top: ${top.name} (${top.count}). ¿Y el tuyo?` : 'Aún no tengo hábitos 😅';
    await Share.share({ message: msg });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Tus hábitos</Text>

      <View style={styles.row}>
        <TextInput placeholder="Nuevo hábito..." value={name} onChangeText={setName} style={styles.input}/>
        <TouchableOpacity style={styles.add} onPress={addHabit}><Text style={{color:'white'}}>Agregar</Text></TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
        {CATS.map(c => (
          <TouchableOpacity key={c} onPress={() => setCat(c)}>
            <Tag label={c + (c===cat ? ' ✓' : '')}/>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => setOnlyFav(f => !f)}>
          <Tag label={onlyFav ? 'Favoritos ✓' : 'Favoritos'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={shareStats}><Tag label="Compartir" /></TouchableOpacity>
      </ScrollView>

      <TextInput placeholder="Buscar..." value={query} onChangeText={setQuery} style={styles.search}/>

      <ScrollView style={{ marginTop: 10 }}>
        {filtered.map(h => (
          <TouchableOpacity key={h.id} onLongPress={() => del(h.id)} onPress={() => navigation.navigate('Detail', { id: h.id, name: h.name, count: h.count })}>
            <HabitItem
              item={h}
              onAdd={inc}
              onSub={dec}
              onDelete={del}
              disabledMinus={h.count===0}
              colorText={'#111'}
            />
            <TouchableOpacity onPress={() => toggleFav(h.id)} style={{ marginBottom: 8 }}>
              <Text>{h.fav ? '★ Quitar de favoritos' : '☆ Agregar a favoritos'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        {filtered.length===0 && <Text style={{ textAlign:'center', marginTop: 20 }}>Sin resultados</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16 },
  h1: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  row: { flexDirection:'row', gap:8 },
  input: { flex:1, backgroundColor:'#F3F4F6', paddingHorizontal:12, borderRadius:10 },
  add: { backgroundColor:'#3B82F6', paddingHorizontal:16, justifyContent:'center', borderRadius:10 },
  search: { marginTop:8, backgroundColor:'#F3F4F6', paddingHorizontal:12, borderRadius:10 }
});
