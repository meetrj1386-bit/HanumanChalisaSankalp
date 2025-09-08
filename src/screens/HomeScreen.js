import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView,
  AppState, ImageBackground, Animated, Easing
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import AnimatedMalaBeads from '../components/AnimatedMalaBeads';

const STORAGE_KEY = 'sankalp7_state_v2';

const defaultState = {
  dailyTarget: 7,
  completedToday: 0,
  lastDate: null,
  streak: 0,
  totalCompletedAllTime: 0,
  user: { name: '', email: '' },
  settings: { autoLoopToTarget: true, autoResumePrompt: true }
};

export default function HomeScreen({ navigation }) {
  const [state, setState] = useState(defaultState);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef(null);

  const [handIndex, setHandIndex] = useState(null);

  const scroll = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(scroll, { toValue: 1, duration: 28000, easing: Easing.linear, useNativeDriver: true })).start();
  }, [scroll]);
  const translateX = scroll.interpolate({ inputRange: [0, 1], outputRange: [0, -300] });

  const loadState = async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    let s = raw ? JSON.parse(raw) : defaultState;
    const today = new Date().toDateString();
    if (s.lastDate !== today) s = { ...s, completedToday: 0, lastDate: today };
    setState(s);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  };
  useEffect(() => { loadState(); }, []);
  useFocusEffect(React.useCallback(() => { loadState(); }, []));

  const saveState = async (s) => { setState(s); await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(s)); };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/audio/Shree_Hanuman_Chalisa.mp3'),
          { shouldPlay: false, staysActiveInBackground: true }
        );
        if (!mounted) return;
        soundRef.current = sound;

        sound.setOnPlaybackStatusUpdate(async (status) => {
          if (!mounted) return;

          if (status?.isLoaded && status.isPlaying && status.durationMillis > 0) {
            const frac = Math.min(1, status.positionMillis / status.durationMillis);
            const idx = Math.min(107, Math.floor(frac * 108));
            setHandIndex(idx);
          }

          if (status.didJustFinish) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const raw = await AsyncStorage.getItem(STORAGE_KEY);
            const s = raw ? JSON.parse(raw) : null;
            if (s) {
              const today = new Date().toDateString();
              const newCompleted = (s.completedToday || 0) + 1;
              let next = { ...s, completedToday: newCompleted, totalCompletedAllTime: (s.totalCompletedAllTime || 0) + 1, lastDate: today };
              if (newCompleted >= s.dailyTarget && (s.completedToday || 0) < s.dailyTarget) {
                next.streak = (s.streak || 0) + 1;
                Alert.alert('Jai Hanuman 🙏', 'Today’s sankalp complete. Your streak grows stronger.');
              }
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
              setState(next);

              if (s.settings?.autoLoopToTarget && newCompleted < s.dailyTarget) {
                await soundRef.current?.replayAsync();
                setIsPlaying(true);
              } else {
                setIsPlaying(false);
                setHandIndex(null);
              }
            }
          }
        });
      } catch (e) {
        Alert.alert('Audio Missing', 'Add MP3 at assets/audio/Shree_Hanuman_Chalisa.mp3');
      }
    })();
    return () => { mounted = false; soundRef.current?.unloadAsync(); };
  }, []);

  // Smooth pointer polling
  useEffect(() => {
    let timer;
    const tick = async () => {
      try {
        const s = await soundRef.current?.getStatusAsync();
        if (s?.isLoaded && s.isPlaying && s.durationMillis > 0) {
          const frac = Math.min(1, s.positionMillis / s.durationMillis);
          const idx = Math.min(107, Math.floor(frac * 108));
          setHandIndex(idx);
        }
      } catch {}
    };
    if (isPlaying) timer = setInterval(tick, 250);
    else setHandIndex(null);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const togglePlay = async () => {
    if (!soundRef.current) return;
    const st = await soundRef.current.getStatusAsync();
    if (!st.isLoaded) return;
    if (st.isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const increment = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const today = new Date().toDateString();
    const newCompleted = state.completedToday + 1;
    let s = { ...state, completedToday: newCompleted, totalCompletedAllTime: (state.totalCompletedAllTime || 0) + 1, lastDate: today };
    if (newCompleted >= state.dailyTarget && state.completedToday < state.dailyTarget) {
      s.streak = (state.streak || 0) + 1;
      Alert.alert('Jai Hanuman 🙏', 'Today’s sankalp complete. Your streak grows stronger.');
    }
    await saveState(s);
  };
  const decrement = async () => { if (state.completedToday > 0) await saveState({ ...state, completedToday: state.completedToday - 1 }); };

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (st) => {
      if (st === 'active') {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const s = raw ? JSON.parse(raw) : null;
        if (s?.settings?.autoResumePrompt && s.completedToday < s.dailyTarget) {
          Alert.alert('Continue sankalp?', `You are at ${s.completedToday}/${s.dailyTarget}. Continue now?`,
            [{ text: 'Not now' }, { text: 'Play', onPress: () => togglePlay() }]);
        }
      }
    });
    return () => sub.remove();
  }, []);

  const name = state.user?.name ? `, ${state.user.name}` : '';

  return (
    <ImageBackground source={require('../../assets/hanuman_bg.jpg')} resizeMode="cover" style={{ flex: 1 }}>
      <LinearGradient colors={['rgba(255,246,233,0.80)','rgba(253,233,209,0.72)']} style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>

          <View style={styles.watermarkWrap}>
            <Animated.Text numberOfLines={1} style={[styles.watermark, { transform: [{ translateX }] }]}>
              जय श्री राम  •  जय सीता राम  •  जय हनुमान  •  जय बजरंगबली  •
              जय श्री राम  •  जय सीता राम  •  जय हनुमान  •  जय बजरंगबली  •
            </Animated.Text>
          </View>

          <Text style={styles.brand}>Hanuman Chalisa Sankalp</Text>
          <Text style={styles.tagline}>Welcome{name}. Your daily connection.</Text>

          <View style={{ alignItems: 'center', marginTop: 8 }}>
            <AnimatedMalaBeads
              value={state.completedToday}
              target={state.dailyTarget}
              size={320}
              spinning={isPlaying}
              playing={isPlaying}
              handIndex={handIndex}
              trackColor="#EDC8A3"
              fillColor="#B94C00"
              pulseColor="#F4A657"
            />
            <Text style={styles.counterMain}>
              {state.completedToday} <Text style={styles.thin}>/ {state.dailyTarget}</Text>
            </Text>
            <Text style={styles.meta}>Today • Streak {state.streak} • Lifetime {state.totalCompletedAllTime}</Text>
          </View>

          <View style={{ marginTop: 14, gap: 12 }}>
            <TouchableOpacity style={styles.cta} onPress={togglePlay}>
              <LinearGradient colors={['#D96500','#BB4E00']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.ctaGrad}>
                <Text style={styles.ctaText}>{isPlaying ? 'Pause' : 'Play Now'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.row}>
              <TouchableOpacity style={styles.soft} onPress={increment}><Text style={styles.softText}>+ Mark One</Text></TouchableOpacity>
              <TouchableOpacity style={styles.ghost} onPress={decrement}><Text style={styles.ghostText}>Undo</Text></TouchableOpacity>
            </View>

            <View style={styles.row}>
              <TouchableOpacity onPress={() => navigation.navigate('Onboarding')}><Text style={styles.link}>Change Goal / Profile</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Reminders')}><Text style={styles.link}>Edit Reminders</Text></TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:20, justifyContent:'flex-start' },
  brand:{
    textAlign:'center', fontSize:26, color:'#A14800', marginTop:6,
    fontFamily:'PlayfairDisplay_700Bold',
    textShadowColor:'rgba(255,178,102,0.35)', textShadowOffset:{width:0,height:1}, textShadowRadius:8
  },
  tagline:{ textAlign:'center', color:'#8B4A16', marginTop:4, fontFamily:'Poppins_400Regular' },
  counterMain:{ marginTop:10, textAlign:'center', fontSize:48, color:'#C85700', fontFamily:'Poppins_900Black' },
  thin:{ fontFamily:'Poppins_700Bold', color:'#A14800' },
  meta:{ textAlign:'center', color:'#7A3E00', marginTop:4, fontFamily:'Poppins_600SemiBold' },
  cta:{ borderRadius:16, overflow:'hidden', elevation:2, alignSelf:'center' },
  ctaGrad:{ paddingVertical:14, paddingHorizontal:36, borderRadius:16 },
  ctaText:{ color:'#fff', fontFamily:'Poppins_900Black', fontSize:18 },
  row:{ flexDirection:'row', justifyContent:'center', gap:12, marginTop:8 },
  soft:{ backgroundColor:'#FFE3CC', paddingVertical:12, paddingHorizontal:18, borderRadius:12 },
  softText:{ color:'#7A3E00', fontFamily:'Poppins_700Bold' },
  ghost:{ paddingVertical:12, paddingHorizontal:18, borderRadius:12, borderWidth:1, borderColor:'#E6B78E' },
  ghostText:{ color:'#7A3E00', fontFamily:'Poppins_700Bold' },
  link:{ color:'#C25700', fontFamily:'Poppins_900Black' },
  watermarkWrap:{ height:22, overflow:'hidden', opacity:0.6 },
  watermark:{ fontSize:16, color:'#C04D00', letterSpacing:1.2, paddingHorizontal:20, fontFamily:'NotoSansDevanagari_700Bold' },
});
