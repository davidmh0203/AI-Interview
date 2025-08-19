import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronRight, MoreHorizontal } from "lucide-react-native";

// Breadcrumb 컨테이너
export function Breadcrumb({ children }) {
  return (
    <View accessibilityRole="navigation" accessibilityLabel="breadcrumb">
      {children}
    </View>
  );
}

// 목록 (리스트 컨테이너)
export function BreadcrumbList({ children, style }) {
  return (
    <View
      style={[
        { flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// 개별 아이템
export function BreadcrumbItem({ children, style }) {
  return (
    <View style={[{ flexDirection: "row", alignItems: "center" }, style]}>
      {children}
    </View>
  );
}

// 링크 (클릭 가능)
export function BreadcrumbLink({ children, onPress, style }) {
  return (
    <TouchableOpacity onPress={onPress} accessibilityRole="link">
      <Text style={[{ color: "#2563EB" }, style]}>{children}</Text>
    </TouchableOpacity>
  );
}

// 현재 페이지
export function BreadcrumbPage({ children, style }) {
  return (
    <Text accessibilityRole="text" style={[{ color: "#111827" }, style]}>
      {children}
    </Text>
  );
}

// 구분자
export function BreadcrumbSeparator({ children }) {
  return (
    <View style={{ marginHorizontal: 4 }}>
      {children ?? <ChevronRight size={14} />}
    </View>
  );
}

// 줄임표 (...)
export function BreadcrumbEllipsis() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <MoreHorizontal size={16} />
      <Text style={{ display: "none" }}>More</Text>
    </View>
  );
}
