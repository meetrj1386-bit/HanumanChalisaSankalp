import React, { useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ImageBackground, Animated, Easing, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen({ navigation }) {
  const scroll = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(scroll, { toValue: 1, duration: 22000, easing: Easing.linear, useNativeDriver: true })).start();
  }, [scroll]);
  const translateX = scroll.interpolate({ inputRange: [0, 1], outputRange: [0, -300] });

  return (
    <ImageBackground source={require('../../assets/hanuman_bg.jpg')} resizeMode="cover" style={{ flex: 1 }}>
      <LinearGradient colors={['rgba(255,246,233,0.75)','rgba(253,233,209,0.65)']} style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>

          <View style={styles.watermarkWrap}>
            <Animated.Text numberOfLines={1} style={[styles.watermark, { transform: [{ translateX }] }]}>
              जय श्री राम  •  जय सीता राम  •  जय हनुमान  •  जय बजरंगबली  •
              जय श्री राम  •  जय सीता राम  •  जय हनुमान  •  जय बजरंगबली  •
            </Animated.Text>
          </View>

          <Text style={styles.title}>Hanuman Chalisa Sankalp</Text>
          <Text style={styles.subtitle}>
            A daily pause for inner peace, positivity, and better health.
          </Text>

          <View style={styles.highlights}>
            <Text style={styles.point}>• Build a gentle daily habit</Text>
            <Text style={styles.point}>• Let the mind settle in bhakti</Text>
            <Text style={styles.point}>• Invite courage, focus, and strength</Text>
          </View>

          <TouchableOpacity style={styles.cta} onPress={() => navigation.replace('Onboarding')}>
            <LinearGradient colors={['#D96500','#BB4E00']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.ctaGrad}>
              <Text style={styles.ctaText}>Start</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={[styles.watermarkWrap, { marginTop: 18 }]}>
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
  container:{ flex:1, alignItems:'center', padding:24, justifyContent:'center' },
  title:{
    fontSize:30, textAlign:'center', color:'#B34700',
    fontFamily:'PlayfairDisplay_700Bold',
    textShadowColor:'rgba(255,182,66,0.6)', textShadowOffset:{width:0,height:1}, textShadowRadius:12
  },
  subtitle:{
    marginTop:10, fontSize:16, textAlign:'center', maxWidth:340,
    color:'#A35700', fontFamily:'Poppins_400Regular', fontWeight:'600'
  },
  highlights:{ marginTop:16, gap:6, alignSelf:'center' },
  point:{ color:'#7A3E00', fontFamily:'Poppins_600SemiBold', textAlign:'center' },
  cta:{ marginTop:22, borderRadius:22, overflow:'hidden', elevation:2 },
  ctaGrad:{ paddingVertical:16, paddingHorizontal:60, borderRadius:22,
    shadowColor:'#FF9933', shadowOpacity:0.5, shadowRadius:8, shadowOffset:{width:0,height:2} },
  ctaText:{ color:'#fff', fontFamily:'Poppins_900Black', fontSize:20, letterSpacing:0.8 },
  watermarkWrap:{ height:22, overflow:'hidden', opacity:0.6, alignSelf:'stretch' },
  watermark:{ fontSize:16, color:'#C04D00', letterSpacing:1.2, paddingHorizontal:20, fontFamily:'NotoSansDevanagari_700Bold' },
});
