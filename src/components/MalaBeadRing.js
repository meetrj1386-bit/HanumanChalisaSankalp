import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export default function MalaBeadsRing({ value=0, target=7, size=260 }) {
  const beads = 108;
  const filledFraction = Math.min(value / target, 1);
  const filledBeads = Math.floor(beads * filledFraction);
  const cx = size/2, cy = size/2, r = (size/2) - 10;

  const nodes = [];
  for (let i = 0; i < beads; i++) {
    const angle = (i / beads) * 2 * Math.PI - Math.PI/2; // start at top
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    const filled = i < filledBeads;
    nodes.push(
      <Circle key={i} cx={x} cy={y} r={i % 27 === 0 ? 3.5 : 2.4} fill={filled ? '#C85700' : '#EFD6BE'} />
    );
  }

  return (
    <View style={{ width:size, height:size, alignItems:'center', justifyContent:'center' }}>
      <Svg width={size} height={size}>{nodes}</Svg>
    </View>
  );
}
