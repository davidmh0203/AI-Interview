// Switch.js — React Native port of Radix/shadcn Switch (JSX)
// - Controlled & uncontrolled: value / defaultValue / onValueChange
// - Accessible: role=switch, accessibilityState={{ checked, disabled }}
// - Animated thumb translate + track color
// - Props: value, defaultValue, onValueChange, disabled, size, trackOnColor, trackOffColor
// - No external deps besides react / react-native
//
// Usage example at bottom.

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, Pressable, StyleSheet, Animated } from "react-native";

export function Switch({
  value: controlled,
  defaultValue = false,
  onValueChange,
  disabled = false,
  size = 18, // thumb diameter; track width auto from this
  trackOnColor = "#111827", // gray-900-ish (acts as primary)
  trackOffColor = "#e5e7eb",
  thumbOnColor = "#fff",
  thumbOffColor = "#fff",
  style,
  trackStyle,
  thumbStyle,
  ...rest
}) {
  const [internal, setInternal] = useState(!!defaultValue);
  const checked = controlled != null ? !!controlled : internal;

  const setChecked = useCallback(
    (next) => {
      if (disabled) return;
      if (controlled == null) setInternal(next);
      onValueChange?.(next);
    },
    [controlled, disabled, onValueChange]
  );

  const trackHeight = Math.round(size * 1.15);
  const trackWidth = Math.round(size * 2.0 + 4);
  const radius = Math.round(trackHeight / 2);

  // animation
  const anim = useRef(new Animated.Value(checked ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: checked ? 1 : 0,
      duration: 160,
      useNativeDriver: false,
    }).start();
  }, [checked, anim]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, trackWidth - trackHeight], // thumb travels track width minus its diameter
  });

  const bgColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [trackOffColor, trackOnColor],
  });

  const onToggle = () => setChecked(!checked);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={onToggle}
      style={({ pressed }) => [
        styles.root,
        { opacity: disabled ? 0.5 : 1 },
        pressed && !disabled && styles.pressed,
        style,
      ]}
      {...rest}
    >
      <Animated.View
        style={[
          styles.track,
          {
            width: trackWidth,
            height: trackHeight,
            borderRadius: radius,
            backgroundColor: bgColor,
          },
          trackStyle,
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: trackHeight - 4,
              height: trackHeight - 4,
              borderRadius: (trackHeight - 4) / 2,
              transform: [{ translateX }],
              backgroundColor: checked ? thumbOnColor : thumbOffColor,
            },
            thumbStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: "flex-start",
  },
  pressed: {
    opacity: 0.9,
  },
  track: {
    justifyContent: "center",
    padding: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "transparent",
  },
  thumb: {
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
});

// --------------------------------------
// Example (remove in production)
// --------------------------------------
export function Example() {
  const [on, setOn] = useState(false);
  return (
    <View style={{ gap: 12 }}>
      <Switch value={on} onValueChange={setOn} />
      <Switch defaultValue size={22} trackOnColor="#0ea5e9" />
      <Switch
        value={!on}
        onValueChange={(v) => setOn(!v)}
        size={20}
        trackOnColor="#22c55e"
      />
    </View>
  );
}
