import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';

const REM_KEY = 'sankalp7_reminders_v1';

export default function RemindersScreen() {
  const [times, setTimes] = useState([]); // array of ISO strings or HH:mm strings
  const [showPicker, setShowPicker] = useState(false);
  const [time, setTime] = useState(new Date());

  const MESSAGES = [
    '✨ Pause. Breathe. Listen to Hanuman Chalisa.',
    '🙏 Jai Hanuman! A few minutes of bhakti can change your day.',
    '🕉️ Strength, focus, and peace — start your sankalp now.',
    '💡 Inner peace begins with devotion.',
    '🔥 Unleash your energy — one Chalisa now.',
  ];

  useEffect(() => { (async () => {
    const saved = await AsyncStorage.getItem(REM_KEY);
    setTimes(saved ? JSON.parse(saved) : []);
  })(); }, []);

  const saveTimes = async (arr) => { setTimes(arr); await AsyncStorage.setItem(REM_KEY, JSON.stringify(arr)); };

  const scheduleFor = async (d) => {
    const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    await Notifications.scheduleNotificationAsync({
      content: { title: '🕉 Sankalp Reminder', body: msg, sound: 'default' },
      trigger: { hour: d.getHours(), minute: d.getMinutes(), repeats: true },
    });
  };

  const addTime = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = [...times, time.toISOString()];
    await saveTimes(updated);
    await scheduleFor(time);
    Alert.alert('✅ Reminder Added', 'We’ll remind you daily with a motivational message!');
    setShowPicker(false);
  };

  const removeAt = async (i) => {
    const updated = times.filter((_, idx) => idx !== i);
    await saveTimes(updated);
    Alert.alert('Removed', 'This reminder has been removed.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Motivational Reminders</Text>
      <Text style={styles.sub}>Short, devotional prompts that help you honor your sankalp—without nagging.</Text>

      <FlatList
        data={times}
        keyExtractor={(t, i) => t + i}
        renderItem={({ item, index }) => {
          const d = new Date(item);
          const label = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return (
            <View style={styles.row}>
              <Text style={styles.timeText}>{label}</Text>
              <TouchableOpacity onPress={() => removeAt(index)}><Text style={styles.remove}>Remove</Text></TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No reminders yet.</Text>}
      />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.soft} onPress={() => setShowPicker(true)}><Text style={styles.softText}>+ Add time</Text></TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          mode="time"
          value={time}
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selected) => {
            if (selected) setTime(selected);
            setShowPicker(false);
            setTimeout(addTime, 10);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:20, backgroundColor:'#FFF6E9' },
  title:{ fontSize:22, fontWeight:'900', color:'#A14800', marginBottom:6 },
  sub:{ color:'#7A3E00', marginBottom:12 },
  row:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:12, paddingHorizontal:14, marginBottom:10, borderRadius:10, backgroundColor:'#FFE3CC' },
  timeText:{ color:'#7A3E00', fontWeight:'800', fontSize:18 },
  remove:{ color:'#C25700', fontWeight:'800' },
  empty:{ color:'#7A3E00', opacity:0.7, marginVertical:12, textAlign:'center' },
  actions:{ flexDirection:'row', gap:12, marginTop:10 },
  soft:{ backgroundColor:'#FFE3CC', paddingVertical:12, paddingHorizontal:16, borderRadius:12 },
  softText:{ color:'#7A3E00', fontWeight:'800' },
});
