import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function Toggle({
  pressed: controlled,
  defaultPressed = false,
  onPressedChange,
  disabled = false,
  variant = "default", // 'default' | 'outline'
  size = "default", // 'sm' | 'default' | 'lg'
  style,
  textStyle,
  children,
  ...rest
}) {
  const [internal, setInternal] = useState(!!defaultPressed);
  const isOn = controlled != null ? !!controlled : internal;

  const setPressed = useCallback(
    (next) => {
      if (disabled) return;
      if (controlled == null) setInternal(next);
      onPressedChange?.(next);
    },
    [controlled, disabled, onPressedChange]
  );

  const onPress = () => setPressed(!isOn);

  const S = useMemo(() => sizeStyles(size), [size]);
  const V = useMemo(() => variantStyles(variant, isOn), [variant, isOn]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isOn, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        S.base,
        V.base,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      {...rest}
    >
      {typeof children === "string" ? (
        <Text style={[styles.text, S.text, V.text, textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

// --------------------------------------
// Styles (cva-like helpers)
// --------------------------------------
function sizeStyles(size) {
  switch (size) {
    case "sm":
      return {
        base: { minWidth: 32, height: 32, paddingHorizontal: 6 },
        text: { fontSize: 12 },
      };
    case "lg":
      return {
        base: { minWidth: 40, height: 40, paddingHorizontal: 10 },
        text: { fontSize: 16 },
      };
    default:
      return {
        base: { minWidth: 36, height: 36, paddingHorizontal: 8 },
        text: { fontSize: 14 },
      };
  }
}

function variantStyles(variant, on) {
  if (variant === "outline") {
    return {
      base: {
        backgroundColor: "transparent",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: on ? "#111827" : "#d4d4d4",
      },
      text: { color: "#111827", fontWeight: on ? "700" : "600" },
    };
  }
  // default
  return {
    base: {
      backgroundColor: on ? "#111827" : "transparent",
      borderWidth: 0,
    },
    text: { color: on ? "#ffffff" : "#111827", fontWeight: "600" },
  };
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 8,
    paddingVertical: 6,
  },
  text: {
    includeFontPadding: false,
  },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.5 },
});

// --------------------------------------
// Example (remove in production)
// --------------------------------------
export function Example() {
  const [bold, setBold] = useState(false);
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      <Toggle pressed={bold} onPressedChange={setBold}>
        Bold
      </Toggle>
      <Toggle defaultPressed variant="outline">
        Italic
      </Toggle>
      <Toggle size="lg">Underline</Toggle>
    </View>
  );
}
