// Separator.js — React Native port of Radix/ shadcn Separator (JSX)
// - Orientation: 'horizontal' | 'vertical'
// - Decorative mode (exclude from accessibility tree)
// - Thickness/color/custom style props
// - No external deps
//
// Usage:
// <Separator />
// <Separator orientation="vertical" style={{ height: 24 }} />
// <Separator color="#e5e7eb" thickness={StyleSheet.hairlineWidth} />

import React from "react";
import { View, StyleSheet } from "react-native";

export function Separator({
  orientation = "horizontal",
  decorative = true,
  thickness = StyleSheet.hairlineWidth,
  color = "#e5e7eb", // tailwind gray-200-ish
  length = "100%", // for vertical: height; for horizontal: width
  inset = 0, // leading inset in dp (horizontal: left padding; vertical: top padding)
  style,
  ...rest
}) {
  const isHorizontal = orientation === "horizontal";

  const base = [
    styles.base,
    isHorizontal
      ? { height: thickness, width: length, marginLeft: inset }
      : { width: thickness, height: length, marginTop: inset },
    { backgroundColor: color },
    style,
  ];

  return (
    <View
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? "no-hide-descendants" : "auto"}
      style={base}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "stretch",
    borderRadius: 999,
  },
});

// --------------------------------------
// Example (remove in production)
// --------------------------------------
export function Example() {
  return (
    <View style={{ gap: 12 }}>
      <View
        style={{
          height: 40,
          backgroundColor: "#fff",
          borderRadius: 8,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: "#e5e7eb",
        }}
      />
      <Separator />
      <View
        style={{
          height: 40,
          backgroundColor: "#fff",
          borderRadius: 8,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: "#e5e7eb",
        }}
      />
      <Separator orientation="vertical" length={40} />
    </View>
  );
}
