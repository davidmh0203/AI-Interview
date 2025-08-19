// Pagination.js — React Native port of shadcn/ui Pagination (JSX)
// No external deps. Icons drawn via simple shapes/text.
// API parity (rough):
//   Pagination, PaginationContent, PaginationItem, PaginationLink,
//   PaginationPrevious, PaginationNext, PaginationEllipsis
//
// Usage example at bottom (Example component).

import React, { memo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

// --------------------------------------
// Root
// --------------------------------------
export function Pagination({ children, style, ...rest }) {
  return (
    <View
      accessibilityLabel="pagination"
      style={[styles.root, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

// --------------------------------------
// Content container
// --------------------------------------
export function PaginationContent({ children, style, ...rest }) {
  return (
    <View style={[styles.content, style]} {...rest}>
      {children}
    </View>
  );
}

// --------------------------------------
// Item wrapper
// --------------------------------------
export function PaginationItem({ children, style, ...rest }) {
  return (
    <View style={[styles.item, style]} {...rest}>
      {children}
    </View>
  );
}

// --------------------------------------
// Link (page button)
// --------------------------------------
export function PaginationLink({
  children,
  isActive = false,
  disabled = false,
  size = "icon", // 'icon' | 'default'
  onPress,
  style,
  textStyle,
  ...rest
}) {
  const base = [
    styles.btn,
    size === "default" ? styles.btnDefault : styles.btnIcon,
  ];
  if (isActive) base.push(styles.btnActive);
  if (disabled) base.push(styles.btnDisabled);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: isActive }}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        ...base,
        pressed && !disabled && styles.btnPressed,
        style,
      ]}
      {...rest}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text
          style={[styles.btnText, isActive && styles.btnTextActive, textStyle]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

// --------------------------------------
// Previous / Next
// --------------------------------------
const ChevronLeft = memo(() => <View style={styles.chevLeft} />);
const ChevronRight = memo(() => <View style={styles.chevRight} />);

export function PaginationPrevious({ children, style, ...rest }) {
  return (
    <PaginationLink size="default" style={[styles.prevNext, style]} {...rest}>
      <ChevronLeft />
      <Text style={styles.prevNextText}>{children ?? "Previous"}</Text>
    </PaginationLink>
  );
}

export function PaginationNext({ children, style, ...rest }) {
  return (
    <PaginationLink size="default" style={[styles.prevNext, style]} {...rest}>
      <Text style={styles.prevNextText}>{children ?? "Next"}</Text>
      <ChevronRight />
    </PaginationLink>
  );
}

// --------------------------------------
// Ellipsis (…)
// --------------------------------------
export function PaginationEllipsis({ style, ...rest }) {
  return (
    <View
      accessibilityElementsHidden
      style={[styles.ellipsis, style]}
      {...rest}
    >
      <Text style={styles.ellipsisText}>…</Text>
    </View>
  );
}

// --------------------------------------
// Styles
// --------------------------------------
const styles = StyleSheet.create({
  root: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  item: {
    borderRadius: 8,
  },
  btn: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#d9d9d9",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  btnIcon: {
    width: 36,
    height: 36,
  },
  btnDefault: {
    paddingHorizontal: 12,
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  btnActive: {
    backgroundColor: "#f5f5f5",
    borderColor: "#cfcfcf",
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnPressed: {
    backgroundColor: "#f0f0f0",
  },
  btnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  btnTextActive: {
    color: "#111",
  },
  prevNext: {
    paddingHorizontal: 10,
  },
  prevNextText: {
    fontSize: 14,
  },
  ellipsis: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  ellipsisText: {
    fontSize: 16,
    color: "#666",
  },
  // CSS chevrons using borders
  chevLeft: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#444",
    transform: [{ rotate: "45deg" }],
    marginRight: 2,
  },
  chevRight: {
    width: 10,
    height: 10,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#444",
    transform: [{ rotate: "-45deg" }],
    marginLeft: 2,
  },
});

// --------------------------------------
// Example usage (remove in production)
// --------------------------------------
export function Example() {
  const [page, setPage] = React.useState(5);
  const total = 20;

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(total, p + 1));

  const PageBtn = (n) => (
    <PaginationItem key={n}>
      <PaginationLink isActive={page === n} onPress={() => setPage(n)}>
        {n}
      </PaginationLink>
    </PaginationItem>
  );

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious disabled={page === 1} onPress={goPrev} />
        </PaginationItem>

        {page > 2 && PageBtn(1)}
        {page > 3 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {page - 1 >= 1 && PageBtn(page - 1)}
        {PageBtn(page)}
        {page + 1 <= total && PageBtn(page + 1)}

        {page < total - 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {page < total - 1 && PageBtn(total)}

        <PaginationItem>
          <PaginationNext disabled={page === total} onPress={goNext} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
