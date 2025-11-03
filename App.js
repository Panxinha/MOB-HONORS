import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Share,
  Animated,
  StatusBar,
  Pressable,
} from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';

// ----------- Types básicos -----------
/*
  Exercise = {
    id: string,
    name: string,
    sets: number,
    reps: number,
    category: 'Piernas' | 'Glúteos' | 'Core' | 'Espalda' | 'Cardio',
    imageUri?: string,
    favorite?: boolean,
    doneCount: number
  }
*/

const Stack = createNativeStackNavigator();

const CATEGORIES = ['Piernas', 'Glúteos', 'Core', 'Espalda', 'Cardio'];

// ----------- Utils de tiempo (MOB-H: usar la hora) -----------
function getGreetingAndNightMode(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) return { greet: '¡Buenos días!', night: false };
  if (hour >= 12 && hour < 19) return { greet: '¡Buenas tardes!', night: false };
  return { greet: '¡Buenas noches!', night: true };
}

// ----------- Persistencia -----------
const STORAGE_KEY = '@mis_ejercicios_data';
const THEME_KEY = '@theme_override'; // 'light' | 'dark' | 'system'

// ----------- Pantalla: Landing -----------
function HomeScreen({ navigation, route }) {
  const fade = useRef(new Animated.Value(0)).current;
  const { greet } = getGreetingAndNightMode();

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar translucent={false} />
      <Animated.View style={[styles.container, { opacity: fade }]}>
        <View style={styles.header}>
          <Image source={require('./assets/dumbbell.png')} style={styles.headerImage} />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Mis ejercicios</Text>
            <Text style={styles.headerCaption}>{greet} Define, registra y comparte tus rutinas.</Text>
          </View>
        </View>

        <View style={styles.cardBig}>
          <Text style={styles.title}>¿Qué puedes hacer aquí?</Text>
          <Text style={styles.p}>
            • Agregar ejercicios con imagen (subir archivos){'\n'}
            • Buscar y filtrar por categoría o favoritos{'\n'}
            • Marcar progreso, ver gráfico y compartir{'\n'}
            • Modo claro/oscuro (auto por hora){'\n'}
            • Swipe para eliminar + datos persistentes
          </Text>
          <Button title="Ir a mi lista" onPress={() => navigation.navigate('Lista')} />
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>Tip</Text>
          <Text style={styles.p}>
            Toca un ejercicio para ver el detalle. En el detalle puedes **compartir** o editar.
          </Text>
        </View>

        <View style={{ height: 12 }} />
        <Button title="Ajustes (tema / API)" onPress={() => navigation.navigate('Ajustes')} />
      </Animated.View>
    </SafeAreaView>
  );
}

