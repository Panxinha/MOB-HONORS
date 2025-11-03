import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function UploadScreen() {
  const [uri, setUri] = useState(null);

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true, mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!res.canceled) setUri(res.assets[0].uri);
  };

  return (
    <View style={styles.box}>
      <TouchableOpacity onPress={pick} style={styles.btn}><Text style={{color:'white'}}>Elegir imagen</Text></TouchableOpacity>
      {uri && <Image source={{ uri }} style={{ width: 220, height: 220, borderRadius: 14, marginTop: 16 }}/>}
    </View>
  );
}
const styles = StyleSheet.create({ box:{ flex:1, alignItems:'center', justifyContent:'center' }, btn:{ backgroundColor:'#3B82F6', padding:12, borderRadius:10 }});
