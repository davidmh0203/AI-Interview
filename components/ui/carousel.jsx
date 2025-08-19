import React, { useRef } from "react";
import {
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Text,
} from "react-native";
import { ArrowLeft, ArrowRight } from "lucide-react-native";

const { width } = Dimensions.get("window");

export function Carousel({ data = [], renderItem }) {
  const flatListRef = useRef(null);
  const currentIndex = useRef(0);

  const scrollToIndex = (index) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
      currentIndex.current = index;
    }
  };

  const scrollPrev = () => {
    if (currentIndex.current > 0) {
      scrollToIndex(currentIndex.current - 1);
    }
  };

  const scrollNext = () => {
    if (currentIndex.current < data.length - 1) {
      scrollToIndex(currentIndex.current + 1);
    }
  };

  return (
    <View style={{ position: "relative" }}>
      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={(_, idx) => idx.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View
            style={{ width, alignItems: "center", justifyContent: "center" }}
          >
            {renderItem ? renderItem(item) : <Text>{item}</Text>}
          </View>
        )}
      />

      {/* Prev Button */}
      <TouchableOpacity
        onPress={scrollPrev}
        style={{
          position: "absolute",
          top: "50%",
          left: 10,
          transform: [{ translateY: -20 }],
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: 5,
          elevation: 3,
        }}
      >
        <ArrowLeft size={20} />
      </TouchableOpacity>

      {/* Next Button */}
      <TouchableOpacity
        onPress={scrollNext}
        style={{
          position: "absolute",
          top: "50%",
          right: 10,
          transform: [{ translateY: -20 }],
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: 5,
          elevation: 3,
        }}
      >
        <ArrowRight size={20} />
      </TouchableOpacity>
    </View>
  );
}
