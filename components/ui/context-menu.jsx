import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
} from "react-native";
import { Check, ChevronRight, Circle } from "lucide-react-native";

// ====== 유틸 ======
const clamp = (n, min, max) => Math.max(min, Math.min(n, max));
const useWindow = () => Dimensions.get("window");

// 간단 테마(필요시 프로젝트 변수와 맞춰 수정)
const COLORS = {
  bg: "#fff",
  fg: "#111827",
  muted: "#6B7280",
  border: "rgba(0,0,0,0.1)",
  hover: "#F3F4F6",
  overlay: "rgba(0,0,0,0.2)",
  primary: "#030213",
  disabled: "#A1A1AA",
};

// ====== Context ======
const MenuCtx = createContext(null);

function useMenuCtx() {
  const v = useContext(MenuCtx);
  if (!v) throw new Error("ContextMenu must wrap children.");
  return v;
}

// ====== Root ======
export function ContextMenu({
  children,
  open: openProp,
  onOpenChange,
  sideOffset = 8,
}) {
  const [open, setOpen] = useState(!!openProp);
  const [anchor, setAnchor] = useState({ x: 0, y: 0 }); // 터치 좌표
  const [contentSize, setContentSize] = useState({ w: 0, h: 0 });
  const win = useWindow();

  // 제어/비제어
  const isControlled = typeof openProp === "boolean";
  const setOpenSafe = useCallback(
    (v) => {
      if (isControlled) onOpenChange?.(v);
      else setOpen(v);
    },
    [isControlled, onOpenChange]
  );

  useEffect(() => {
    if (isControlled) setOpen(!!openProp);
  }, [isControlled, openProp]);

  // 화면 밖으로 넘치지 않게 보정
  const pos = useMemo(() => {
    const margin = 8;
    const xMax = win.width - contentSize.w - margin;
    const yMax = win.height - contentSize.h - margin;

    const x = clamp(anchor.x + sideOffset, margin, Math.max(margin, xMax));
    const y = clamp(anchor.y + sideOffset, margin, Math.max(margin, yMax));
    return { left: x, top: y };
  }, [anchor, contentSize, win.width, win.height, sideOffset]);

  const value = useMemo(
    () => ({
      open,
      setOpen: setOpenSafe,
      anchor,
      setAnchor,
      setContentSize,
      win,
      sideOffset,
    }),
    [open, setOpenSafe, anchor, win, sideOffset]
  );

  return <MenuCtx.Provider value={value}>{children}</MenuCtx.Provider>;
}

// ====== Trigger ======
// 사용: <ContextMenuTrigger><YourCell /></ContextMenuTrigger>
export function ContextMenuTrigger({ children, longPressDelay = 300 }) {
  const { setOpen, setAnchor } = useMenuCtx();

  // Pressable 래핑하여 좌표 캡처
  const onPressIn = (e) => {
    const { pageX, pageY } = e.nativeEvent;
    setAnchor({ x: pageX, y: pageY });
  };

  const onLongPress = () => {
    setOpen(true);
  };

  return (
    <Pressable
      onPressIn={onPressIn}
      onLongPress={onLongPress}
      delayLongPress={longPressDelay}
    >
      {children}
    </Pressable>
  );
}

// ====== Content ======
export function ContextMenuContent({ children, style, className }) {
  const { open, setOpen, setContentSize, win } = useMenuCtx();
  const [measured, setMeasured] = useState(false);

  // 첫 렌더에서 사이즈 측정
  const onLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    setContentSize({ w: width, h: height });
    setMeasured(true);
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      {/* 오버레이 */}
      <TouchableWithoutFeedback onPress={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: COLORS.overlay }} />
      </TouchableWithoutFeedback>

      {/* 메뉴 본체: 절대 위치 */}
      <MenuPositioner measured={measured}>
        <View
          onLayout={onLayout}
          style={[
            {
              position: "absolute",
              minWidth: 220,
              borderRadius: 12,
              backgroundColor: COLORS.bg,
              borderWidth: Platform.OS === "ios" ? 0.5 : 1,
              borderColor: COLORS.border,
              paddingVertical: 6,
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 10,
            },
            style,
          ]}
        >
          {children}
        </View>
      </MenuPositioner>
    </Modal>
  );
}

// 내부: 위치 계산 후 children을 그 위치에 렌더
function MenuPositioner({ children, measured }) {
  const { open, setOpen, win, anchor, sideOffset, setContentSize } =
    useMenuCtx();
  const [pos, setPos] = useState({ left: 0, top: 0 });

  const place = useCallback(
    (w, h) => {
      const margin = 8;
      const xMax = win.width - w - margin;
      const yMax = win.height - h - margin;
      const left = clamp(anchor.x + sideOffset, margin, Math.max(margin, xMax));
      const top = clamp(anchor.y + sideOffset, margin, Math.max(margin, yMax));
      setPos({ left, top });
    },
    [win.width, win.height, anchor.x, anchor.y, sideOffset]
  );

  // 측정 완료되면 위치 확정
  useEffect(() => {
    if (!measured) return;
    // 측정은 Content에서 수행 → 여기선 pos만 적용
  }, [measured]);

  // children의 onLayout에서 치수 전달받고 여기서 위치 계산
  const clone = React.Children.only(children);
  const injected = React.cloneElement(clone, {
    onLayout: (e) => {
      const { width, height } = e.nativeEvent.layout;
      setContentSize({ w: width, h: height });
      place(width, height);
      clone.props.onLayout?.(e);
    },
    style: [clone.props.style, { left: pos.left, top: pos.top }],
  });

  return injected;
}

