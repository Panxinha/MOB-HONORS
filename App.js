import { useMemo, useRef, useState, useEffect, useContext, createContext } from 'react-native';
import { View, Text, Image, TouchableOpacity, TextInput, Share, Animated, StyleSheet, useColorScheme, Switch, StatusBar, Alert, Dimensions, ScrollView} from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';

const Stack = createNativeStackNavigator();

// Imagen/textos de inicio (cámbialos aquí)
const HERO_URL = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200';
const HERO_TITLE_MORNING = '¡Buenos días!';
const HERO_TITLE_AFTERNOON = '¡Buenas tardes!';
const HERO_TITLE_NIGHT = '¡Buenas noches!';
const HERO_SUBTITLE = 'Tu compañera de entrenamiento 🏋️‍♀️';
const HERO_BUTTON_TEXT = 'Empezar';

// Tema (Context)
const colors = {
  light: { bg: '#FFFFFF', card: '#F7F7F7', text: '#111827', muted: '#6B7280', primary: '#2563EB', chip: '#E5E7EB' },
  dark:  { bg: '#0B1220', card: '#111827', text: '#E5E7EB', muted: '#9CA3AF', primary: '#60A5FA', chip: '#1F2937' },
};
const ThemeCtx = createContext();
function useThemeController() {
  const system = useColorScheme();
  const hour = new Date().getHours();
  const autoDark = hour >= 20 || hour < 7;
  const initial = (system === 'dark' || autoDark) ? 'dark' : 'light';
  const [mode, setMode] = useState(initial);
  const toggle = () => setMode(m => m === 'light' ? 'dark' : 'light');
  const theme = mode === 'light' ? colors.light : colors.dark;
  const navTheme = mode === 'light' ? DefaultTheme : DarkTheme;
  return { mode, theme, navTheme, toggle };
}

// Datos
const CATEGORIES = ['Piernas', 'Glúteos', 'Abdomen', 'Full-body', 'Cardio'];
const WORKOUTS = [
  { id: 'p1',  title: 'Sentadilla',              minutes: 8, category: 'Piernas',   kcal: 60 },
  { id: 'p2',  title: 'Zancada',                 minutes: 7, category: 'Piernas',   kcal: 45 },
  { id: 'p3',  title: 'Peso muerto',             minutes: 9, category: 'Piernas',   kcal: 70 },
  { id: 'p4',  title: 'Hip thrust',              minutes: 8, category: 'Piernas',   kcal: 65 },
  { id: 'p5',  title: 'Sentadilla Búlgara',      minutes: 8, category: 'Piernas',   kcal: 60 },
  { id: 'p6',  title: 'Puente de Glúteos',       minutes: 6, category: 'Piernas',   kcal: 40 },
  { id: 'p7',  title: 'Prensa',                  minutes: 8, category: 'Piernas',   kcal: 65 },
  { id: 'p8',  title: 'Femoral sentado',         minutes: 6, category: 'Piernas',   kcal: 38 },
  { id: 'p9',  title: 'Femoral tumbado',         minutes: 6, category: 'Piernas',   kcal: 38 },
  { id: 'p10', title: 'Extensiones de rodilla',  minutes: 6, category: 'Piernas',   kcal: 35 },
  { id: 'w3',  title: 'Plancha abdominal',       minutes: 5, category: 'Abdomen',   kcal: 30 },
  { id: 'w4',  title: 'HIIT suave',              minutes: 12,category: 'Cardio',    kcal: 120 },
  { id: 'w7',  title: 'Abducciones de cadera',   minutes: 6, category: 'Glúteos',   kcal: 35 },
  { id: 'w8',  title: 'Plancha lateral',         minutes: 6, category: 'Abdomen',   kcal: 32 },
  { id: 'w9',  title: 'Circuito full-body',      minutes: 15,category: 'Full-body', kcal: 150 },
];

const KCAL_PER_REP = 0.5; // demo
const WEEK_LABELS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const mapDayToMonFirst = d => (d === 0 ? 6 : d - 1);

