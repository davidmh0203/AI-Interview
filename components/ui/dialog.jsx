import React from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { X } from "lucide-react-native";

export function Dialog({ visible, onClose, children }) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="bg-background w-11/12 max-w-lg p-6 rounded-lg shadow-lg">
          {children}
          <Pressable
            onPress={onClose}
            className="absolute top-4 right-4 opacity-70"
            accessibilityLabel="닫기"
          >
            <X size={20} color="#333" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export function DialogHeader({ children }) {
  return <View className="mb-4">{children}</View>;
}

export function DialogFooter({ children }) {
  return <View className="mt-4 flex-row justify-end">{children}</View>;
}

export function DialogTitle({ children }) {
  return <Text className="text-lg font-semibold">{children}</Text>;
}

export function DialogDescription({ children }) {
  return <Text className="text-sm text-foreground/60">{children}</Text>;
}
