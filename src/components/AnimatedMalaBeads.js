import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export default function AnimatedMalaBeads({
  value = 0,
  target = 7,
  size = 300,
  trackColor = '#EDC8A3',
  fillColor = '#B94C00',
  pulseColor = '#F4A657',
  spinning = false,
  handIndex = null,       // 0..107 bead position for pointer
  playing = false,        // gentle sway on the pointer
}) {
  const BEADS = 108;
  const filledFraction = Math.max(0, Math.min(value / Math.max(target, 1), 1));
  const filledBeads = Math.floor(BEADS * filledFraction);
  const nextIndex = Math.min(filledBeads, BEADS - 1);

  const cx = size / 2, cy = size / 2, r = size / 2 - 12;

  // Pulse (next bead)
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.25] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.65] });

  // Slow spin
  const spinA = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let anim;
    if (spinning) {
      anim = Animated.loop(Animated.timing(spinA, { toValue: 1, duration: 12000, useNativeDriver: true }));
      anim.start();
    } else {
      spinA.stopAnimation(() => spinA.setValue(0));
    }
    return () => anim?.stop();
  }, [spinning, spinA]);
  const spin = spinA.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // Pointer sway
  const rockA = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let anim;
    if (playing) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(rockA, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(rockA, { toValue: 0, duration: 700, useNativeDriver: true }),
        ])
      );
      anim.start();
    } else {
      rockA.stopAnimation(() => rockA.setValue(0));
    }
    return () => anim?.stop();
  }, [playing, rockA]);
  const rockDeg = rockA.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '6deg'] });

  // Bead coordinates
  const coords = Array.from({ length: BEADS }).map((_, i) => {
    const t = (i / BEADS) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + r * Math.cos(t), y: cy + r * Math.sin(t), angleDeg: (t * 180) / Math.PI + 90, i };
  });

  const next = coords[nextIndex];
  const pointerIdx = handIndex != null ? Math.max(0, Math.min(handIndex, BEADS - 1)) : null;
  const pointer = pointerIdx != null ? coords[pointerIdx] : null;

  return (
    <Animated.View style={{ width: size, height: size, transform: [{ rotate: spin }] }}>
      <Svg width={size} height={size}>
        {coords.map(({ x, y, i }) => {
          const isGuruBead = i % 27 === 0;
          const filled = i < filledBeads;
          return <Circle key={i} cx={x} cy={y} r={isGuruBead ? 4.2 : 3.0} fill={filled ? fillColor : trackColor} />;
        })}
      </Svg>

      {/* Pulsing next bead */}
      {filledBeads < BEADS && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pulse,
            { transform: [{ translateX: next.x - 7 }, { translateY: next.y - 7 }, { scale: pulseScale }], opacity: pulseOpacity, backgroundColor: pulseColor }
          ]}
        />
      )}

      {/* Saffron pointer */}
      {pointer && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.handWrap,
            { transform: [{ translateX: pointer.x - 9 }, { translateY: pointer.y - 9 }, { rotate: `${pointer.angleDeg}deg` }, { rotate: rockDeg }] }
          ]}
        >
          <View style={styles.handTip} />
          <View style={styles.handStem} />
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pulse: { position: 'absolute', width: 14, height: 14, borderRadius: 7 },
  handWrap: { position: 'absolute', width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  handTip: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#D86B11' },
  handStem: { width: 3, height: 10, marginTop: -1, borderRadius: 2, backgroundColor: '#D86B11' },
});
