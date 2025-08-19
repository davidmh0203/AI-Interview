// components/MainScreen.jsx (Expo / React Native)
import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Play,
  Brain,
  TrendingUp,
  Users,
  MessageCircle,
  Briefcase,
  UserRound,
} from "lucide-react-native";
import { Button } from "./ui/button.jsx";
import { Card } from "./ui/card.jsx";

export function MainScreen({
  onStartInterview,
  onNavigateToJobList,
  onNavigateToProfile,
}) {
  return (
    <LinearGradient
      colors={["#eff6ff", "#e0e7ff"]} // from-blue-50 -> to-indigo-100 근사값
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1 p-6"
    >
      {/* 헤더 */}
      <View className="items-center mt-8 mb-12">
        <View
          className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-6"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 6,
          }}
        >
          <Brain size={40} color="#ffffff" />
        </View>

        <Text className="text-3xl font-bold text-foreground mb-4">
          AI 모의면접
        </Text>
        <Text className="text-base text-muted-foreground text-center leading-6 self-center w-4/5">
          AI가 제공하는 맞춤형 면접 연습으로 당신의 꿈의 직장에 한 걸음 더
          가까이
        </Text>
      </View>

      {/* 기능 소개 */}
      <View className="gap-4 mb-12">
        <Card className="p-4 bg-card border-0">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-green-100 rounded-lg items-center justify-center">
              <MessageCircle size={20} color="#16A34A" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-card-foreground">
                실전 면접 연습
              </Text>
              <Text className="text-sm text-muted-foreground">
                직무에 맞춤화된 실제 면접 질문
              </Text>
            </View>
          </View>
        </Card>

        <Card className="p-4 bg-card border-0">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center">
              <TrendingUp size={20} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-card-foreground">
                즉시 피드백
              </Text>
              <Text className="text-sm text-muted-foreground">
                면접 후 즉시 상세한 성과 분석 제공
              </Text>
            </View>
          </View>
        </Card>

        <Card className="p-4 bg-card border-0">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-purple-100 rounded-lg items-center justify-center">
              <Users size={20} color="#7C3AED" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-card-foreground">
                실력 향상
              </Text>
              <Text className="text-sm text-muted-foreground">
                면접 자신감과 스킬을 동시에 키우기
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* 시작 버튼 */}
      <View className="mt-auto space-y-3">
        <Button
          onPress={onNavigateToProfile}
          variant="outline"
          className="w-full h-12 bg-white"
          accessibilityLabel="내 정보 입력"
        >
          <View className="flex-row items-center justify-center">
            <UserRound size={20} color="#111827" />
            <Text className="ml-2 text-base">내 정보 입력</Text>
          </View>
        </Button>

        <Button
          onPress={onNavigateToJobList}
          variant="outline"
          className="w-full h-12 bg-white"
          accessibilityLabel="채용공고 보기"
        >
          <View className="flex-row items-center justify-center">
            <Briefcase size={20} color="#111827" />
            <Text className="ml-2 text-base">채용공고로 모의면접</Text>
          </View>
        </Button>

        <Button
          onPress={onStartInterview}
          className="w-full h-14 bg-primary"
          accessibilityLabel="면접 시작하기"
        >
          <View className="flex-row items-center justify-center">
            <Play size={20} color="#ffffff" />
            <Text className="ml-2 text-lg text-primary-foreground">
              직접 모의면접 시작
            </Text>
          </View>
        </Button>

        <Text className="text-center text-sm text-muted-foreground mt-4">
          약 10-15분 소요됩니다
        </Text>
      </View>
    </LinearGradient>
  );
}
