import React from "react";
import { View, Text } from "react-native";
import { cn } from "./utils.js"; // Tailwind 스타일 머지 함수

// variant에 따른 스타일 정의
const alertVariants = {
  default: "bg-card text-card-foreground",
  destructive:
    "text-destructive bg-card *:data-[slot=alert-description]:text-destructive/90",
};

export function Alert({ className, variant = "default", children, ...props }) {
  return (
    <View
      accessibilityRole="alert"
      className={cn(
        "relative w-full rounded-lg border px-4 py-3 text-sm",
        alertVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}

export function AlertTitle({ className, children, ...props }) {
  return (
    <Text
      className={cn(
        "line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </Text>
  );
}

export function AlertDescription({ className, children, ...props }) {
  return (
    <Text
      className={cn("text-muted-foreground text-sm leading-relaxed", className)}
      {...props}
    >
      {children}
    </Text>
  );
}
