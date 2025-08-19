import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useEffect,
  useState,
} from "react";
import {
  Modal,
  View,
  Pressable,
  Text,
  Animated,
  Easing,
  StyleSheet,
  Platform,
  BackHandler,
} from "react-native";

// -------------------- Context --------------------
const DrawerCtx = createContext(null);
function useDrawerCtx() {
  const ctx = useContext(DrawerCtx);
  if (!ctx) throw new Error("Drawer 컴포넌트 내부에서만 사용하세요.");
  return ctx;
}

// -------------------- Root --------------------
export function Drawer({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
  dismissOnBackdropPress = true,
  dismissOnBackButton = true,
}) {
  const isControlled = typeof openProp === "boolean";
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = isControlled ? openProp : internalOpen;

  const setOpen = (next) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  // 안드로이드 하드웨어 백버튼 처리
  useEffect(() => {
    if (!dismissOnBackButton || !open || Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      setOpen(false);
      return true;
    });
    return () => sub.remove();
  }, [open, dismissOnBackButton]);

  const ctxValue = useMemo(
    () => ({ open, setOpen, dismissOnBackdropPress }),
    [open]
  );

  return <DrawerCtx.Provider value={ctxValue}>{children}</DrawerCtx.Provider>;
}

// -------------------- Trigger --------------------
export function DrawerTrigger({ children, disabled, onPress, ...rest }) {
  const { setOpen } = useDrawerCtx();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={(e) => {
        onPress?.(e);
        if (!disabled) setOpen(true);
      }}
      {...rest}
    >
      {children}
    </Pressable>
  );
}

// -------------------- Content --------------------
export function DrawerContent({
  children,
  height = 420, // 컨텐츠 높이 (필요 시 조정)
  backdropOpacity = 0.35, // 백드롭 불투명도
  rounded = 16, // 상단 라운드
  animationMs = 260, // 애니메이션 시간
  style,
  containerStyle,
}) {
  const { open, setOpen, dismissOnBackdropPress } = useDrawerCtx();
  const translateY = useRef(new Animated.Value(height)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  // 열고/닫을 때 애니메이션
  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: animationMs,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, {
          toValue: 1,
          duration: animationMs,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height,
          duration: animationMs,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, {
          toValue: 0,
          duration: animationMs,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open, height, animationMs, translateY, backdrop]);

  return (
    <Modal
      visible={open}
      transparent
      animationType="none" // 직접 Animated 사용
      onRequestClose={() => setOpen(false)}
    >
      {/* Backdrop */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => dismissOnBackdropPress && setOpen(false)}
        accessibilityRole="button"
        accessibilityLabel="닫기 배경"
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.backdrop,
            {
              opacity: backdrop.interpolate({
                inputRange: [0, 1],
                outputRange: [0, backdropOpacity],
              }),
            },
          ]}
        />
      </Pressable>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.sheetContainer,
          { transform: [{ translateY }] },
          containerStyle,
        ]}
      >
        {/* Grabber */}
        <View style={styles.grabberWrap}>
          <View style={styles.grabber} />
        </View>

        <View
          style={[
            styles.sheet,
            {
              borderTopLeftRadius: rounded,
              borderTopRightRadius: rounded,
              height,
            },
            style,
          ]}
        >
          {children}
        </View>
      </Animated.View>
    </Modal>
  );
}

// -------------------- Sub-components --------------------
export function DrawerHeader({ children, style }) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export function DrawerFooter({ children, style }) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

export function DrawerTitle({ children, style }) {
  return (
    <Text style={[styles.title, style]} accessibilityRole="header">
      {children}
    </Text>
  );
}

export function DrawerDescription({ children, style }) {
  return <Text style={[styles.description, style]}>{children}</Text>;
}

export function DrawerClose({ children, onPress, ...rest }) {
  const { setOpen } = useDrawerCtx();
  return (
    <Pressable
      onPress={(e) => {
        onPress?.(e);
        setOpen(false);
      }}
      accessibilityRole="button"
      {...rest}
    >
      {children ?? <Text style={styles.closeText}>닫기</Text>}
    </Pressable>
  );
}

// -------------------- Styles --------------------
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#000",
  },
  sheetContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  grabberWrap: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 8,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
  },
  header: {
    paddingVertical: 8,
    gap: 4,
  },
  footer: {
    marginTop: 12,
    paddingTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
  },
  closeText: {
    fontSize: 16,
    color: "#111827",
  },
});
