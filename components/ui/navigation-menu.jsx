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
  Modal,
  StyleSheet,
  UIManager,
  findNodeHandle,
  Animated,
  Dimensions,
  Easing,
} from "react-native";

// --------------------------------------
// Context
// --------------------------------------
const NavMenuCtx = createContext(null);

export function NavigationMenu({
  children,
  className, // ignored; for API similarity
  viewport = true, // kept for API, not used directly
  openItem: controlledOpenId,
  defaultOpenItem = null,
  onOpenChange, // (id | null) => void
  backdropOpacity = 0,
}) {
  const [internalOpenId, setInternalOpenId] = useState(defaultOpenItem);
  const openItem =
    controlledOpenId !== undefined ? controlledOpenId : internalOpenId;

  const setOpenItem = useCallback(
    (idOrNull) => {
      onOpenChange?.(idOrNull);
      if (controlledOpenId === undefined) setInternalOpenId(idOrNull);
    },
    [onOpenChange, controlledOpenId]
  );

  // track trigger rects by itemId
  const rectMapRef = useRef(new Map());
  const setRectFor = useCallback((id, rect) => {
    rectMapRef.current.set(id, rect);
  }, []);

  const getRectFor = useCallback(
    (id) => rectMapRef.current.get(id) ?? null,
    []
  );

  const value = useMemo(
    () => ({ openItem, setOpenItem, setRectFor, getRectFor, backdropOpacity }),
    [openItem, setOpenItem, setRectFor, getRectFor, backdropOpacity]
  );

  return <NavMenuCtx.Provider value={value}>{children}</NavMenuCtx.Provider>;
}

function useNavMenu() {
  const ctx = useContext(NavMenuCtx);
  if (!ctx)
    throw new Error("NavigationMenu.* must be used inside <NavigationMenu>.");
  return ctx;
}

// --------------------------------------
// List (horizontal container)
// --------------------------------------
export function NavigationMenuList({ children, style }) {
  return (
    <View
      style={[styles.list, style]}
      accessibilityRole="menu"
      accessibilityLabel="Navigation Menu"
    >
      {children}
    </View>
  );
}

// --------------------------------------
// Item
// --------------------------------------
const ItemCtx = createContext(null);

export function NavigationMenuItem({ id, children, style }) {
  if (!id) throw new Error("<NavigationMenuItem id=...> is required.");
  const value = useMemo(() => ({ id }), [id]);
  return (
    <ItemCtx.Provider value={value}>
      <View style={[styles.item, style]}>{children}</View>
    </ItemCtx.Provider>
  );
}

function useItem() {
  const ctx = useContext(ItemCtx);
  if (!ctx)
    throw new Error(
      "NavigationMenuTrigger/Content must be inside <NavigationMenuItem>."
    );
  return ctx;
}

// --------------------------------------
// Trigger (tap to open)
// --------------------------------------
export function NavigationMenuTrigger({
  children,
  style,
  textStyle,
  openOnLongPress = false,
  disabled = false,
}) {
  const { id } = useItem();
  const { openItem, setOpenItem, setRectFor } = useNavMenu();
  const ref = useRef(null);

  const measure = useCallback(() => {
    const node = findNodeHandle(ref.current);
    if (!node || !UIManager.measureInWindow) return;
    UIManager.measureInWindow(node, (x, y, width, height) => {
      setRectFor(id, { x, y, width, height });
    });
  }, [id, setRectFor]);

  const toggle = useCallback(() => {
    if (disabled) return;
    measure();
    setOpenItem(openItem === id ? null : id);
  }, [disabled, measure, openItem, id, setOpenItem]);

  const handlers = openOnLongPress
    ? { onLongPress: toggle }
    : { onPress: toggle };
  const active = openItem === id;

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityState={{ expanded: active }}
      style={[styles.trigger, active && styles.triggerActive, style]}
      {...handlers}
    >
      {typeof children === "string" ? (
        <Text style={[styles.triggerText, textStyle]}>{children}</Text>
      ) : (
        children
      )}
      {/* simple chevron */}
      <View
        style={[
          styles.chevron,
          active && { transform: [{ rotate: "180deg" }] },
        ]}
      />
    </Pressable>
  );
}

