import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useMemo,
  useEffect,
} from "react";
import {
  Modal,
  View,
  Pressable,
  TouchableWithoutFeedback,
  Dimensions,
  StyleSheet,
  Text,
} from "react-native";
import { Check, ChevronRight, Circle } from "lucide-react-native";

// --- 1. Context 생성 ---
// 최상위 Menubar의 상태를 공유하는 Context
const MenubarContext = createContext(null);
// 개별 메뉴(Trigger-Content 쌍)의 정보를 공유하는 Context
const MenuContext = createContext(null);

// --- 2. Root 컴포넌트 ---
export function Menubar({ children, style }) {
  // 어떤 메뉴가 열려있는지 ID로 관리합니다.
  const [openMenu, setOpenMenu] = useState(null);

  const contextValue = useMemo(() => ({ openMenu, setOpenMenu }), [openMenu]);

  return (
    <MenubarContext.Provider value={contextValue}>
      <View style={[styles.menubar, style]}>{children}</View>
    </MenubarContext.Provider>
  );
}

// --- 3. 개별 메뉴 래퍼 ---
// Trigger와 Content를 그룹화하고, 자신의 상태를 관리합니다.
export function MenubarMenu({ value, children }) {
  const triggerRef = useRef(null);
  const contextValue = useMemo(() => ({ value, triggerRef }), [value]);
  return (
    <MenuContext.Provider value={contextValue}>{children}</MenuContext.Provider>
  );
}

// --- 4. 메뉴 트리거 (예: "파일", "편집") ---
export function MenubarTrigger({ children }) {
  const { openMenu, setOpenMenu } = useContext(MenubarContext);
  const { value, triggerRef } = useContext(MenuContext);
  const isOpen = openMenu === value;

  return (
    <Pressable
      ref={triggerRef}
      onPress={() => setOpenMenu(isOpen ? null : value)}
    >
      <View style={[styles.trigger, isOpen && styles.triggerOpen]}>
        <Text style={[styles.triggerText, isOpen && styles.triggerTextOpen]}>
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

// --- 5. 메뉴 컨텐츠 (드롭다운) ---
// DropdownMenu의 Content 로직과 거의 동일합니다.
export function MenubarContent({ children }) {
  const { openMenu, setOpenMenu } = useContext(MenubarContext);
  const { value, triggerRef } = useContext(MenuContext);
  const isVisible = openMenu === value;
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      triggerRef.current.measureInWindow((x, y, _width, height) => {
        setPosition({ top: y + height, left: x });
      });
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Modal
      transparent
      visible={isVisible}
      onRequestClose={() => setOpenMenu(null)}
      animationType="fade"
    >
      <TouchableWithoutFeedback onPress={() => setOpenMenu(null)}>
        <View style={styles.modalBackdrop} />
      </TouchableWithoutFeedback>
      <View
        style={[
          styles.contentContainer,
          { top: position.top, left: position.left },
        ]}
      >
        {children}
      </View>
    </Modal>
  );
}

// --- 6. 메뉴 아이템들 (DropdownMenu와 거의 동일) ---
export function MenubarItem({ children, onSelect, destructive = false }) {
  const { setOpenMenu } = useContext(MenubarContext);
  const handlePress = () => {
    onSelect?.();
    setOpenMenu(null);
  };
  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
    >
      <Text
        style={[styles.itemText, destructive && styles.itemTextDestructive]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export function MenubarCheckboxItem({ children, checked, onSelect }) {
  const { setOpenMenu } = useContext(MenubarContext);
  const handlePress = () => {
    onSelect?.();
    // 체크박스는 메뉴를 닫지 않을 수 있으므로 setOpenMenu(null) 호출 안함
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.item,
        styles.checkboxItem,
        pressed && styles.itemPressed,
      ]}
    >
      <View style={styles.checkboxIndicator}>
        {checked && <Check size={16} color="#111827" />}
      </View>
      <Text style={styles.itemText}>{children}</Text>
    </Pressable>
  );
}

// MenubarRadioGroup, MenubarRadioItem, MenubarLabel, MenubarSeparator 등
// DropdownMenu에서 만들었던 컴포넌트들을 거의 그대로 가져와 사용할 수 있습니다.
// 여기서는 주요 컴포넌트만 구현했습니다.
export const MenubarSeparator = () => <View style={styles.separator} />;
export const MenubarGroup = View;
export const MenubarLabel = ({ children }) => (
  <Text style={styles.label}>{children}</Text>
);
export const MenubarShortcut = ({ children }) => (
  <Text style={styles.shortcut}>{children}</Text>
);

// --- 스타일시트 ---
const styles = StyleSheet.create({
  menubar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 4,
    height: 44,
  },
  trigger: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  triggerOpen: {
    backgroundColor: "#F3F4F6", // accent
  },
  triggerText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  triggerTextOpen: {
    color: "#111827", // accent-foreground
  },
  modalBackdrop: {
    flex: 1,
  },
  contentContainer: {
    position: "absolute",
    minWidth: 220,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  itemPressed: {
    backgroundColor: "#F3F4F6",
  },
  itemText: {
    fontSize: 14,
    color: "#111827",
  },
  itemTextDestructive: {
    color: "#DC2626",
  },
  checkboxItem: {
    paddingLeft: 32,
  },
  checkboxIndicator: {
    position: "absolute",
    left: 10,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  separator: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 4,
  },
  label: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  shortcut: {
    marginLeft: "auto",
    fontSize: 13,
    color: "#9CA3AF",
  },
});
