// ToggleGroup.js — React Native port of Radix/shadcn Toggle Group (JSX)
// - Controlled & uncontrolled
// - type: 'single' | 'multiple'
// - Components: ToggleGroup, ToggleGroupItem
// - Optional visual variants (default | outline) & sizes (sm | default | lg)
// - No external deps beyond react / react-native
//
// Usage examples at bottom.

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
const TGCtx = createContext(null);

export function ToggleGroup({
  type = "single", // 'single' | 'multiple'
  value: controlledValue, // string | string[] | null
  defaultValue, // string | string[] | null
  onValueChange, // (next) => void
  disabled = false,
  size = "default", // 'sm' | 'default' | 'lg'
  variant = "default", // 'default' | 'outline'
  direction = "row", // 'row' | 'column'
  gap = 0,
  children,
  style,
  ...rest
}) {
  const isMultiple = type === "multiple";

  // Normalize defaults
  const init = useMemo(() => {
    if (controlledValue !== undefined) return controlledValue;
    if (defaultValue !== undefined) return defaultValue;
    return isMultiple ? [] : null;
  }, [controlledValue, defaultValue, isMultiple]);

  const [internal, setInternal] = useState(init);
  const current = controlledValue !== undefined ? controlledValue : internal;

  const setCurrent = useCallback(
    (next) => {
      if (disabled) return;
      if (controlledValue === undefined) setInternal(next);
      onValueChange?.(next);
    },
    [controlledValue, disabled, onValueChange]
  );

  const ctx = useMemo(
    () => ({ type, current, setCurrent, disabled, size, variant, direction }),
    [type, current, setCurrent, disabled, size, variant, direction]
  );

  return (
    <TGCtx.Provider value={ctx}>
      <View
        style={[styles.group, { flexDirection: direction, gap }, style]}
        {...rest}
      >
        {children}
      </View>
    </TGCtx.Provider>
  );
}

function useTG() {
  const ctx = useContext(TGCtx);
  if (!ctx)
    throw new Error("ToggleGroupItem must be used within <ToggleGroup>");
  return ctx;
}

// --------------------------------------
// Item
// --------------------------------------
export function ToggleGroupItem({
  value, // string
  children,
  disabled: itemDisabled = false,
  style,
  textStyle,
  size: itemSize,
  variant: itemVariant,
  ...rest
}) {
  const {
    type,
    current,
    setCurrent,
    disabled: groupDisabled,
    size: groupSize,
    variant: groupVariant,
    direction,
  } = useTG();
  const disabled = groupDisabled || itemDisabled;
  const size = itemSize || groupSize || "default";
  const variant = itemVariant || groupVariant || "default";

  const isSelected = useMemo(() => {
    if (type === "multiple")
      return Array.isArray(current) && current.includes(value);
    return current === value;
  }, [type, current, value]);

  const onPress = () => {
    if (disabled) return;
    if (type === "multiple") {
      const set = new Set(Array.isArray(current) ? current : []);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      setCurrent(Array.from(set));
    } else {
      setCurrent(current === value ? null : value);
    }
  };

  const S = useMemo(() => sizeStyles(size), [size]);
  const V = useMemo(
    () => variantStyles(variant, isSelected),
    [variant, isSelected]
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected, disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.item,
        S.item,
        V.item,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        // Rounded group look when gap=0
        direction === "row" && { borderRadius: 0 },
        style,
      ]}
      {...rest}
    >
      {typeof children === "string" ? (
        <Text style={[styles.itemText, S.text, V.text, textStyle]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

// --------------------------------------
// Style helpers
// --------------------------------------
function sizeStyles(size) {
  switch (size) {
    case "sm":
      return {
        item: { paddingHorizontal: 8, paddingVertical: 6 },
        text: { fontSize: 12 },
      };
    case "lg":
      return {
        item: { paddingHorizontal: 14, paddingVertical: 10 },
        text: { fontSize: 16 },
      };
    default:
      return {
        item: { paddingHorizontal: 10, paddingVertical: 8 },
        text: { fontSize: 14 },
      };
  }
}

function variantStyles(variant, selected) {
  if (variant === "outline") {
    return {
      item: {
        backgroundColor: selected ? "#fff" : "#fff",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: selected ? "#111827" : "#d4d4d4",
      },
      text: {
        color: "#111827",
        fontWeight: selected ? "700" : "600",
      },
    };
  }
  // default
  return {
    item: {
      backgroundColor: selected ? "#111827" : "#f4f4f5",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: selected ? "#111827" : "#e5e7eb",
    },
    text: {
      color: selected ? "#fff" : "#111827",
      fontWeight: "600",
    },
  };
}

// --------------------------------------
// Base styles
// --------------------------------------
const styles = StyleSheet.create({
  group: {
    alignSelf: "flex-start",
    borderRadius: 10,
    overflow: "hidden", // for gap=0 segmented look
  },
  item: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
  },
  itemText: {
    includeFontPadding: false,
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.9 },
});

// --------------------------------------
// Examples (remove in production)
// --------------------------------------
export function ExampleSingle() {
  const [val, setVal] = useState("left");
  return (
    <ToggleGroup type="single" value={val} onValueChange={setVal}>
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="center">Center</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>
  );
}

export function ExampleMultiple() {
  const [vals, setVals] = useState(["bold"]);
  return (
    <ToggleGroup
      type="multiple"
      value={vals}
      onValueChange={setVals}
      variant="outline"
    >
      <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
    </ToggleGroup>
  );
}
