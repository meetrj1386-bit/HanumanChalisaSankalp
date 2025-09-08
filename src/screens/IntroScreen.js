import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

const STORAGE_KEY = 'sankalp7_state_v2';

export default function IntroScreen({ navigation }) {
  const spinA = useRef(new Animated.Value(0)).current;
  const fadeA = useRef(new Animated.Value(0)).current;
  const breathA = useRef(new Animated.Value(0)).current;
  const bellRef = useRef(null);

  useEffect(() => {
    Animated.loop(Animated.timing(spinA, { toValue: 1, duration: 30000, easing: Easing.linear, useNativeDriver: true })).start();
    Animated.loop(Animated.sequence([
      Animated.timing(breathA, { toValue: 1, duration: 2000, useNativeDriver: true }),
      Animated.timing(breathA, { toValue: 0, duration: 2000, useNativeDriver: true }),
    ])).start();

    (async () => {
      Animated.timing(fadeA, { toValue: 1, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/audio/temple_bell.mp3'),
          { volume: 0.25, shouldPlay: false }
        );
        bellRef.current = sound;
        setTimeout(() => sound.playAsync().catch(()=>{}), 900);
      } catch {}
    })();

    const t = setTimeout(async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const s = raw ? JSON.parse(raw) : null;
      navigation.replace(s?.user?.name ? 'Home' : 'Welcome');
    }, 3500);

    return () => { clearTimeout(t); bellRef.current?.unloadAsync(); };
  }, [navigation, spinA, fadeA, breathA]);

  const spin = spinA.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const scale = breathA.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1.04] });

  return (
    <LinearGradient colors={['#FFF3E2', '#F9E3C7']} style={{ flex:1 }}>
      <View style={styles.center}>
        <Animated.View style={{ transform: [{ rotate: spin }, { scale }] }}>
          <Image source={require('../../assets/intro/ram_spiral.png')} style={{ width: 280, height: 280, opacity: 0.9 }} resizeMode="contain"/>
        </Animated.View>
        <Animated.Text style={[styles.jai, { opacity: fadeA }]}>जय हनुमान</Animated.Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: { flex:1, alignItems:'center', justifyContent:'center' },
  jai: {
    marginTop: 18, fontSize: 28, color: '#B34700', fontFamily: 'NotoSansDevanagari_700Bold',
    textShadowColor: 'rgba(255,182,66,0.55)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 10,
  },
});
