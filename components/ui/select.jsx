import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

/**
 * Select 컴포넌트
 * - React Native 전용 드롭다운
 * - props:
 *   - label: 라벨 텍스트
 *   - selectedValue: 현재 선택된 값
 *   - onValueChange: 값 변경 핸들러
 *   - items: [{ label: "서울", value: "서울" }, ...]
 */
export function Select({ label, selectedValue, onValueChange, items = [] }) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
        >
          {items.map((item) => (
            <Picker.Item
              key={item.value}
              label={item.label}
              value={item.value}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 6, color: "#333" },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: { height: 48, width: "100%" },
});
