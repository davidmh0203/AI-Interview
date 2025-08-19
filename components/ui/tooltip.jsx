// Tooltip.js — React Native port of Radix Tooltip (JSX)
// - Mobile has no hover; open on long-press by default (configurable)
// - Components: TooltipProvider, Tooltip, TooltipTrigger, TooltipContent
// - Features: delayDuration, side/align/offset, auto-clamp to viewport, fade+scale animation
// - No external deps beyond react / react-native
//
// Usage example at bottom.

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
// Provider (delay)
// --------------------------------------
const TooltipCtx = createContext({ delayDuration: 0 });

export function TooltipProvider({ delayDuration = 0, children }) {
  const value = useMemo(() => ({ delayDuration }), [delayDuration]);
  return <TooltipCtx.Provider value={value}>{children}</TooltipCtx.Provider>;
}

// --------------------------------------
// Tooltip (scope for state)
// --------------------------------------
const ScopeCtx = createContext(null);

export function Tooltip({
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  children,
}) {
  const [internalOpen, setInternalOpen] = useState(!!defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const setOpen = useCallback(
    (v) => {
      onOpenChange?.(v);
      if (controlledOpen === undefined) setInternalOpen(v);
    },
    [onOpenChange, controlledOpen]
  );

  // anchor rect for positioning
  const [anchorRect, setAnchorRect] = useState(null);

  const scope = useMemo(
    () => ({ open, setOpen, anchorRect, setAnchorRect }),
    [open, anchorRect]
  );
  return <ScopeCtx.Provider value={scope}>{children}</ScopeCtx.Provider>;
}

function useScope() {
  const ctx = useContext(ScopeCtx);
  if (!ctx) throw new Error("Tooltip.* must be used inside <Tooltip>");
  return ctx;
}

// --------------------------------------
// Trigger
// --------------------------------------
export function TooltipTrigger({
  children,
  openOnLongPress = true,
  disabled = false,
  style,
  ...rest
}) {
  const { delayDuration } = useContext(TooltipCtx);
  const { setOpen, setAnchorRect } = useScope();
  const ref = useRef(null);
  const timerRef = useRef(null);

  const measure = useCallback(() => {
    const node = findNodeHandle(ref.current);
    if (!node || !UIManager.measureInWindow) return;
    UIManager.measureInWindow(node, (x, y, width, height) =>
      setAnchorRect({ x, y, width, height })
    );
  }, [setAnchorRect]);

  const show = useCallback(() => {
    if (disabled) return;
    measure();
    if (delayDuration > 0) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setOpen(true), delayDuration);
    } else {
      setOpen(true);
    }
  }, [disabled, measure, setOpen, delayDuration]);

  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    setOpen(false);
  }, [setOpen]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handlers = openOnLongPress
    ? { onLongPress: show, onPressOut: hide }
    : { onPressIn: show, onPressOut: hide };

  return (
    <View ref={ref} collapsable={false} style={style} {...rest}>
      <Pressable disabled={disabled} {...handlers}>
        {children}
      </Pressable>
    </View>
  );
}

// --------------------------------------
// Content
// --------------------------------------
export function TooltipContent({
  children,
  side = "top", // 'top' | 'bottom' | 'left' | 'right'
  align = "center", // 'start' | 'center' | 'end'
  sideOffset = 6,
  allowDismissOnPress = true,
  contentStyle,
  textStyle,
}) {
  const { open, setOpen, anchorRect } = useScope();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

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
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.96,
          duration: 90,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open, opacity, scale]);

  const close = useCallback(() => setOpen(false), [setOpen]);
  const { width: SW, height: SH } = Dimensions.get("window");

  const pos = useMemo(() => {
    if (!anchorRect) return { left: 16, top: 16, width: undefined };
    const { x, y, width, height } = anchorRect;
    const MAX_W = Math.min(280, SW - 24);
    const W = MAX_W;
    const H = undefined; // auto
    let left = x;
    let top = y;

    if (side === "bottom") top = y + height + sideOffset;
    if (side === "top") top = y - (H ?? 40) - sideOffset; // rough before clamp
    if (side === "right") left = x + width + sideOffset;
    if (side === "left") left = x - W - sideOffset;

    if (side === "top" || side === "bottom") {
      if (align === "start") left = x;
      if (align === "center") left = x + width / 2 - W / 2;
      if (align === "end") left = x + width - W;
    } else {
      if (align === "start") top = y;
      if (align === "center") top = y + height / 2 - (H ?? 40) / 2;
      if (align === "end") top = y + height - (H ?? 40);
    }

    // clamp
    left = Math.max(8, Math.min(left, SW - (W ?? 180) - 8));
    top = Math.max(8, Math.min(top, SH - 60));

    return { left, top, width: W };
  }, [anchorRect, SW, SH, side, align, sideOffset]);

  return (
    <Modal
      visible={!!open}
      transparent
      animationType="none"
      onRequestClose={close}
    >
      <Animated.View
        style={[styles.portal, { opacity }]}
        pointerEvents="box-none"
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={allowDismissOnPress ? close : undefined}
        />
        <Animated.View
          style={[
            styles.content,
            { left: pos.left, top: pos.top, transform: [{ scale }] },
            contentStyle,
          ]}
        >
          {typeof children === "string" ? (
            <Text style={[styles.text, textStyle]}>{children}</Text>
          ) : (
            children
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// --------------------------------------
// Styles
// --------------------------------------
const styles = StyleSheet.create({
  portal: { flex: 1 },
  content: {
    position: "absolute",
    maxWidth: 280,
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  text: {
    color: "#fff",
    fontSize: 12,
  },
});

// --------------------------------------
// Example (remove in production)
// --------------------------------------
export function Example() {
  return (
    <TooltipProvider delayDuration={250}>
      <Tooltip>
        <TooltipTrigger>
          <View
            style={{ padding: 10, backgroundColor: "#fff", borderRadius: 8 }}
          >
            <Text>롱프레스</Text>
          </View>
        </TooltipTrigger>
        <TooltipContent side="top" align="center">
          툴팁 텍스트
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
