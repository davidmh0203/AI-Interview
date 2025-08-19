// Table.js — React Native port of shadcn Table (JSX)
// - Composable primitives that mimic <table>, <thead>, <tbody>, etc.
// - Horizontal overflow supported via outer ScrollView (like overflow-x-auto)
// - Lightweight: Views/Text only; no external deps
//
// Usage:
// <Table>
//   <TableHeader>
//     <TableRow>
//       <TableHead>#</TableHead>
//       <TableHead>Name</TableHead>
//       <TableHead align="right">Score</TableHead>
//     </TableRow>
//   </TableHeader>
//   <TableBody>
//     <TableRow>
//       <TableCell>1</TableCell>
//       <TableCell>Jane</TableCell>
//       <TableCell align="right">98</TableCell>
//     </TableRow>
//   </TableBody>
//   <TableCaption>Simple data table</TableCaption>
// </Table>

import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

// --------------------------------------
// Table (container + horizontal scrolling)
// --------------------------------------
export function Table({ children, containerStyle, style }) {
  return (
    <View style={[styles.tableContainer, containerStyle]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.table, style]}>{children}</View>
      </ScrollView>
    </View>
  );
}

// --------------------------------------
// Header / Body / Footer wrappers
// --------------------------------------
export function TableHeader({ children, style }) {
  return (
    <View accessibilityRole="header" style={[styles.thead, style]}>
      {children}
    </View>
  );
}

export function TableBody({ children, style }) {
  return <View style={[styles.tbody, style]}>{children}</View>;
}

export function TableFooter({ children, style }) {
  return <View style={[styles.tfoot, style]}>{children}</View>;
}

// --------------------------------------
// Row
// --------------------------------------
export function TableRow({ children, selected = false, style }) {
  return (
    <View style={[styles.tr, selected && styles.trSelected, style]}>
      {children}
    </View>
  );
}

// --------------------------------------
// Cells
// --------------------------------------
function maybeWrapText(children, textStyle) {
  if (typeof children === "string" || typeof children === "number") {
    return <Text style={textStyle}>{children}</Text>;
  }
  return children;
}

export function TableHead({ children, align = "left", style, textStyle }) {
  return (
    <View style={[styles.th, alignStyle(align), style]}>
      {maybeWrapText(children, [styles.thText, textStyle])}
    </View>
  );
}

export function TableCell({ children, align = "left", style, textStyle }) {
  return (
    <View style={[styles.td, alignStyle(align), style]}>
      {maybeWrapText(children, [styles.tdText, textStyle])}
    </View>
  );
}

// --------------------------------------
// Caption
// --------------------------------------
export function TableCaption({ children, style, textStyle }) {
  return (
    <View style={[styles.captionWrap, style]}>
      {maybeWrapText(children, [styles.caption, textStyle])}
    </View>
  );
}

// --------------------------------------
// Helpers & styles
// --------------------------------------
function alignStyle(align) {
  switch (align) {
    case "center":
      return { justifyContent: "center", alignItems: "center" };
    case "right":
      return { justifyContent: "flex-end", alignItems: "flex-end" };
    default:
      return { justifyContent: "flex-start", alignItems: "flex-start" };
  }
}

const styles = StyleSheet.create({
  tableContainer: {
    width: "100%",
  },
  table: {
    width: "100%",
  },
  thead: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
  },
  tbody: {},
  tfoot: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
    backgroundColor: "#f7f7f7",
  },
  tr: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
  },
  trSelected: {
    backgroundColor: "#f3f4f6",
  },
  th: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    minWidth: 80,
  },
  thText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  td: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    minWidth: 80,
  },
  tdText: {
    fontSize: 13,
    color: "#111827",
  },
  captionWrap: {
    marginTop: 8,
  },
  caption: {
    fontSize: 12,
    color: "#6b7280",
  },
});

// --------------------------------------
// Example (remove in production)
// --------------------------------------
export function Example() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Name</TableHead>
          <TableHead align="right">Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[
          { id: 1, name: "Jane", score: 98 },
          { id: 2, name: "John", score: 91 },
          { id: 3, name: "Alex", score: 87 },
        ].map((r) => (
          <TableRow key={r.id}>
            <TableCell>{r.id}</TableCell>
            <TableCell>{r.name}</TableCell>
            <TableCell align="right">{r.score}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableCaption>Sample data only</TableCaption>
    </Table>
  );
}
