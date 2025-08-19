// Skeleton.js — React Native port of shadcn/ui Skeleton (JSX)
// - Animated pulse shimmer using Animated.loop
// - Accepts style overrides for width/height/borderRadius
// - Zero dependencies besides react / react-native
//
// Usage:
// <Skeleton style={{ width: 120, height: 16, borderRadius: 6 }} />
// <SkeletonCircle size={40} />

import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

export function Skeleton({ style }) {
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return <Animated.View style={[styles.base, { opacity }, style]} />;
}

export function SkeletonCircle({ size = 24, style }) {
  return (
    <Skeleton
      style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
    />
  );
}

export function SkeletonLine({ width = 120, height = 14, style }) {
  return <Skeleton style={[{ width, height, borderRadius: 6 }, style]} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#e5e7eb", // gray-200-ish
    borderRadius: 8,
  },
});

// Example (remove in production)
export function Example() {
  return (
    <View style={{ gap: 8 }}>
      <SkeletonLine width={180} />
      <SkeletonLine width={140} />
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
        <SkeletonCircle size={36} />
        <SkeletonLine width={120} />
      </View>
    </View>
  );
}