// ====== Item ======
export function ContextMenuItem({
  children,
  onSelect,
  disabled,
  inset,
  rightSlot,
  className,
  style,
  accessibilityLabel,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onSelect}
      style={({ pressed }) => [
        {
          opacity: disabled ? 0.5 : 1,
          paddingVertical: 10,
          paddingHorizontal: inset ? 16 : 12,
          backgroundColor: pressed ? COLORS.hover : "transparent",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        style,
      ]}
    >
      <Text style={{ color: COLORS.fg, fontSize: 14 }}>{children}</Text>
      {rightSlot ?? null}
    </Pressable>
  );
}

export function ContextMenuShortcut({ children }) {
  return <Text style={{ color: COLORS.muted, fontSize: 12 }}>{children}</Text>;
}

export function ContextMenuSeparator() {
  return (
    <View
      style={{ height: 1, backgroundColor: COLORS.border, marginVertical: 6 }}
    />
  );
}

// ====== Checkbox Item ======
export function ContextMenuCheckboxItem({
  children,
  checked = false,
  onCheckedChange,
  disabled,
  accessibilityLabel,
}) {
  return (
    <ContextMenuItem
      onSelect={() => !disabled && onCheckedChange?.(!checked)}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      rightSlot={checked ? <Check size={16} color={COLORS.fg} /> : null}
    >
      {children}
    </ContextMenuItem>
  );
}

// ====== Radio Group / Radio Item ======
const RadioCtx = createContext(null);

export function ContextMenuRadioGroup({ value, onValueChange, children }) {
  const v = useMemo(() => ({ value, onValueChange }), [value, onValueChange]);
  return <RadioCtx.Provider value={v}>{children}</RadioCtx.Provider>;
}

export function ContextMenuRadioItem({
  value,
  children,
  disabled,
  accessibilityLabel,
}) {
  const ctx = useContext(RadioCtx);
  const selected = ctx?.value === value;
  return (
    <ContextMenuItem
      onSelect={() => !disabled && ctx?.onValueChange?.(value)}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      rightSlot={selected ? <Circle size={12} color={COLORS.fg} /> : null}
    >
      {children}
    </ContextMenuItem>
  );
}

// ====== Sub Menu ======
const SubCtx = createContext(null);

export function ContextMenuSub({ children }) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0 });
  const v = useMemo(
    () => ({ open, setOpen, anchor, setAnchor }),
    [open, anchor]
  );
  return <SubCtx.Provider value={v}>{children}</SubCtx.Provider>;
}

export function ContextMenuSubTrigger({
  children,
  disabled,
  accessibilityLabel,
}) {
  const { open, setOpen, setAnchor } = useContext(SubCtx);
  const { setOpen: setRootOpen, win, sideOffset } = useMenuCtx();

  const onPressIn = (e) => {
    const { pageX, pageY } = e.nativeEvent;
    setAnchor({ x: pageX, y: pageY });
  };

  return (
    <ContextMenuItem
      onSelect={() => !disabled && setOpen(true)}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      rightSlot={<ChevronRight size={16} color={COLORS.muted} />}
      inset
    >
      <Pressable onPressIn={onPressIn}>
        <Text style={{ color: COLORS.fg, fontSize: 14 }}>{children}</Text>
      </Pressable>
    </ContextMenuItem>
  );
}

export function ContextMenuSubContent({ children, style }) {
  const root = useMenuCtx();
  const sub = useContext(SubCtx);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (!sub.open) return;
    // 서브메뉴는 오른쪽으로 살짝 띄워서
    const margin = 8;
    const left = clamp(
      sub.anchor.x + 180,
      margin,
      root.win.width - size.w - margin
    ); // 대략 180 오른쪽
    const top = clamp(
      sub.anchor.y - 16,
      margin,
      root.win.height - size.h - margin
    );
    setPos({ left, top });
  }, [sub.open, sub.anchor, size.w, size.h, root.win.width, root.win.height]);

  if (!sub.open) return null;

  return (
    <View
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize({ w: width, h: height });
      }}
      style={[
        {
          position: "absolute",
          left: pos.left,
          top: pos.top,
          minWidth: 200,
          borderRadius: 12,
          backgroundColor: COLORS.bg,
          borderWidth: Platform.OS === "ios" ? 0.5 : 1,
          borderColor: COLORS.border,
          paddingVertical: 6,
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 10,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
