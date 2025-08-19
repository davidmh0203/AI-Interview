// ui/dropdown-menu.jsx (React Native / Expo)
import React, { useCallback, useMemo, useState } from "react";
import {
  Modal,
  View,
  Pressable,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { Check, ChevronRight, Circle } from "lucide-react-native";

/**
 * RN 버전 개요
 * - DropdownMenu: 내부 state(open) 보유. 필요하면 controlled로도 사용 가능.
 * - DropdownMenuTrigger: 트리거 래퍼(Pressable). onPress로 open 제어.
 * - DropdownMenuContent: Modal 기반 오버레이. children에 Item/Label/Separator 배치.
 * - DropdownMenuItem: 기본 항목 (onSelect)
 * - DropdownMenuCheckboxItem: 체크 토글 항목 (controlled/controlled-like)
 * - DropdownMenuRadioGroup / DropdownMenuRadioItem: 라디오 목록
 * - DropdownMenuLabel / DropdownMenuSeparator
 *
 * 제한
 * - Web Radix의 Portal/Side/Offset/KeyboardNav/FocusTrap은 간소화
 * - Sub/ContextMenu 등은 미구현(필요하면 바텀시트로 확장 가능)
 */

const Backdrop = ({ onPress }) => (
  <TouchableWithoutFeedback onPress={onPress}>
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.25)",
        justifyContent: "center",
        padding: 16,
      }}
    />
  </TouchableWithoutFeedback>
);

export function DropdownMenu({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;

  const setOpen = useCallback(
    (v) => {
      if (onOpenChange) onOpenChange(v);
      if (openProp === undefined) setUncontrolledOpen(v);
    },
    [onOpenChange, openProp]
  );

  // context로 trigger/content가 공유
  const ctx = useMemo(() => ({ open, setOpen }), [open, setOpen]);

  return (
    <DropdownMenuContext.Provider value={ctx}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

const DropdownMenuContext = React.createContext({
  open: false,
  setOpen: () => {},
});

export function DropdownMenuTrigger({ children, disabled, style }) {
  const { setOpen } = React.useContext(DropdownMenuContext);
  return (
    <Pressable
      onPress={() => !disabled && setOpen(true)}
      disabled={disabled}
      style={style}
    >
      {children}
    </Pressable>
  );
}

export function DropdownMenuContent({
  children,
  animationType = Platform.OS === "ios" ? "fade" : "none",
  align = "center", // 단순 정렬 힌트 (스타일로만 처리)
  onRequestClose, // Android back 버튼 대응
}) {
  const { open, setOpen } = React.useContext(DropdownMenuContext);

  // 정렬은 간단히 중앙에 카드처럼 띄움. 필요시 bottom sheet 스타일로 변경 가능
  return (
    <Modal
      visible={open}
      transparent
      animationType={animationType}
      onRequestClose={() => {
        setOpen(false);
        onRequestClose?.();
      }}
    >
      <View style={{ flex: 1 }}>
        <Backdrop onPress={() => setOpen(false)} />
        <View
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            // center
            top: "25%",
            borderRadius: 12,
            backgroundColor: "white",
            borderColor: "rgba(0,0,0,0.06)",
            borderWidth: 1,
            paddingVertical: 8,
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 8,
          }}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}

export function DropdownMenuLabel({ inset, children }) {
  return (
    <View style={{ paddingVertical: 8, paddingHorizontal: inset ? 24 : 12 }}>
      <Text style={{ fontWeight: "600", fontSize: 14 }}>{children}</Text>
    </View>
  );
}

export function DropdownMenuSeparator() {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: "rgba(0,0,0,0.06)",
        marginVertical: 6,
        marginHorizontal: 4,
      }}
    />
  );
}

export function DropdownMenuItem({
  inset,
  destructive,
  disabled,
  onSelect,
  children,
  rightIcon, // optional trailing icon / text
}) {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onSelect}
      style={{
        opacity: disabled ? 0.5 : 1,
        paddingVertical: 10,
        paddingHorizontal: inset ? 24 : 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          color: destructive ? "#d4183d" : "#111",
          flex: 1,
        }}
      >
        {children}
      </Text>
      {rightIcon ?? null}
    </TouchableOpacity>
  );
}

export function DropdownMenuCheckboxItem({
  checked,
  onCheckedChange,
  children,
  disabled,
}) {
  const toggle = () => onCheckedChange?.(!checked);

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={toggle}
      style={{
        opacity: disabled ? 0.5 : 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <View style={{ width: 24, alignItems: "center" }}>
        {checked ? <Check size={16} /> : null}
      </View>
      <Text style={{ fontSize: 14, color: "#111", flex: 1 }}>{children}</Text>
    </TouchableOpacity>
  );
}

const RadioGroupContext = React.createContext({
  value: undefined,
  onValueChange: () => {},
});

export function DropdownMenuRadioGroup({ value, onValueChange, children }) {
  const ctx = useMemo(() => ({ value, onValueChange }), [value, onValueChange]);
  return (
    <RadioGroupContext.Provider value={ctx}>
      <View>{children}</View>
    </RadioGroupContext.Provider>
  );
}

export function DropdownMenuRadioItem({ value, children, disabled }) {
  const { value: current, onValueChange } = React.useContext(RadioGroupContext);
  const selected = current === value;

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={() => onValueChange?.(value)}
      style={{
        opacity: disabled ? 0.5 : 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <View style={{ width: 24, alignItems: "center" }}>
        {selected ? <Circle size={10} /> : null}
      </View>
      <Text style={{ fontSize: 14, color: "#111", flex: 1 }}>{children}</Text>
    </TouchableOpacity>
  );
}
