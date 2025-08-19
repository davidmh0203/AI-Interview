// Sidebar.js — React Native port of shadcn/ui Sidebar (JSX)
// - Supports provider/context for open/close state
// - Mobile: shows as a sliding Sheet
// - Desktop: collapsible sidebar (expanded/collapsed)
// - Includes: SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, SidebarMenu, etc.
//
// Note: Many web-only features (cookies, keyboard shortcuts, tooltip provider) are simplified.

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
  Modal,
} from "react-native";

const SidebarCtx = createContext(null);

export function useSidebar() {
  const ctx = useContext(SidebarCtx);
  if (!ctx) throw new Error("useSidebar must be used within <SidebarProvider>");
  return ctx;
}

export function SidebarProvider({ defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const toggleSidebar = useCallback(() => setOpen((v) => !v), []);
  const value = useMemo(() => ({ open, setOpen, toggleSidebar }), [open]);
  return <SidebarCtx.Provider value={value}>{children}</SidebarCtx.Provider>;
}

export function Sidebar({ side = "left", width = 240, children, style }) {
  const { open } = useSidebar();
  const { width: SW, height: SH } = Dimensions.get("window");
  const translate = useMemo(() => new Animated.Value(open ? 0 : -width), []);

  React.useEffect(() => {
    Animated.timing(translate, {
      toValue: open ? 0 : side === "left" ? -width : width,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [open, side, width, translate]);

  return (
    <Animated.View
      style={[
        styles.sidebar,
        { width, transform: [{ translateX: translate }] },
        side === "right" && { right: 0, left: undefined },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function SidebarTrigger({ children, style }) {
  const { toggleSidebar } = useSidebar();
  return (
    <Pressable style={style} onPress={toggleSidebar}>
      {children ?? <Text>☰</Text>}
    </Pressable>
  );
}

export function SidebarContent({ children, style }) {
  return <View style={[styles.content, style]}>{children}</View>;
}

export function SidebarHeader({ children, style }) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export function SidebarFooter({ children, style }) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

export function SidebarGroup({ children, style }) {
  return <View style={[styles.group, style]}>{children}</View>;
}

export function SidebarGroupLabel({ children, style }) {
  return <Text style={[styles.groupLabel, style]}>{children}</Text>;
}

export function SidebarMenu({ children, style }) {
  return <View style={[styles.menu, style]}>{children}</View>;
}

export function SidebarMenuItem({ children, style }) {
  return <View style={[styles.menuItem, style]}>{children}</View>;
}

export function SidebarMenuButton({ children, onPress, style }) {
  return (
    <Pressable style={[styles.menuButton, style]} onPress={onPress}>
      <Text>{children}</Text>
    </Pressable>
  );
}

// --------------------------------------
// Styles
// --------------------------------------
const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#fff",
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    zIndex: 50,
    paddingVertical: 8,
  },
  content: { flex: 1 },
  header: {
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
  },
  footer: {
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
  },
  group: { paddingVertical: 8 },
  groupLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  menu: { paddingVertical: 4 },
  menuItem: {},
  menuButton: { paddingVertical: 8, paddingHorizontal: 12 },
});

// Example usage
export function Example() {
  return (
    <SidebarProvider>
      <SidebarTrigger />
      <Sidebar>
        <SidebarHeader>
          <Text>Header</Text>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Item 1</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>Item 2</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Text>Footer</Text>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
