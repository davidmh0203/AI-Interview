import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
} from "react-native";
import { Search } from "lucide-react-native";

export function CommandDialog({ visible, onClose, commands = [] }) {
  const [query, setQuery] = useState("");

  // 검색 필터
  const filtered = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      {/* Header */}
      <View className="flex-row items-center border-b px-3 py-2 bg-background">
        <Search size={18} color="#9CA3AF" style={{ marginRight: 6 }} />
        <TextInput
          placeholder="명령어 검색..."
          value={query}
          onChangeText={setQuery}
          className="flex-1 h-10 text-base"
        />
      </View>

      {/* 리스트 */}
      <FlatList
        data={filtered}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              item.onSelect?.();
              onClose?.();
            }}
            className="px-4 py-3 border-b border-muted bg-background"
          >
            <Text className="text-foreground text-base">{item.label}</Text>
            {item.shortcut ? (
              <Text className="text-xs text-muted-foreground">
                {item.shortcut}
              </Text>
            ) : null}
          </Pressable>
        )}
        ListEmptyComponent={
          <View className="items-center py-10">
            <Text className="text-muted-foreground">검색 결과가 없습니다</Text>
          </View>
        }
      />
    </Modal>
  );
}