// ----------- Pantalla: Lista -----------
function ListScreen({ navigation, route }) {
  const [exercises, setExercises] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const [onlyFavs, setOnlyFavs] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const soundRef = useRef(null);

  // cargar persistencia
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        setExercises(JSON.parse(raw));
      } else {
        // datos seed para que se vea algo
        setExercises([
          { id: '1', name: 'Sentadillas', sets: 3, reps: 12, category: 'Piernas', doneCount: 0 },
          { id: '2', name: 'Puente de glúteos', sets: 4, reps: 10, category: 'Glúteos', doneCount: 0 },
          { id: '3', name: 'Plancha', sets: 3, reps: 30, category: 'Core', doneCount: 0 },
        ]);
      }
      Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    })();
  }, []);

  // guardar persistencia
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
  }, [exercises]);

  // cargar sonido
  useEffect(() => {
    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(require('./assets/ding.mp3'));
        soundRef.current = sound;
      } catch (e) {
        // si no hay mp3 no hacemos nada
      }
    })();
    return () => {
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  function onAdd() {
    navigation.navigate('Agregar', {
      onSave: (exercise) => setExercises((prev) => [exercise, ...prev]),
    });
  }

  function onToggleFav(itemId) {
    setExercises((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, favorite: !it.favorite } : it))
    );
  }

  async function onDone(itemId) {
    setExercises((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, doneCount: (it.doneCount || 0) + 1 } : it))
    );
    try {
      if (soundRef.current) await soundRef.current.replayAsync();
    } catch {}
  }

  function onDelete(itemId) {
    setExercises((prev) => prev.filter((it) => it.id !== itemId));
  }

  function filtered() {
    let data = exercises;
    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter((e) => e.name.toLowerCase().includes(q));
    }
    if (category !== 'Todas') {
      data = data.filter((e) => e.category === category);
    }
    if (onlyFavs) {
      data = data.filter((e) => e.favorite);
    }
    return data;
  }

  // gráfico simple: barras por categoría (conteo de done)
  const chartData = useMemo(() => {
    const base = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
    for (const e of exercises) {
      base[e.category] = (base[e.category] || 0) + (e.doneCount || 0);
    }
    return base;
  }, [exercises]);

  function renderItem({ item }) {
    // Swipe “simple”: si arrastras fuerte a la izquierda, elimina
    let startX = 0;
    let deltaX = 0;
    return (
      <Pressable
        onPress={() => navigation.navigate('Detalle', { exercise: item })}
        onLongPress={() => onToggleFav(item.id)}
        onTouchStart={(e) => {
          startX = e.nativeEvent.pageX;
        }}
        onTouchMove={(e) => {
          deltaX = e.nativeEvent.pageX - startX;
        }}
        onTouchEnd={() => {
          if (deltaX < -80) onDelete(item.id); // swipe to delete
        }}
        style={styles.card}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <View style={styles.rowSpace}>
            <Text style={styles.title}>{item.name}</Text>
            <TouchableOpacity onPress={() => onToggleFav(item.id)}>
              <Text style={{ fontSize: 18 }}>{item.favorite ? '★' : '☆'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            {item.sets} series × {item.reps} reps · {item.category}
          </Text>
          {item.imageUri ? (
            <Image source={{ uri: item.imageUri }} style={{ width: '100%', height: 120, borderRadius: 8 }} />
          ) : null}
        </View>

        <View style={{ alignItems: 'center', gap: 6 }}>
          <TouchableOpacity onPress={() => onDone(item.id)} style={styles.badgeDone}>
            <Text style={styles.badgeText}>+1</Text>
          </TouchableOpacity>
          <Text style={{ color: '#666' }}>x{item.doneCount || 0}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[styles.container, { opacity: fade }]}>
        <View style={styles.rowSpace}>
          <Text style={styles.headerTitle}>Mi lista</Text>
          <Button title="Agregar" onPress={onAdd} />
        </View>

        {/* Búsqueda y filtros */}
        <TextInput
          placeholder="Buscar ejercicio..."
          value={query}
          onChangeText={setQuery}
          style={styles.input}
        />

        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => setCategory((prev) => {
              const order = ['Todas', ...CATEGORIES];
              const idx = order.indexOf(prev);
              return order[(idx + 1) % order.length];
            })}
            style={styles.filterBtn}
          >
            <Text style={styles.filterText}>Categoría: {category}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setOnlyFavs((v) => !v)} style={styles.filterBtn}>
            <Text style={styles.filterText}>{onlyFavs ? '★ Favoritos' : '☆ Todos'}</Text>
          </TouchableOpacity>
        </View>

        {/* Lista */}
        <FlatList
          data={filtered()}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.p}>No hay elementos.</Text>}
          contentContainerStyle={{ paddingBottom: 16 }}
        />

        {/* Gráfico simple (barras) */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>Progreso por categoría</Text>
          {CATEGORIES.map((c) => {
            const value = chartData[c];
            const width = Math.min(100, value * 10); // 10px por done (cap 100)
            return (
              <View key={c} style={{ marginTop: 6 }}>
                <Text style={{ fontSize: 12, color: '#666' }}>{c} · {value}</Text>
                <View style={{ height: 8, backgroundColor: '#eee', borderRadius: 4 }}>
                  <View style={{ width, height: 8, backgroundColor: '#8ad', borderRadius: 4 }} />
                </View>
              </View>
            );
          })}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

// ----------- Pantalla: Agregar -----------
function AddScreen({ navigation, route }) {
  const [name, setName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [category, setCategory] = useState('Piernas');
  const [imageUri, setImageUri] = useState(null);

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permiso requerido', 'Autoriza la galería para subir imágenes.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!res.canceled) {
      setImageUri(res.assets[0].uri);
    }
  }

  function save() {
    if (!name.trim()) return Alert.alert('Falta nombre');
    if (!sets.trim() || isNaN(Number(sets))) return Alert.alert('Series inválidas');
    if (!reps.trim() || isNaN(Number(reps))) return Alert.alert('Reps inválidas');

    const exercise = {
      id: Date.now().toString(),
      name: name.trim(),
      sets: Number(sets),
      reps: Number(reps),
      category,
      imageUri,
      favorite: false,
      doneCount: 0,
    };

    // pasar de vuelta por parámetro (MOB-H: navegación + paso de params)
    route.params?.onSave?.(exercise);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container]}>
        <Text style={styles.headerTitle}>Agregar ejercicio</Text>

        <TextInput placeholder="Nombre" value={name} onChangeText={setName} style={styles.input} />
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

        <TouchableOpacity
          onPress={() => {
            const idx = CATEGORIES.indexOf(category);
            setCategory(CATEGORIES[(idx + 1) % CATEGORIES.length]);
          }}
          style={styles.filterBtn}
        >
          <Text style={styles.filterText}>Categoría: {category}</Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <Button title="Subir imagen" onPress={pickImage} />
          <Button title="Guardar" onPress={save} />
        </View>

        {imageUri ? (
          <Image source={{ uri: imageUri }} style={{ width: '100%', height: 160, marginTop: 10, borderRadius: 10 }} />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

// ----------- Pantalla: Detalle -----------
function DetailScreen({ route, navigation }) {
  const { exercise } = route.params;

  async function shareIt() {
    try {
      await Share.share({
        message: `Mi ejercicio: ${exercise.name} — ${exercise.sets}x${exercise.reps} (${exercise.category})`,
      });
    } catch (e) {}
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>{exercise.name}</Text>
        <Text style={styles.p}>
          {exercise.sets} series × {exercise.reps} reps · {exercise.category}
        </Text>
        {exercise.imageUri ? (
          <Image source={{ uri: exercise.imageUri }} style={{ width: '100%', height: 220, borderRadius: 12 }} />
        ) : (
          <Text style={styles.p}>Sin imagen</Text>
        )}
        <View style={{ height: 12 }} />
        <Button title="Compartir" onPress={shareIt} />
      </View>
    </SafeAreaView>
  );
}

// ----------- Pantalla: Ajustes (Tema + API) -----------
function SettingsScreen() {
  const [themeOverride, setThemeOverride] = useState('system');
  const [quote, setQuote] = useState('');

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved) setThemeOverride(saved);
    })();
  }, []);

  async function saveTheme(v) {
    setThemeOverride(v);
    await AsyncStorage.setItem(THEME_KEY, v);
    Alert.alert('Listo', 'Preferencia de tema guardada');
  }

  async function fetchQuote() {
    try {
      const r = await fetch('https://api.quotable.io/random?tags=inspirational');
      const j = await r.json();
      setQuote(j.content);
    } catch (e) {
      setQuote('No se pudo obtener la frase. Intenta más tarde.');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Ajustes</Text>
        <Text style={styles.subtitle}>Tema</Text>
        <View style={styles.row}>
          {['light', 'dark', 'system'].map((v) => (
            <TouchableOpacity
              key={v}
              onPress={() => saveTheme(v)}
              style={[
                styles.filterBtn,
                themeOverride === v && { backgroundColor: '#d8e8ff' },
              ]}
            >
              <Text style={styles.filterText}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 20 }} />
        <Text style={styles.subtitle}>Frase motivacional (API)</Text>
        <Button title="Obtener frase" onPress={fetchQuote} />
        {quote ? <Text style={[styles.p, { marginTop: 10 }]}>"{quote}"</Text> : null}
      </View>
    </SafeAreaView>
  );
}

// ----------- App (Navegación + Tema + Auto Noche) -----------
export default function App() {
  const [theme, setTheme] = useState(DefaultTheme); // RN Navigation theme
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // auto tema nocturno por hora + override de usuario guardado
    (async () => {
      const { night } = getGreetingAndNightMode();
      const saved = await AsyncStorage.getItem(THEME_KEY);
      let current = night ? DarkTheme : DefaultTheme;
      if (saved === 'dark') current = DarkTheme;
      if (saved === 'light') current = DefaultTheme;
      setTheme(current);
      setReady(true);
    })();
  }, []);

  // Actualiza tema si usuario cambia en Ajustes (simple: chequea cada foco)
  // Para mantener básico, no implemento context; el override se aplica al volver al Home por re-montaje.
  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <Stack.Navigator
          screenOptions={{
            headerTitle: 'Mis ejercicios',
          }}
        >
          <Stack.Screen name="Inicio" component={HomeScreen} />
          <Stack.Screen name="Lista" component={ListScreen} />
          <Stack.Screen name="Agregar" component={AddScreen} />
          <Stack.Screen
            name="Detalle"
            component={DetailScreen}
            options={({ route }) => ({ title: route.params?.exercise?.name || 'Detalle' })}
          />
          <Stack.Screen name="Ajustes" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// ----------- Estilos básicos (MOB-1: Stylesheet) -----------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f7f7' },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  headerImage: { width: 64, height: 64, marginRight: 8 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  headerCaption: { color: '#666' },

  cardBig: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  title: { fontSize: 16, fontWeight: '700' },
  subtitle: { fontWeight: '700', marginTop: 4 },
  p: { color: '#444', marginTop: 6, lineHeight: 20 },

  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  rowSpace: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  input: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginVertical: 8,
  },
  inputHalf: { flex: 1 },

  filterBtn: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterText: { fontWeight: '600' },

  badgeDone: {
    backgroundColor: '#d1fadf',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { fontWeight: '700' },
});