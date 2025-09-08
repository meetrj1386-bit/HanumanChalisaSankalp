import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export default function MalaRing({ value=0, target=7, size=220, stroke=12, color='#C24A00', track='#F5E4D4' }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / target, 1);
  const dash = circumference * progress;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size/2} cy={size/2} r={radius} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size/2}
          cy={size/2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash}, ${circumference - dash}`}
        />
      </Svg>
<View style={[StyleSheet.absoluteFillObject, styles.center]}>
  <Text style={styles.counter}>
    <Text style={styles.big}>{value}</Text> / {target}
  </Text>
  <Text style={styles.sub}>Today</Text>
</View>

    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems:'center', justifyContent:'center' },
  counter: { color:'#9B4A12', fontWeight:'700', fontSize:18 },
  big: { fontSize:44, color:'#C24A00', fontWeight:'800' },
  sub: { marginTop:4, color:'#9B4A12' }
});