// --------------------------------------
// Content (anchored dropdown panel rendered in a Modal portal)
// --------------------------------------
export function NavigationMenuContent({ children, style, containerStyle }) {
  const { id } = useItem();
  const { openItem, setOpenItem, getRectFor, backdropOpacity } = useNavMenu();
  const visible = openItem === id;
  const animOpacity = useRef(new Animated.Value(0)).current;
  const animScale = useRef(new Animated.Value(0.97)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(animOpacity, {
          toValue: 1,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(animScale, {
          toValue: 1,
          duration: 160,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(animOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animScale, {
          toValue: 0.97,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, animOpacity, animScale]);

  const close = useCallback(() => setOpenItem(null), [setOpenItem]);

  // position panel near trigger
  const rect = getRectFor(id);
  const { width: SW, height: SH } = Dimensions.get("window");
  const CONTENT_W = Math.min(320, Math.max(220, rect?.width ?? 260));
  const CONTENT_H = undefined; // auto
  let left = rect ? rect.x : 12;
  let top = rect ? rect.y + (rect.height ?? 0) + 6 : 12;
  left = Math.max(8, Math.min(left, SW - (CONTENT_W || 260) - 8));
  top = Math.max(8, Math.min(top, SH - 200));

  return (
    <Modal visible={visible} transparent onRequestClose={close}>
      <Pressable
        style={[styles.backdrop, { opacity: backdropOpacity }]}
        onPress={close}
      />

      {/* Indicator (triangle) */}
      {rect ? (
        <View
          pointerEvents="none"
          style={[
            styles.indicatorWrap,
            {
              left: rect.x + rect.width / 2 - 6,
              top: rect.y + rect.height + 1,
            },
          ]}
        >
          <View style={styles.indicator} />
        </View>
      ) : null}

      <Animated.View
        style={[
          styles.portal,
          containerStyle,
          { opacity: animOpacity, transform: [{ scale: animScale }] },
        ]}
      >
        <View style={[styles.content, { left, top, width: CONTENT_W }, style]}>
          {children}
        </View>
      </Animated.View>
    </Modal>
  );
}

// --------------------------------------
// Link (menu row)
// --------------------------------------
export function NavigationMenuLink({
  children,
  onPress,
  style,
  textStyle,
  disabled = false,
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.link,
        pressed && styles.linkPressed,
        style,
      ]}
    >
      {typeof children === "string" ? (
        <Text style={[styles.linkText, textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

// --------------------------------------
// Indicator (standalone) — optional helper if you want to place it yourself
// --------------------------------------
export function NavigationMenuIndicator({ style }) {
  return <View style={[styles.indicator, style]} />;
}

// --------------------------------------
// Viewport (no-op / wrapper for API compatibility)
// --------------------------------------
export function NavigationMenuViewport({ children, style }) {
  return <View style={style}>{children}</View>;
}

// --------------------------------------
// Styles
// --------------------------------------
const styles = StyleSheet.create({
  list: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  item: {
    position: "relative",
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 6,
  },
  triggerActive: {
    backgroundColor: "#f5f5f5",
  },
  triggerText: {
    fontSize: 14,
    fontWeight: "600",
  },
  chevron: {
    width: 10,
    height: 10,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#666",
    transform: [{ rotate: "45deg" }],
    marginLeft: 4,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
  },
  portal: {
    flex: 1,
  },
  content: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e5e5",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  indicatorWrap: {
    position: "absolute",
    width: 12,
    height: 12,
  },
  indicator: {
    width: 12,
    height: 12,
    backgroundColor: "white",
    transform: [{ rotate: "45deg" }],
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e5e5",
  },
  link: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  linkPressed: {
    backgroundColor: "#f2f2f2",
  },
  linkText: {
    fontSize: 14,
  },
});

// --------------------------------------
// Example usage (remove if you ship as a library)
// --------------------------------------
export function Example() {
  return (
    <NavigationMenu defaultOpenItem={null}>
      <NavigationMenuList>
        <NavigationMenuItem id="products">
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink onPress={() => {}}>App 1</NavigationMenuLink>
            <NavigationMenuLink onPress={() => {}}>App 2</NavigationMenuLink>
            <NavigationMenuLink onPress={() => {}}>App 3</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem id="docs">
          <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink onPress={() => {}}>
              Getting Started
            </NavigationMenuLink>
            <NavigationMenuLink onPress={() => {}}>API</NavigationMenuLink>
            <NavigationMenuLink onPress={() => {}}>Examples</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
