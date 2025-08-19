// components/Navigation.jsx (Expo / React Native)
import React from "react";
import { SafeAreaView, View, Text } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { Button } from "./ui/button.jsx";

export function Navigation({ currentScreen, onBack, title }) {
  // 메인/리스트에서는 상단바 숨김 (원 코드와 동일)
  if (currentScreen === "main" || currentScreen === "jobList") return null;

  const screenTitles = {
    input: "면접 준비",
    interview: "모의 면접",
    results: "면접 결과",
    jobList: "채용공고",
    jobDetail: "공고 상세",
    profile: "내 정보 입력",
    coverLetter: "자기소개서 작성",
  };

  return (
    <SafeAreaView className="bg-card">
      <View className="flex-row items-center p-4 border-b bg-card shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onPress={onBack}
          className="p-2 h-auto mr-4"
          accessibilityLabel="뒤로 가기"
        >
          <ChevronLeft size={20} />
        </Button>
        <Text className="flex-1 font-semibold text-foreground">
          {title || screenTitles[currentScreen]}
        </Text>
      </View>
    </SafeAreaView>
  );
}
