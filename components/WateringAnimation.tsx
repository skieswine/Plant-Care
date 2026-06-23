// components/WateringAnimation.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface Props {
  visible: boolean;
  onComplete?: () => void;
}

export function WateringAnimation({ visible, onComplete }: Props) {
  const finished = useRef(false);

  useEffect(() => {
    if (!visible) return;
    finished.current = false;
    // Запобіжник: якщо onAnimationFinish не спрацює (буває на деяких пристроях),
    // все одно завершуємо через ~2с
    const timer = setTimeout(() => {
      if (!finished.current) {
        finished.current = true;
        onComplete?.();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  const handleFinish = () => {
    if (finished.current) return;
    finished.current = true;
    onComplete?.();
  };

  return (
    <View style={styles.container} pointerEvents="none">
      <LottieView
        source={require('../assets/lottie/watering.json')}
        autoPlay
        loop={false}
        onAnimationFinish={handleFinish}
        resizeMode="contain"
        style={styles.lottie}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  lottie: {
    width: 180,
    height: 160,
  },
});
