import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'sankalp7_state_v2';

export default function PlayerScreen() {
  const soundRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          // Make sure your file path & name match exactly
          require('../../assets/audio/Shree_Hanuman_Chalisa.mp3'),
          { shouldPlay: true, staysActiveInBackground: true }
        );

        soundRef.current = sound;
        setIsPlaying(true);

        sound.setOnPlaybackStatusUpdate(async (status) => {
          if (!mounted) return;

          // When the current path finishes
          if (status.didJustFinish) {
            try {
              // Get stored state
              const raw = await AsyncStorage.getItem(STORAGE_KEY);
              const s = raw ? JSON.parse(raw) : null;

              if (s) {
                const today = new Date().toDateString();
                const newCompleted = (s.completedToday || 0) + 1;

                // Update progress
                let next = {
                  ...s,
                  completedToday: newCompleted,
                  totalCompletedAllTime: (s.totalCompletedAllTime || 0) + 1,
                  lastDate: today
                };

                // If daily target achieved, increase streak
                if (newCompleted >= s.dailyTarget && (s.completedToday || 0) < s.dailyTarget) {
                  next.streak = (s.streak || 0) + 1;
                  Alert.alert('Jai Hanuman 🙏', 'Today’s sankalp complete. Your streak grows stronger.');
                }

                // Save updated state
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));

                // Check if we should auto-loop to hit daily target
                if (s.settings?.autoLoopToTarget && newCompleted < s.dailyTarget) {
                  await soundRef.current?.replayAsync();
                  setIsPlaying(true);
                } else {
                  setIsPlaying(false);
                }
              }
            } catch (e) {
              console.log('Error updating playback status:', e);
            }
          }
        });
      } catch (e) {
        Alert.alert(
          'Audio Missing',
          'Please add your Hanuman Chalisa MP3 at:\nassets/audio/Shree_Hanuman_Chalisa.mp3'
        );
      }
    })();

    return () => {
      mounted = false;
      soundRef.current?.unloadAsync();
    };
  }, []);

  // Toggle Play/Pause manually
  const toggle = async () => {
    if (!soundRef.current) return;
    const s = await soundRef.current.getStatusAsync();
    if (s.isLoaded) {
      if (s.isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hanuman Chalisa</Text>
      <TouchableOpacity style={styles.btn} onPress={toggle}>
        <Text style={styles.btnText}>{isPlaying ? 'Pause' : 'Play'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF6E9' },
  title: { fontSize: 22, fontWeight: '800', color: '#A14800', marginBottom: 16 },
  btn: { backgroundColor: '#C85700', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 16 },
  btnText: { color: '#fff', fontWeight: '800' }
});
