// Tabs.js — React Native port of Radix/Tailwind Tabs (JSX)
// - Controlled & uncontrolled: value / defaultValue / onValueChange
// - Components: Tabs, TabsList, TabsTrigger, TabsContent
// - Animated indicator under active trigger, horizontal scrollable list
// - No external deps beyond react / react-native
//
// Usage example at bottom (Example component).

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  UIManager,
  findNodeHandle,
} from "react-native";

// --------------------------------------
// Context
// --------------------------------------
const TabsCtx = createContext(null);

export function Tabs({
  value: controlledValue,
  defaultValue,
  onValueChange,
  children,
  style,
}) {
  const [internal, setInternal] = useState(
    controlledValue ?? defaultValue ?? null
  );
  const value = controlledValue ?? internal;

  const setValue = useCallback(
    (next) => {
      onValueChange?.(next);
      if (controlledValue === undefined) setInternal(next);
    },
    [onValueChange, controlledValue]
  );

  // record trigger rects for indicator
  const rectsRef = useRef(new Map()); // key: tab value -> {x, width}
  const setRectFor = useCallback((key, rect) => {
    rectsRef.current.set(key, rect);
  }, []);
  const getRectFor = useCallback(
    (key) => rectsRef.current.get(key) ?? null,
    []
  );

  const ctx = useMemo(
    () => ({ value, setValue, setRectFor, getRectFor }),
    [value, setValue, setRectFor, getRectFor]
  );

  return (
    <TabsCtx.Provider value={ctx}>
      <View style={[styles.root, style]}>{children}</View>
    </TabsCtx.Provider>
  );
}

function useTabs() {
  const ctx = useContext(TabsCtx);
  if (!ctx) throw new Error("Tabs.* must be used inside <Tabs>");
  return ctx;
}

// --------------------------------------
// TabsList — horizontal scroll container + animated indicator
// --------------------------------------
export function TabsList({ children, style, indicatorStyle, scrollProps }) {
  const { value, getRectFor } = useTabs();
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorW = useRef(new Animated.Value(0)).current;

  // animate to active trigger rect
  useEffect(() => {
    const r = value != null ? getRectFor(value) : null;
    if (!r) return;
    Animated.parallel([
      Animated.timing(indicatorX, {
        toValue: r.x,
        duration: 160,
        useNativeDriver: false,
      }),
      Animated.timing(indicatorW, {
        toValue: r.width,
        duration: 160,
        useNativeDriver: false,
      }),
    ]).start();
  }, [value, getRectFor, indicatorX, indicatorW]);

  return (
    <View style={[styles.listWrap, style]} accessibilityRole="tablist">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        {...scrollProps}
      >
        {children}
        {/* underline indicator */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            { left: indicatorX, width: indicatorW },
            indicatorStyle,
          ]}
        />
      </ScrollView>
    </View>
  );
}

// --------------------------------------
// TabsTrigger — a button that selects a tab
// --------------------------------------
export function TabsTrigger({
  value,
  children,
  style,
  textStyle,
  disabled = false,
}) {
  const { value: current, setValue, setRectFor } = useTabs();
  const ref = useRef(null);

  // measure for indicator
  const measure = useCallback(() => {
    const node = findNodeHandle(ref.current);
    if (!node || !UIManager.measureLayout) return;
    // measure relative to ScrollView inner content: use measureInWindow fallback + track x only
    UIManager.measureInWindow(node, (x, _y, width, _height) => {
      setRectFor(value, { x, width });
    });
  }, [setRectFor, value]);

  useEffect(() => {
    measure();
    const t = setTimeout(measure, 0);
    return () => clearTimeout(t);
  }, [measure]);

  const active = current === value;

  return (
    <Pressable
      ref={ref}
      accessibilityRole="tab"
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      onPress={() => !disabled && setValue(value)}
      style={({ pressed }) => [
        styles.trigger,
        active && styles.triggerActive,
        pressed && !disabled && styles.triggerPressed,
        style,
      ]}
    >
      {typeof children === "string" ? (
        <Text
          style={[
            styles.triggerText,
            active && styles.triggerTextActive,
            textStyle,
          ]}
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
// TabsContent — renders when its value matches current
// --------------------------------------
export function TabsContent({ value, children, style }) {
  const { value: current } = useTabs();
  const visible = current === value;
  return visible ? (
    <View accessibilityRole="group" style={[styles.content, style]}>
      {children}
    </View>
  ) : null;
}

// --------------------------------------
// Styles
// --------------------------------------
const styles = StyleSheet.create({
  root: { gap: 8 },
  listWrap: {
    borderRadius: 12,
    backgroundColor: "#f4f4f5",
    padding: 3,
    position: "relative",
    overflow: "hidden",
  },
  list: {
    flexDirection: "row",
    alignItems: "center",
  },
  trigger: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 6,
  },
  triggerActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  triggerPressed: {
    opacity: 0.9,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  triggerTextActive: {
    color: "#111827",
  },
  indicator: {
    position: "absolute",
    height: 2,
    bottom: 0,
    backgroundColor: "#111827",
    borderRadius: 2,
  },
  content: {
    paddingTop: 4,
  },
});

// --------------------------------------
// Example (remove in production)
// --------------------------------------
export function Example() {
  const [val, setVal] = useState("account");
  return (
    <Tabs value={val} onValueChange={setVal}>
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <Text>Account settings...</Text>
      </TabsContent>
      <TabsContent value="billing">
        <Text>Billing panel...</Text>
      </TabsContent>
      <TabsContent value="team">
        <Text>Team members...</Text>
      </TabsContent>
    </Tabs>
  );
}
