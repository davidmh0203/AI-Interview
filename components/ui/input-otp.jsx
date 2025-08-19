import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import {
  View,
  TextInput,
  Pressable,
  Text,
  StyleSheet,
  Animated,
} from "react-native";

// --- 1. Context 생성 ---
// OTP 값과 포커스 상태를 하위 컴포넌트에 공유
const InputOTPContext = createContext(null);

// --- 2. Root 컴포넌트 ---
export function InputOTP({ maxLength, value, onChange, children }) {
  const [internalValue, setInternalValue] = useState(value || "");
  const [isFocused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const finalValue = value !== undefined ? value : internalValue;

  const handleChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, "");
    if (value === undefined) {
      setInternalValue(numericText);
    }
    onChange?.(numericText);
  };

  // 사용자가 슬롯을 누르면 숨겨진 TextInput에 포커스를 줍니다.
  const handlePress = () => {
    inputRef.current?.focus();
  };

  const contextValue = {
    value: finalValue,
    isFocused,
    maxLength,
  };

  return (
    <InputOTPContext.Provider value={contextValue}>
      <Pressable onPress={handlePress}>
        <View pointerEvents="none">{children}</View>
      </Pressable>
      <TextInput
        ref={inputRef}
        value={finalValue}
        onChangeText={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        maxLength={maxLength}
        keyboardType="number-pad"
        style={styles.hiddenInput} // 화면에 보이지 않도록 숨김
      />
    </InputOTPContext.Provider>
  );
}

// --- 3. Group / Separator ---
export function InputOTPGroup({ style, children }) {
  return <View style={[styles.group, style]}>{children}</View>;
}

export function InputOTPSeparator() {
  return (
    <View style={styles.separatorContainer}>
      <Text style={styles.separatorText}>-</Text>
    </View>
  );
}

// --- 4. Slot (개별 입력 칸) ---
export function InputOTPSlot({ index, style }) {
  const { value, isFocused } = useContext(InputOTPContext);
  const char = value[index];
  const isActive = value.length === index && isFocused;

  // 깜빡이는 커서 애니메이션
  const caretAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(caretAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(caretAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      caretAnim.setValue(0);
    }
  }, [isActive]);

  return (
    <View style={[styles.slot, isActive && styles.slotActive, style]}>
      <Text style={styles.slotText}>{char}</Text>
      {isActive && (
        <Animated.View style={[styles.fakeCaret, { opacity: caretAnim }]} />
      )}
    </View>
  );
}

// --- 5. 스타일시트 ---
const styles = StyleSheet.create({
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  group: {
    flexDirection: "row",
    alignItems: "center",
  },
  slot: {
    height: 48,
    width: 44,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB", // border-gray-300
    borderRadius: 6,
    marginHorizontal: 4,
  },
  slotActive: {
    borderColor: "#3B82F6", // border-blue-500
    borderWidth: 2,
  },
  slotText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separatorContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  separatorText: {
    fontSize: 20,
    color: "#6B7280", // text-gray-500
  },
  fakeCaret: {
    position: "absolute",
    width: 1.5,
    height: 22,
    backgroundColor: "#3B82F6", // bg-blue-500
    borderRadius: 1,
  },
});
