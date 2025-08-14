import { Pressable, Animated } from 'react-native';
import { useRef } from 'react';
import { useRouter } from 'expo-router';

const AnimatedLinkButton = ({ href, children, style }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={style}
        android_ripple={{ color: '#fff2' }}
        onPress={() => router.push(href)}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

export default AnimatedLinkButton;