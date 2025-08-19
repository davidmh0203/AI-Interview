// ui/calendar.jsx (React Native용)

import React from "react";
import { View, StyleSheet } from "react-native";
import { Calendar as RNCalendar } from "react-native-calendars";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

export function Calendar({ markedDates = {}, onDayPress, initialDate }) {
  return (
    <View style={styles.container}>
      <RNCalendar
        initialDate={initialDate}
        markedDates={markedDates}
        onDayPress={onDayPress}
        // 화살표 아이콘 교체
        renderArrow={(direction) =>
          direction === "left" ? (
            <ChevronLeft size={20} color="#000" />
          ) : (
            <ChevronRight size={20} color="#000" />
          )
        }
        theme={{
          selectedDayBackgroundColor: "#3b82f6",
          selectedDayTextColor: "#ffffff",
          todayTextColor: "#3b82f6",
          arrowColor: "#3b82f6",
          monthTextColor: "#111827",
          textMonthFontWeight: "bold",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: "hidden",
  },
});
