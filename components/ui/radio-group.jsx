// RadioGroup.js — React Native port of shadcn/radix Radio Group (JSX)
// - Controlled & uncontrolled (value / defaultValue / onValueChange)
// - Keyboard-like navigation helpers optional (left/right/up/down not native RN)
// - Disabled & aria-like accessibility states
// - No external deps; indicator drawn with Views
//
// Usage example is at the bottom (Example component).

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

// --------------------------------------
// Context
// --------------------------------------
const RGCtx = createContext(null);

export default function RadioGroup({
  value: controlledValue,
  defaultValue,
  onValueChange,
  disabled = false,
  direction = "column", // 'column' | 'row'
  gap = 12,
  children,
  style,
  ...rest
}) {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internal;

  const setValue = useCallback(
    (v) => {
      if (disabled) return;
      onValueChange?.(v);
      if (controlledValue === undefined) setInternal(v);
    },
    [controlledValue, disabled, onValueChange]
  );

  const ctx = useMemo(
    () => ({ value, setValue, disabled }),
    [value, setValue, disabled]
  );

  return (
    <RGCtx.Provider value={ctx}>
      <View
        accessibilityRole="radiogroup"
        style={[{ flexDirection: direction, gap }, style]}
        {...rest}
      >
        {children}
      </View>
    </RGCtx.Provider>
  );
}

function useRG() {
  const ctx = useContext(RGCtx);
  if (!ctx) throw new Error("RadioGroupItem must be used within <RadioGroup>");
  return ctx;
}

// --------------------------------------
// Item
// --------------------------------------
export function RadioGroupItem({
  value,
  label, // optional text label
  size = 16,
  disabled: itemDisabled = false,
  style,
  labelStyle,
  children, // you can also pass custom label node as children
  ...rest
}) {
  const { value: selected, setValue, disabled: groupDisabled } = useRG();
  const disabled = groupDisabled || itemDisabled;
  const isSelected = selected === value;

  const onPress = () => {
    if (!disabled) setValue(value);
  };

  const S = {
    outer: [
      styles.outer,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
      },
      disabled && styles.outerDisabled,
      isSelected && styles.outerActive,
    ],
    inner: [
      styles.inner,
      {
        width: Math.max(2, Math.round(size * 0.5)),
        height: Math.max(2, Math.round(size * 0.5)),
        borderRadius: Math.max(1, Math.round(size * 0.25)),
      },
      isSelected ? styles.innerOn : styles.innerOff,
    ],
  };

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected, disabled }}
      accessibilityLabel={typeof label === "string" ? label : undefined}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.itemRow,
        pressed && !disabled && styles.itemPressed,
        style,
      ]}
      {...rest}
    >
      <View style={S.outer}>
        <View style={S.inner} />
      </View>
      {children ? (
        children
      ) : label ? (
        <Text
          style={[styles.label, disabled && styles.labelDisabled, labelStyle]}
        >
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

// --------------------------------------
// Styles
// --------------------------------------
const styles = StyleSheet.create({
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemPressed: {
    opacity: 0.85,
  },
  outer: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#cfcfcf",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  outerActive: {
    borderColor: "#6b7280", // muted gray
  },
  outerDisabled: {
    opacity: 0.5,
  },
  inner: {
    backgroundColor: "#111",
  },
  innerOn: {
    opacity: 1,
  },
  innerOff: {
    opacity: 0,
  },
  label: {
    fontSize: 14,
    color: "#111",
  },
  labelDisabled: {
    color: "#888",
  },
});

// --------------------------------------
// Example usage (remove in production)
// --------------------------------------
export function Example() {
  const [val, setVal] = useState("b");
  return (
    <RadioGroup value={val} onValueChange={setVal}>
      <RadioGroupItem value="a" label="Option A" />
      <RadioGroupItem value="b" label="Option B" />
      <RadioGroupItem value="c" label="Option C" disabled />
    </RadioGroup>
  );
}
