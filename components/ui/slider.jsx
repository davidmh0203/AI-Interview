// Slider.js — React Native port of shadcn/Radix Slider (JSX)
// - Supports single-value or range (two thumbs) like [min, max]
// - Props: value, defaultValue, onValueChange, min, max, step, orientation, disabled
// - No external deps. Uses PanResponder + onLayout to map touch -> value.
// - Track + Range + Thumb(s) rendered. Horizontal by default; vertical supported.
//
// Usage examples at bottom.

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  Pressable,
  Text,
  I18nManager,
} from "react-native";

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

function roundToStep(v, step) {
  if (!step || step <= 0) return v;
  const r = Math.round(v / step) * step;
  const fixed = Number(r.toFixed(6));
  return fixed;
}

export function Slider({
  value: controlledValue,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  orientation = "horizontal", // 'horizontal' | 'vertical'
  disabled = false,
  trackThickness = 6,
  thumbSize = 16,
  style,
  trackStyle,
  rangeStyle,
  thumbStyle,
  ...rest
}) {
  // normalize initial values
  const initial = useMemo(() => {
    if (Array.isArray(controlledValue)) return controlledValue;
    if (Array.isArray(defaultValue)) return defaultValue;
    if (controlledValue != null) return [Number(controlledValue)];
    if (defaultValue != null) return [Number(defaultValue)];
    return [min];
  }, [controlledValue, defaultValue, min]);

  const isRange = initial.length === 2;
  const [internal, setInternal] = useState(initial);
  const values =
    controlledValue != null
      ? Array.isArray(controlledValue)
        ? controlledValue
        : [controlledValue]
      : internal;

  useEffect(() => {
    // keep internal in sync if default changes length
    if (controlledValue == null && defaultValue != null) {
      setInternal(Array.isArray(defaultValue) ? defaultValue : [defaultValue]);
    }
  }, [defaultValue, controlledValue]);

  const isVertical = orientation === "vertical";
  const trackRef = useRef(null);
  const trackLenRef = useRef(0); // px

  const setValueIndex = useCallback(
    (index, nextVal) => {
      if (disabled) return;
      const clamped = clamp(roundToStep(nextVal, step), min, max);
      let next = values.slice();
      next[index] = clamped;

      // if range, enforce order
      if (isRange) {
        const a = Math.min(next[0], next[1]);
        const b = Math.max(next[0], next[1]);
        next =
          index === 0 ? [Math.min(clamped, b), b] : [a, Math.max(a, clamped)];
      }

      if (controlledValue == null) setInternal(next);
      onValueChange?.(isRange ? next : next[0]);
    },
    [disabled, values, isRange, min, max, step, controlledValue, onValueChange]
  );

  const pctFrom = (val) => (max === min ? 0 : (val - min) / (max - min));

  // layout: measure track length
  const onLayoutTrack = (e) => {
    const { width, height } = e.nativeEvent.layout;
    trackLenRef.current = isVertical ? height : width;
  };

  const getValueFromGesture = (gestureX, gestureY) => {
    const len = Math.max(1, trackLenRef.current);
    const pos = isVertical ? gestureY : gestureX;
    const rtl = !isVertical && I18nManager.isRTL;
    let ratio = clamp(pos / len, 0, 1);
    if (isVertical) ratio = 1 - ratio; // top=1 -> bottom=0 for vertical like web Radix
    if (rtl) ratio = 1 - ratio; // RTL flips
    const raw = min + ratio * (max - min);
    return clamp(roundToStep(raw, step), min, max);
  };

  // Create a PanResponder for each thumb
  const responders = values.map((_, idx) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: (evt, g) => {
        // update immediately to tap position
        const next = getValueFromGesture(g.x0, g.y0);
        setValueIndex(idx, next);
      },
      onPanResponderMove: (evt, g) => {
        const next = getValueFromGesture(g.moveX, g.moveY);
        setValueIndex(idx, next);
      },
    })
  );

  // Tap on track to move closest thumb
  const onPressTrack = (evt) => {
    if (disabled || !trackRef.current) return;
    const { locationX, locationY } = evt.nativeEvent;
    const targetVal = getValueFromGesture(locationX, locationY);
    if (isRange) {
      const d0 = Math.abs(targetVal - values[0]);
      const d1 = Math.abs(targetVal - values[1]);
      setValueIndex(d0 <= d1 ? 0 : 1, targetVal);
    } else {
      setValueIndex(0, targetVal);
    }
  };

  // Derived positions in px
  const positions = values.map((v) =>
    Math.round(pctFrom(v) * Math.max(0, trackLenRef.current - thumbSize))
  );

  // Range start/end
  const minPx = isRange ? Math.min(...positions) : 0;
  const maxPx = isRange ? Math.max(...positions) : positions[0];

  return (
    <View
      style={[styles.root, isVertical ? styles.col : styles.row, style]}
      {...rest}
    >
      <Pressable
        ref={trackRef}
        onLayout={onLayoutTrack}
        disabled={disabled}
        onPress={onPressTrack}
        style={[
          styles.track,
          isVertical
            ? { width: trackThickness }
            : { height: trackThickness, alignSelf: "stretch" },
          trackStyle,
        ]}
      >
        {/* Range fill */}
        <View
          style={[
            styles.range,
            isVertical
              ? {
                  left: 0,
                  right: 0,
                  bottom: minPx + thumbSize / 2,
                  top: undefined,
                  height: maxPx - minPx + thumbSize,
                }
              : {
                  top: 0,
                  bottom: 0,
                  left: minPx + thumbSize / 2,
                  width: maxPx - minPx + thumbSize,
                },
            rangeStyle,
          ]}
        />

        {/* Thumbs */}
        {values.map((_, idx) => (
          <View
            key={idx}
            {...responders[idx].panHandlers}
            style={[
              styles.thumb,
              {
                width: thumbSize,
                height: thumbSize,
                borderRadius: thumbSize / 2,
              },
              isVertical
                ? {
                    bottom: positions[idx],
                    transform: [{ translateY: -thumbSize / 2 }],
                    left: "50%",
                    marginLeft: -thumbSize / 2,
                  }
                : {
                    left: positions[idx],
                    transform: [{ translateX: -thumbSize / 2 }],
                    top: "50%",
                    marginTop: -thumbSize / 2,
                  },
              disabled && { opacity: 0.5 },
              thumbStyle,
            ]}
          />
        ))}
      </Pressable>
    </View>
  );
}

// --------------------------------------
// Styles
// --------------------------------------
const styles = StyleSheet.create({
  root: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
  },
  col: {
    flexDirection: "column",
  },
  track: {
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    position: "relative",
    justifyContent: "center",
  },
  range: {
    position: "absolute",
    backgroundColor: "#111827", // gray-900ish (acts as primary)
    borderRadius: 999,
  },
  thumb: {
    position: "absolute",
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#cfcfcf",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
});

// --------------------------------------
// Examples (remove in production)
// --------------------------------------
export function ExampleSingle() {
  const [v, setV] = useState(30);
  return (
    <View style={{ padding: 16 }}>
      <Text>Value: {v}</Text>
      <Slider value={v} onValueChange={setV} min={0} max={100} />
    </View>
  );
}

export function ExampleRange() {
  const [v, setV] = useState([20, 80]);
  return (
    <View style={{ padding: 16 }}>
      <Text>
        Range: {v[0]} - {v[1]}
      </Text>
      <Slider value={v} onValueChange={setV} min={0} max={100} />
    </View>
  );
}
