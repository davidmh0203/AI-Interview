import React from "react";
import { View } from "react-native";

export function AspectRatio({ ratio = 1, style, children, ...props }) {
  return (
    <View style={[{ aspectRatio: ratio, width: "100%" }, style]} {...props}>
      {children}
    </View>
  );
}
