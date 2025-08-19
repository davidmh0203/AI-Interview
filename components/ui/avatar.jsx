import React from "react";
import { View, Image, Text } from "react-native";

export function Avatar({ size = 40, style, children }) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
          backgroundColor: "#E5E7EB", // bg-muted 대체
          justifyContent: "center",
          alignItems: "center",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function AvatarImage({ source, style }) {
  return (
    <Image
      source={source}
      style={[
        {
          width: "100%",
          height: "100%",
          resizeMode: "cover",
        },
        style,
      ]}
    />
  );
}

export function AvatarFallback({ children, style }) {
  return (
    <View
      style={[
        {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
        style,
      ]}
    >
      <Text style={{ fontSize: 16, color: "#6B7280" /* text-muted */ }}>
        {children}
      </Text>
    </View>
  );
}
