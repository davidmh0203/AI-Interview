import React from "react";
import { View, Text, Dimensions } from "react-native";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";

// 화면 크기에 맞게 그래프 크기 조절
const screenWidth = Dimensions.get("window").width;

export function Chart({ type = "line", data, title }) {
  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // 파란색 기본
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
  };

  return (
    <View
      style={{
        padding: 16,
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 16,
      }}
    >
      {title && (
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
          {title}
        </Text>
      )}

      {type === "line" && (
        <LineChart
          data={data}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
        />
      )}

      {type === "bar" && (
        <BarChart
          data={data}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
        />
      )}

      {type === "pie" && (
        <PieChart
          data={data}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor="population" // data 배열 안의 어떤 key를 값으로 쓸지 지정
          backgroundColor="transparent"
          paddingLeft="15"
        />
      )}
    </View>
  );
}
