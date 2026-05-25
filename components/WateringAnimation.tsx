// components/WateringAnimation.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onComplete?: () => void;
}

export function WateringAnimation({ visible, onComplete }: Props) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-30);
  const rotate = useSharedValue(0);
  const dropOpacity1 = useSharedValue(0);
  const dropOpacity2 = useSharedValue(0);
  const dropOpacity3 = useSharedValue(0);
  const dropY1 = useSharedValue(0);
  const dropY2 = useSharedValue(0);
  const dropY3 = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;

    // Вхід лійки
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withSpring(0, { damping: 12 });

    // Нахил лійки
    rotate.value = withSequence(
      withTiming(-30, { duration: 400, easing: Easing.out(Easing.quad) }),
      withTiming(-30, { duration: 1200 }),
      withTiming(0, { duration: 400 })
    );

    // Крапля 1
    const t1 = setTimeout(() => {
      dropOpacity1.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(1, { duration: 600 }),
        withTiming(0, { duration: 200 })
      );
      dropY1.value = withTiming(40, { duration: 800, easing: Easing.in(Easing.quad) });
    }, 400);

    // Крапля 2
    const t2 = setTimeout(() => {
      dropOpacity2.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(1, { duration: 600 }),
        withTiming(0, { duration: 200 })
      );
      dropY2.value = withTiming(40, { duration: 800, easing: Easing.in(Easing.quad) });
    }, 600);

    // Крапля 3
    const t3 = setTimeout(() => {
      dropOpacity3.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(1, { duration: 600 }),
        withTiming(0, { duration: 200 })
      );
      dropY3.value = withTiming(40, { duration: 800, easing: Easing.in(Easing.quad) });
    }, 750);

    // Вихід та callback через звичайний setTimeout (без runOnJS)
    const t4 = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(-30, { duration: 300 });
      // Скидаємо значення крапель
      dropY1.value = 0;
      dropY2.value = 0;
      dropY3.value = 0;
    }, 1800);

    const t5 = setTimeout(() => {
      onComplete?.();
    }, 2100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const canStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const drop1Style = useAnimatedStyle(() => ({
    opacity: dropOpacity1.value,
    transform: [{ translateY: dropY1.value }],
  }));
  const drop2Style = useAnimatedStyle(() => ({
    opacity: dropOpacity2.value,
    transform: [{ translateY: dropY2.value }],
  }));
  const drop3Style = useAnimatedStyle(() => ({
    opacity: dropOpacity3.value,
    transform: [{ translateY: dropY3.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, containerStyle]} pointerEvents="none">
      <Animated.View style={canStyle}>
        <Ionicons name="water" size={64} color="#7dd1aa" />
      </Animated.View>
      <View style={styles.dropsContainer}>
        <Animated.View style={[styles.drop, drop1Style]}>
          <Ionicons name="water-outline" size={14} color="#4db88a" />
        </Animated.View>
        <Animated.View style={[styles.drop, drop2Style, { marginLeft: 12 }]}>
          <Ionicons name="water-outline" size={20} color="#7dd1aa" />
        </Animated.View>
        <Animated.View style={[styles.drop, drop3Style, { marginLeft: 6 }]}>
          <Ionicons name="water-outline" size={12} color="#4db88a" />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  dropsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'flex-start',
    height: 50,
  },
  drop: {
    position: 'absolute',
    top: 0,
  },
});
