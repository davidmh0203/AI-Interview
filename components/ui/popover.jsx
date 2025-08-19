// Popover.js — React Native port of Radix Popover (JSX)
// - Mobile-first: opens on tap (or long-press opt-in)
// - Trigger measures its on-screen rect; Content anchors near it with side/align/offset
// - Controlled/uncontrolled `open` state supported
// - No external deps besides react / react-native
//
// Usage example is at the bottom (Example component).

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
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
  UIManager,
  findNodeHandle,
  Animated,
  Easing,
} from "react-native";

// --------------------------------------
// Context
// --------------------------------------
const PopoverCtx = createContext(null);

export default function Popover({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const setOpen = useCallback(
    (v) => {
      onOpenChange?.(v);
      if (controlledOpen === undefined) setInternalOpen(v);
    },
    [onOpenChange, controlledOpen]
  );

  // rect of the trigger for anchoring
  const [anchorRect, setAnchorRect] = useState(null);

  const value = useMemo(
    () => ({ open, setOpen, anchorRect, setAnchorRect }),
    [open, anchorRect]
  );

  return <PopoverCtx.Provider value={value}>{children}</PopoverCtx.Provider>;
}

function usePopover() {
  const ctx = useContext(PopoverCtx);
  if (!ctx) throw new Error("Popover.* must be used inside <Popover>.");
  return ctx;
}

// --------------------------------------
// Trigger
// --------------------------------------
export function PopoverTrigger({
  children,
  openOnLongPress = false,
  disabled = false,
  style,
  ...rest
}) {
  const { setOpen, setAnchorRect } = usePopover();
  const ref = useRef(null);

  const measure = useCallback(() => {
    const node = findNodeHandle(ref.current);
    if (!node || !UIManager.measureInWindow) return;
    UIManager.measureInWindow(node, (x, y, width, height) => {
      setAnchorRect({ x, y, width, height });
    });
  }, [setAnchorRect]);

  const toggle = useCallback(() => {
    if (disabled) return;
    measure();
    setOpen((prev) => !prev);
  }, [disabled, measure, setOpen]);

  const handlers = openOnLongPress
    ? { onLongPress: toggle }
    : { onPress: toggle };

  return (
    <View ref={ref} collapsable={false} style={style} {...rest}>
      <Pressable disabled={disabled} {...handlers}>
        {typeof children === "function"
          ? children({ openOnLongPress })
          : children}
      </Pressable>
    </View>
  );
}

// --------------------------------------
// Optional Anchor (API parity helper; behaves like a plain wrapper that measures)
// --------------------------------------
export function PopoverAnchor({ children, style, ...rest }) {
  const { setAnchorRect } = usePopover();
  const ref = useRef(null);

  useEffect(() => {
    const node = findNodeHandle(ref.current);
    if (!node || !UIManager.measureInWindow) return;
    UIManager.measureInWindow(node, (x, y, width, height) =>
      setAnchorRect({ x, y, width, height })
    );
  }, [setAnchorRect]);

  return (
    <View ref={ref} collapsable={false} style={style} {...rest}>
      {children}
    </View>
  );
}

// --------------------------------------
// Content
// --------------------------------------
export function PopoverContent({
  children,
  align = "center", // 'start' | 'center' | 'end'
  side = "bottom", // 'top' | 'bottom' | 'left' | 'right'
  sideOffset = 8,
  backdropOpacity = 0, // dim background 0~1
  contentStyle,
  containerStyle,
  onDismiss,
}) {
  const { open, setOpen, anchorRect } = usePopover();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 140,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open, opacity, scale]);

  const close = useCallback(() => {
    setOpen(false);
    onDismiss?.();
  }, [setOpen, onDismiss]);

  const { width: SW, height: SH } = Dimensions.get("window");

  const computePos = () => {
    if (!anchorRect)
      return { left: 16, top: 16, width: Math.min(300, SW - 32) };
    const { x, y, width, height } = anchorRect;

    const W = Math.min(300, Math.max(220, width));
    const H = undefined; // auto height

    let left = x;
    let top = y;

    if (side === "bottom") top = y + height + sideOffset;
    if (side === "top") top = y - (H ?? 180) - sideOffset; // guess for clamp, adjusted later
    if (side === "right") left = x + width + sideOffset;
    if (side === "left") left = x - W - sideOffset;

    if (side === "top" || side === "bottom") {
      if (align === "start") left = x;
      if (align === "center") left = x + width / 2 - W / 2;
      if (align === "end") left = x + width - W;
    } else {
      if (align === "start") top = y;
      if (align === "center") top = y + height / 2 - (H ?? 180) / 2;
      if (align === "end") top = y + height - (H ?? 180);
    }

    left = Math.max(8, Math.min(left, SW - W - 8));
    top = Math.max(8, Math.min(top, SH - 200));

    return { left, top, width: W };
  };

  const pos = computePos();

  return (
    <Modal visible={!!open} transparent onRequestClose={close}>
      <Pressable
        style={[styles.backdrop, { opacity: backdropOpacity }]}
        onPress={close}
      />

      <Animated.View
        style={[
          styles.portal,
          containerStyle,
          { transform: [{ scale }], opacity },
        ]}
        pointerEvents="box-none"
      >
        <View
          style={[
            styles.content,
            { left: pos.left, top: pos.top, width: pos.width },
            contentStyle,
          ]}
        >
          {children}
        </View>
      </Animated.View>
    </Modal>
  );
}

// --------------------------------------
// Styles
// --------------------------------------
const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
  },
  portal: { flex: 1 },
  content: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e5e5",
  },
});

// --------------------------------------
// Example usage (remove in production)
// --------------------------------------
export function Example() {
  const [value, setValue] = useState(0);
  return (
    <Popover>
      <PopoverTrigger>
        <View
          style={{
            padding: 10,
            backgroundColor: "#fff",
            borderRadius: 8,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: "#ddd",
          }}
        >
          <Text>Open Popover ({value})</Text>
        </View>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="center"
        sideOffset={8}
        backdropOpacity={0}
      >
        <Pressable onPress={() => setValue((v) => v + 1)}>
          <Text style={{ fontWeight: "600", marginBottom: 6 }}>
            Hello from Popover
          </Text>
          <Text>Tap here to +1</Text>
        </Pressable>
      </PopoverContent>
    </Popover>
  );
}
