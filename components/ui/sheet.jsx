// Sheet.js — React Native port of Radix Dialog-based Sheet (JSX)
// - Mobile: opens as sliding drawer from side (top/right/bottom/left)
// - Controlled/uncontrolled open state supported
// - Uses RN Modal + Animated for transitions
// - Includes: Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription

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
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";

const SheetCtx = createContext(null);

export function Sheet({
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

  const value = useMemo(() => ({ open, setOpen }), [open]);

  return <SheetCtx.Provider value={value}>{children}</SheetCtx.Provider>;
}

function useSheet() {
  const ctx = useContext(SheetCtx);
  if (!ctx) throw new Error("Sheet.* must be used within <Sheet>");
  return ctx;
}

export function SheetTrigger({ children, style }) {
  const { setOpen } = useSheet();
  return (
    <Pressable style={style} onPress={() => setOpen(true)}>
      {children}
    </Pressable>
  );
}

export function SheetClose({ children, style }) {
  const { setOpen } = useSheet();
  return (
    <Pressable style={style} onPress={() => setOpen(false)}>
      {children ?? <Text>Close</Text>}
    </Pressable>
  );
}

export function SheetContent({
  children,
  side = "right",
  backdropOpacity = 0.5,
  contentStyle,
}) {
  const { open, setOpen } = useSheet();
  const { width, height } = Dimensions.get("window");
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [open, anim]);

  const translate = anim.interpolate({
    inputRange: [0, 1],
    outputRange:
      side === "right"
        ? [width, 0]
        : side === "left"
        ? [-width, 0]
        : side === "bottom"
        ? [height, 0]
        : [-height, 0],
  });

  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      onRequestClose={() => setOpen(false)}
    >
      <Pressable
        style={[
          styles.backdrop,
          { backgroundColor: `rgba(0,0,0,${backdropOpacity})` },
        ]}
        onPress={() => setOpen(false)}
      />
      <Animated.View
        style={[
          styles.contentBase,
          getSideStyle(side),
          {
            transform: isVertical(side)
              ? [{ translateY: translate }]
              : [{ translateX: translate }],
          },
          contentStyle,
        ]}
      >
        {children}
      </Animated.View>
    </Modal>
  );
}

function isVertical(side) {
  return side === "top" || side === "bottom";
}

function getSideStyle(side) {
  const { width, height } = Dimensions.get("window");
  switch (side) {
    case "right":
      return { top: 0, bottom: 0, right: 0, width: width * 0.75 };
    case "left":
      return { top: 0, bottom: 0, left: 0, width: width * 0.75 };
    case "top":
      return { top: 0, left: 0, right: 0, height: height * 0.5 };
    case "bottom":
      return { bottom: 0, left: 0, right: 0, height: height * 0.5 };
    default:
      return {};
  }
}

export function SheetHeader({ children, style }) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export function SheetFooter({ children, style }) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

export function SheetTitle({ children, style }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function SheetDescription({ children, style }) {
  return <Text style={[styles.description, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0 },
  contentBase: {
    position: "absolute",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    padding: 16,
  },
  header: {
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e5e5",
  },
  footer: {
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e5e5",
  },
  title: { fontSize: 18, fontWeight: "600" },
  description: { fontSize: 14, color: "#666" },
});

// Example usage
export function Example() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <View style={{ padding: 12, backgroundColor: "#eee", borderRadius: 6 }}>
          <Text>Open Sheet</Text>
        </View>
      </SheetTrigger>

      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Description here</SheetDescription>
        </SheetHeader>
        <View style={{ flex: 1 }} />
        <SheetFooter>
          <SheetClose>
            <View
              style={{ padding: 10, backgroundColor: "#eee", borderRadius: 6 }}
            >
              <Text>Close</Text>
            </View>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