// Start
function StartScreen({ navigation }) {
  const { theme, mode } = useContext(ThemeCtx);
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(()=>{Animated.timing(fade,{toValue:1,duration:900,useNativeDriver:true}).start();},[]);
  const h = new Date().getHours();
  const greeting = h<12?HERO_TITLE_MORNING:h<20?HERO_TITLE_AFTERNOON:HERO_TITLE_NIGHT;

  return (
    <SafeAreaView style={[styles.flex,{backgroundColor:theme.bg}]}>
      <StatusBar barStyle={mode==='light'?'dark-content':'light-content'} />
      <View style={{padding:24}}>
        <Text style={[styles.h1,{color:theme.text}]}>{greeting}</Text>
        <Text style={[styles.muted,{color:theme.muted,marginTop:6}]}>{HERO_SUBTITLE}</Text>
      </View>
      <Animated.View style={{flex:1,opacity:fade,alignItems:'center',justifyContent:'center'}}>
        <Image source={{uri:HERO_URL}} style={{width:'88%',height:260,borderRadius:20}} resizeMode="cover" />
        <TouchableOpacity onPress={()=>navigation.replace('Home')}
          style={{marginTop:24,backgroundColor:theme.primary,paddingHorizontal:22,paddingVertical:12,borderRadius:14}}>
          <Text style={{color:'white',fontWeight:'700',fontSize:16}}>{HERO_BUTTON_TEXT}</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

// Home
function HomeScreen({ navigation }) {
  const { theme, mode, toggle } = useContext(ThemeCtx);
  const [query,setQuery] = useState('');
  const [category,setCategory] = useState('Todas');
  const [pickedImage,setPickedImage] = useState(null);
  const fadeIn = useRef(new Animated.Value(0)).current;

  // kcal semana + modal de reps
  const [weekKcal,setWeekKcal] = useState([0,0,0,0,0,0,0]);
  const [selectedExercise,setSelectedExercise] = useState(null);
  const [selectedReps,setSelectedReps] = useState('');

  useEffect(()=>{Animated.timing(fadeIn,{toValue:1,duration:600,useNativeDriver:true}).start();},[]);

  // Buscador robusto (ignora tildes/Mayus)
  const norm = (s) => (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const filtered = useMemo(()=>{
    const q = norm(query);
    return WORKOUTS.filter(w => (category==='Todas' || w.category===category) && norm(w.title).includes(q));
  },[query,category]);

  const pickImage = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if(status!=='granted'){ Alert.alert('Permisos','Necesito permiso para acceder a tus fotos'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if(!res.canceled) setPickedImage(res.assets[0].uri);
  };

  const onPressItem = (item) => {
    if(item.category === 'Piernas'){ setSelectedExercise(item); setSelectedReps(''); }
    else { navigation.navigate('Workout',{ item }); }
  };

  const addReps = () => {
    const reps = parseFloat(selectedReps);
    if(isNaN(reps) || reps <= 0){ Alert.alert('Dato inválido','Ingresa repeticiones > 0'); return; }
    const idx = mapDayToMonFirst(new Date().getDay());
    const addKcal = Math.round(reps * KCAL_PER_REP);
    const next = [...weekKcal]; next[idx] += addKcal; setWeekKcal(next);
    Alert.alert('Registrado', `${selectedExercise.title}: ${reps} reps (~${addKcal} kcal)`);
    setSelectedExercise(null); setSelectedReps('');
  };

  const screenWidth = Dimensions.get('window').width;
  const chartData = { labels: WEEK_LABELS, datasets: [{ data: weekKcal }] };

  return (
    <SafeAreaView style={[styles.flex,{backgroundColor:theme.bg}]}>
      <StatusBar barStyle={mode==='light'?'dark-content':'light-content'} />
      <ScrollView contentContainerStyle={{paddingBottom:32}}>
        {/* Header */}
        <View style={{paddingHorizontal:16,paddingTop:8,paddingBottom:6,flexDirection:'row',alignItems:'center',gap:12}}>
          <Text style={[styles.h2,{color:theme.text,flex:1}]}>Tu día fit</Text>
          <Text style={[styles.muted,{color:theme.muted,marginRight:6}]}>Modo {mode==='light'?'Claro':'Oscuro'}</Text>
          <Switch value={mode==='dark'} onValueChange={toggle} />
        </View>

        {/* Search + filter + subir */}
        <View style={{paddingHorizontal:16}}>
          <TextInput
            placeholder="Buscar ejercicio..."
            placeholderTextColor={theme.muted}
            value={query}
            onChangeText={setQuery}
            style={[styles.input,{backgroundColor:theme.card,color:theme.text,borderColor:theme.chip}]}
          />
          <View style={{flexDirection:'row',gap:8,marginTop:8,flexWrap:'wrap'}}>
            {['Todas',...CATEGORIES].map(c=>(
              <TouchableOpacity key={c} onPress={()=>setCategory(c)}
                style={[styles.chip,{backgroundColor:category===c?theme.primary:theme.chip}]}>
                <Text style={{color:category===c?'#fff':theme.text,fontWeight:'600'}}>{c}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={pickImage} style={[styles.chip,{backgroundColor:theme.card}]}>
              <Text style={{color:theme.text}}>Subir imagen</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Imagen subida */}
        {pickedImage && (
          <View style={{paddingHorizontal:16,marginTop:6}}>
            <Image source={{uri:pickedImage}} style={{width:'100%',height:140,borderRadius:12}} />
          </View>
        )}

        {/* Gráfico semanal */}
        <View style={{paddingHorizontal:8,marginTop:12}}>
          <LineChart
            data={chartData}
            width={screenWidth-16}
            height={200}
            chartConfig={{
              backgroundGradientFrom: theme.card,
              backgroundGradientTo: theme.card,
              color: ()=>theme.primary,
              labelColor: ()=>theme.muted,
              decimalPlaces: 0,
              propsForDots: { r: '3' }
            }}
            style={{borderRadius:12,alignSelf:'center'}}
          />
          <Text style={{textAlign:'center',color:theme.muted,marginTop:6}}>Kcal quemadas por día (semana actual)</Text>
        </View>

        {/* Lista de ejercicios */}
        <Animated.View style={{opacity:fadeIn,marginTop:10,paddingHorizontal:16}}>
          {filtered.map(item=>(
            <TouchableOpacity key={item.id} onPress={()=>onPressItem(item)}
              style={[styles.card,{backgroundColor:theme.card,marginBottom:10}]}>
              <View style={{flex:1}}>
                <Text style={{color:theme.text,fontWeight:'700',fontSize:16}}>{item.title}</Text>
                <Text style={{color:theme.muted,marginTop:4}}>{item.minutes} min · ~{item.kcal} kcal</Text>
                <View style={{flexDirection:'row',gap:6,marginTop:10}}>
                  <View style={[styles.tag,{backgroundColor:theme.chip}]}>
                    <Text style={{color:theme.text}}>{item.category}</Text>
                  </View>
                  {item.category==='Piernas' && (
                    <TouchableOpacity onPress={()=>onPressItem(item)} style={[styles.tag,{backgroundColor:theme.primary}]}>
                      <Text style={{color:'#fff'}}>Registrar reps</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {filtered.length===0 && <Text style={{color:theme.muted,textAlign:'center',marginTop:40}}>Sin resultados</Text>}
        </Animated.View>
      </ScrollView>

      {/* Modal de reps */}
      {selectedExercise && (
        <View style={{position:'absolute',left:0,right:0,bottom:0,backgroundColor:theme.card,padding:16,
                      borderTopLeftRadius:16,borderTopRightRadius:16,shadowColor:'#000',shadowOpacity:0.2,shadowRadius:10}}>
          <Text style={{color:theme.text,fontWeight:'800',fontSize:16}}>Registrar repeticiones</Text>
          <Text style={{color:theme.muted,marginTop:4}}>{selectedExercise.title}</Text>
          <TextInput
            placeholder="Repeticiones"
            placeholderTextColor={theme.muted}
            keyboardType="numeric"
            value={selectedReps}
            onChangeText={setSelectedReps}
            style={[styles.input,{backgroundColor:theme.bg,color:theme.text,borderColor:theme.chip,marginTop:8}]}
          />
          <View style={{flexDirection:'row',gap:10,marginTop:10}}>
            <TouchableOpacity onPress={()=>setSelectedExercise(null)} style={{flex:1,padding:12,borderRadius:12,backgroundColor:theme.chip}}>
              <Text style={{textAlign:'center',color:theme.text,fontWeight:'700'}}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={addReps} style={{flex:1,padding:12,borderRadius:12,backgroundColor:theme.primary}}>
              <Text style={{textAlign:'center',color:'#fff',fontWeight:'700'}}>Agregar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// Detalle
function WorkoutScreen({ route }) {
  const { theme, mode } = useContext(ThemeCtx);
  const { item } = route.params;
  return (
    <SafeAreaView style={[styles.flex,{backgroundColor:theme.bg}]}>
      <StatusBar barStyle={mode==='light'?'dark-content':'light-content'} />
      <View style={{padding:20}}>
        <Text style={[styles.h2,{color:theme.text}]}>{item.title}</Text>
        <Text style={{color:theme.muted,marginTop:6}}>Categoría: {item.category}</Text>
        <Text style={{color:theme.muted,marginTop:6}}>Duración: {item.minutes} min</Text>
        <Text style={{color:theme.muted,marginTop:6}}>Estimación: ~{item.kcal} kcal</Text>
      </View>
    </SafeAreaView>
  );
}

// App
export default function App(){
  const themeCtrl = useThemeController();
  const { navTheme } = themeCtrl;
  return (
    <ThemeCtx.Provider value={themeCtrl}>
      <SafeAreaProvider>
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator screenOptions={{headerShown:false}}>
            <Stack.Screen name="Start" component={StartScreen}/>
            <Stack.Screen name="Home" component={HomeScreen}/>
            <Stack.Screen name="Workout" component={WorkoutScreen}/>
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeCtx.Provider>
  );
}

// Estilos
const styles = StyleSheet.create({
  flex:{flex:1},
  h1:{fontSize:28,fontWeight:'800'},
  h2:{fontSize:22,fontWeight:'800'},
  muted:{fontSize:14},
  input:{borderWidth:1,borderRadius:12,paddingHorizontal:14,paddingVertical:10,fontSize:16},
  chip:{paddingHorizontal:12,paddingVertical:8,borderRadius:999},
  card:{padding:14,borderRadius:14,flexDirection:'row',gap:12},
  tag:{paddingHorizontal:10,paddingVertical:6,borderRadius:999},
});