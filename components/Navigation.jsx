// components/Navigation.jsx (Expo / React Native)
import React from "react";
import { Platform, SafeAreaView, View, Text } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { Button } from "./ui/button.jsx";

/**
 * 공통 상단 네비게이션 바
 * - 메인/리스트 화면에서는 노출하지 않음
 * - 접근성 라벨/테스트 아이디 부여
 * - Android 음영, iOS SafeArea 대응
 * - 우측 액션 슬롯(rightAction) 지원
 */
export function Navigation({
  currentScreen,
  onBack,
  title,
  rightAction = null, // <Button/> 등 ReactNode
  hideOn = ["main", "jobList"],
}) {
  if (hideOn.includes(currentScreen)) return null;

  const screenTitles = {
    input: "면접 준비",
    interview: "모의 면접",
    results: "면접 결과",
    jobList: "채용공고",
    jobDetail: "공고 상세",
    profile: "내 정보 입력",
    coverLetter: "자기소개서 작성",
  };

  const resolvedTitle = title || screenTitles[currentScreen] || "";

  return (
    <SafeAreaView
      className="bg-card"
      style={Platform.select({
        android: { elevation: 4 },
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
        },
      })}
    >
      <View className="flex-row items-center p-4 border-b bg-card">
        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          onPress={onBack}
          className="p-2 h-auto mr-4"
          accessibilityLabel="뒤로 가기"
          testID="nav-back"
        >
          <ChevronLeft size={20} />
        </Button>

        {/* Title */}
        <Text
          className="flex-1 font-semibold text-foreground"
          numberOfLines={1}
          accessibilityRole="header"
          testID="nav-title"
        >
          {resolvedTitle}
        </Text>

        {/* Right action (optional) */}
        <View
          accessibilityElementsHidden={!rightAction}
          importantForAccessibility={
            rightAction ? "yes" : "no-hide-descendants"
          }
        >
          {rightAction}
        </View>
      </View>
    </SafeAreaView>
  );
}
