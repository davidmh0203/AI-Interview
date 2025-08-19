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
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
  UIManager,
  findNodeHandle,
  Animated,
  Easing,
} from "react-native";

const HoverCardContext = createContext(null);

export default function HoverCard({
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

  const [anchorRect, setAnchorRect] = useState(null);

  const value = useMemo(
    () => ({ open, setOpen, anchorRect, setAnchorRect }),
    [open, anchorRect]
  );

  return (
    <HoverCardContext.Provider value={value}>
      {children}
    </HoverCardContext.Provider>
  );
}

function useHoverCardCtx() {
  const ctx = useContext(HoverCardContext);
  if (!ctx) throw new Error("HoverCard.* must be used inside <HoverCard>.");
  return ctx;
}

export function HoverCardTrigger({
  children,
  openOnLongPress = true,
  disabled = false,
  style,
  ...rest
}) {
  const { setOpen, setAnchorRect } = useHoverCardCtx();
  const ref = useRef(null);

  const measure = useCallback(() => {
    const node = findNodeHandle(ref.current);
    if (!node || !UIManager.measureInWindow) return;
    UIManager.measureInWindow(node, (x, y, width, height) => {
      setAnchorRect({ x, y, width, height });
    });
  }, [setAnchorRect]);

  const open = useCallback(() => {
    if (disabled) return;
    measure();
    setOpen(true);
  }, [disabled, measure, setOpen]);

  const handlers = openOnLongPress ? { onLongPress: open } : { onPress: open };

  return (
    <View ref={ref} collapsable={false} style={style} {...rest}>
      <Pressable disabled={disabled} {...handlers}>
        {children}
      </Pressable>
    </View>
  );
}

export function HoverCardContent({
  children,
  align = "center", // 'start' | 'center' | 'end'
  side = "bottom", // 'top' | 'bottom' | 'left' | 'right'
  sideOffset = 8,
  backdropOpacity = 0,
  contentStyle,
  containerStyle,
  onDismiss,
}) {
  const { open, setOpen, anchorRect } = useHoverCardCtx();
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

  const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

  // Compute position based on anchor + side/alignment
  const getPosition = () => {
    const fallback = { left: 0, top: 0 };
    if (!anchorRect) return fallback;
    const { x, y, width, height } = anchorRect;

    const contentWidth = 256; // default width hint; will clamp to screen
    const contentHeight = 160; // guess; layout may differ

    let left = x;
    let top = y;

    if (side === "bottom") top = y + height + sideOffset;
    if (side === "top") top = y - contentHeight - sideOffset;
    if (side === "right") left = x + width + sideOffset;
    if (side === "left") left = x - contentWidth - sideOffset;

    if (side === "top" || side === "bottom") {
      if (align === "start") left = x;
      if (align === "center") left = x + width / 2 - contentWidth / 2;
      if (align === "end") left = x + width - contentWidth;
    } else {
      if (align === "start") top = y;
      if (align === "center") top = y + height / 2 - contentHeight / 2;
      if (align === "end") top = y + height - contentHeight;
    }

    // keep in viewport (simple clamp)
    left = Math.max(8, Math.min(left, SCREEN_W - contentWidth - 8));
    top = Math.max(8, Math.min(top, SCREEN_H - contentHeight - 8));

    return { left, top, width: contentWidth };
  };

  const pos = getPosition();

  return (
    <Modal visible={!!open} transparent onRequestClose={close}>
      <Pressable
        style={[styles.backdrop, { opacity: backdropOpacity }]}
        onPress={close}
      />

      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.portal,
          containerStyle,
          { transform: [{ scale }], opacity },
        ]}
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

const styles = StyleSheet.create({
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
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
  },
});
