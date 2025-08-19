// components/accordion.jsx  (Expo / React Native + NativeWind)
import React, { createContext, useContext, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { ChevronDown } from "lucide-react-native";

// Android 레이아웃 애니메이션 활성화
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AccordionCtx = createContext(null);

/**
 * props:
 * - type: 'single' | 'multiple'  (Radix와 동일 개념)
 * - collapsible: boolean         (single일 때 같은 트리거로 닫기 허용)
 * - defaultValue / value / onValueChange (제어/비제어 모두 지원)
 */
export function Accordion({
  type = "single",
  collapsible = true,
  defaultValue,
  value,
  onValueChange,
  className = "",
  children,
}) {
  const controlled = value !== undefined;

  const [inner, setInner] = useState(() => {
    if (type === "multiple") {
      return Array.isArray(defaultValue) ? defaultValue : [];
    }
    return defaultValue ? [defaultValue] : [];
  });

  const openValues = controlled
    ? type === "multiple"
      ? Array.isArray(value)
        ? value
        : []
      : value
      ? [value]
      : []
    : inner;

  const setOpenValues = (next) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (controlled) {
      if (type === "multiple") onValueChange?.(next);
      else onValueChange?.(next[0]);
    } else {
      setInner(next);
    }
  };

  const toggle = (val) => {
    const isOpen = openValues.includes(val);
    if (type === "multiple") {
      setOpenValues(
        isOpen ? openValues.filter((v) => v !== val) : [...openValues, val]
      );
    } else {
      if (isOpen) {
        if (collapsible) setOpenValues([]);
      } else {
        setOpenValues([val]);
      }
    }
  };

  const ctx = useMemo(
    () => ({ type, collapsible, openValues, toggle }),
    [type, collapsible, openValues]
  );

  return (
    <View className={`w-full ${className}`}>
      <AccordionCtx.Provider value={ctx}>{children}</AccordionCtx.Provider>
    </View>
  );
}

export function AccordionItem({ value, className = "", children }) {
  // value는 Trigger/Content가 사용
  return (
    <View className={`border-b last:border-b-0 ${className}`}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { __accordionValue: value })
          : child
      )}
    </View>
  );
}

export function AccordionTrigger({
  className = "",
  children,
  __accordionValue,
  ...props
}) {
  const ctx = useContext(AccordionCtx);
  const isOpen = ctx.openValues.includes(__accordionValue);

  return (
    <View className="flex">
      <Pressable
        accessibilityRole="button"
        onPress={() => ctx.toggle(__accordionValue)}
        className={`flex-1 flex-row items-start justify-between gap-4 rounded-md py-4 px-1
                    outline-none active:opacity-80 ${className}`}
        {...props}
      >
        {typeof children === "string" ? (
          <Text className="text-sm font-medium text-foreground">
            {children}
          </Text>
        ) : (
          children
        )}
        <ChevronDown
          size={16}
          color="#717182"
          style={{
            transform: [{ rotate: isOpen ? "180deg" : "0deg" }],
            marginTop: 2,
          }}
        />
      </Pressable>
    </View>
  );
}

export function AccordionContent({
  className = "",
  children,
  __accordionValue,
  ...props
}) {
  const ctx = useContext(AccordionCtx);
  const isOpen = ctx.openValues.includes(__accordionValue);

  if (!isOpen) return null;

  return (
    <View className={`pb-4 pt-0 ${className}`} {...props}>
      {typeof children === "string" ? (
        <Text className="text-sm text-foreground">{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}
