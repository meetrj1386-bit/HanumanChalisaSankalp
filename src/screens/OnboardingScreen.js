import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, ImageBackground, Animated, Easing,
  TextInput, TouchableOpacity, KeyboardAvoidingView, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const STORAGE_KEY = 'sankalp7_state_v2';
const GOALS = [7, 11, 21, 108];

export default function OnboardingScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [goal, setGoal] = useState(7);

  const scroll = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(scroll, { toValue: 1, duration: 28000, easing: Easing.linear, useNativeDriver: true })).start();
  }, [scroll]);
  const translateX = scroll.interpolate({ inputRange: [0, 1], outputRange: [0, -300] });

  const continueSetup = async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const today = new Date().toDateString();
    const prev = raw ? JSON.parse(raw) : {};
    const next = {
      dailyTarget: goal,
      completedToday: 0,
      lastDate: today,
      streak: prev.streak || 0,
      totalCompletedAllTime: prev.totalCompletedAllTime || 0,
      user: { name: name.trim(), email: email.trim() },
      settings: { autoLoopToTarget: true, autoResumePrompt: true },
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    try { await Notifications.requestPermissionsAsync(); } catch {}
    navigation.replace('Home');
  };

  return (
    <ImageBackground source={require('../../assets/hanuman_bg.jpg')} resizeMode="cover" style={{ flex: 1 }}>
      <LinearGradient colors={['rgba(255,246,233,0.80)','rgba(253,233,209,0.72)']} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex:1 }}>
          <View style={styles.watermarkWrap}>
            <Animated.Text numberOfLines={1} style={[styles.watermark, { transform: [{ translateX }] }]}>
              जय श्री राम  •  जय सीता राम  •  जय हनुमान  •  जय बजरंगबली  •
              जय श्री राम  •  जय सीता राम  •  जय हनुमान  •  जय बजरंगबली  •
            </Animated.Text>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.center}>
            <View style={styles.card}>
              <Text style={styles.heading}>Let’s set your Sankalp</Text>
              <Text style={styles.sub}>Tell us your name and choose a daily goal.</Text>

              <Text style={styles.label}>Your Name</Text>
              <TextInput value={name} onChangeText={setName} placeholder="e.g., Rahul" placeholderTextColor="#A07A59" style={styles.input} autoCapitalize="words" />

              <Text style={styles.label}>Email (optional)</Text>
              <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="#A07A59" style={styles.input} keyboardType="email-address" autoCapitalize="none" />

              <Text style={styles.label}>Daily Goal</Text>
              <View style={styles.goalRow}>
                {GOALS.map((g) => (
                  <TouchableOpacity key={g} onPress={() => setGoal(g)} style={[styles.chip, goal === g && styles.chipActive]}>
                    <Text style={[styles.chipText, goal === g && styles.chipTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.cta} onPress={continueSetup}>
                <LinearGradient colors={['#D96500','#BB4E00']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.ctaGrad}>
                  <Text style={styles.ctaText}>Continue</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>

          <View style={[styles.watermarkWrap, { marginBottom: 10 }]}>
            <Animated.Text numberOfLines={1} style={[styles.watermark, { transform: [{ translateX }] }]}>
              जय श्री राम  •  जय सीता राम  •  जय हनुमान  •  जय बजरंगबली  •
              जय श्री राम  •  जय सीता राम  •  जय हनुमान  •  जय बजरंगबली  •
            </Animated.Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  center:{ flex:1, justifyContent:'center', paddingHorizontal:18 },
  card:{ backgroundColor:'rgba(255,255,255,0.86)', borderRadius:18, padding:18, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:12, shadowOffset:{width:0, height:4} },
  heading:{ fontSize:22, color:'#A14800', fontFamily:'PlayfairDisplay_700Bold' },
  sub:{ marginTop:4, color:'#7A3E00', marginBottom:12, fontFamily:'Poppins_400Regular' },
  label:{ marginTop:8, marginBottom:6, color:'#7A3E00', fontFamily:'Poppins_700Bold' },
  input:{ backgroundColor:'#FFF5EC', borderColor:'#E6B78E', borderWidth:1, borderRadius:12, paddingVertical:12, paddingHorizontal:14, color:'#5A2F0F', fontFamily:'Poppins_600SemiBold' },
  goalRow:{ flexDirection:'row', gap:10, marginTop:6, marginBottom:12, flexWrap:'wrap' },
  chip:{ paddingVertical:10, paddingHorizontal:16, borderRadius:20, borderWidth:1, borderColor:'#E6B78E', backgroundColor:'#FFF1E1' },
  chipActive:{ backgroundColor:'#C85700', borderColor:'#C85700' },
  chipText:{ color:'#7A3E00', fontFamily:'Poppins_700Bold' },
  chipTextActive:{ color:'#fff', fontFamily:'Poppins_900Black' },
  cta:{ marginTop:6, borderRadius:16, overflow:'hidden', alignSelf:'center' },
  ctaGrad:{ paddingVertical:14, paddingHorizontal:36, borderRadius:16 },
  ctaText:{ color:'#fff', fontFamily:'Poppins_900Black', fontSize:16 },
  watermarkWrap:{ height:22, overflow:'hidden', opacity:0.6 },
  watermark:{ fontSize:16, color:'#C04D00', letterSpacing:1.2, paddingHorizontal:20, fontFamily:'NotoSansDevanagari_700Bold' },
});
