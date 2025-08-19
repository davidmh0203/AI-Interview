// components/JobDetailScreen.jsx (Expo / React Native)
import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text } from "react-native";
import { ExternalLink, ChevronLeft } from "lucide-react-native";
import { Button } from "./ui/button.jsx";
import { Badge } from "./ui/badge.jsx";
import { Card } from "./ui/card.jsx";

export function JobDetailScreen({ selectedJob, onBack, onStartInterview }) {
  const [isLoading, setIsLoading] = useState(false);

  if (!selectedJob) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <View className="items-center">
          <Text className="text-lg font-semibold mb-2">
            공고를 찾을 수 없습니다
          </Text>
          <Button onPress={onBack} accessibilityLabel="목록으로 돌아가기">
            목록으로 돌아가기
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // 더미 상세 데이터
  const jobDetail = {
    ...selectedJob,
    description: {
      responsibilities: [
        "React를 활용한 웹 애플리케이션 개발",
        "사용자 인터페이스 및 사용자 경험 최적화",
        "백엔드 API와의 연동 및 데이터 처리",
        "코드 리뷰 및 품질 관리 참여",
        "크로스 브라우저 호환성 확보",
      ],
      requirements: {
        essential: [
          "React 2년 이상 실무 경험",
          "JavaScript (ES6+) 능숙",
          "HTML5, CSS3 활용 가능",
          "Git 버전 관리 경험",
        ],
        preferred: [
          "TypeScript 사용 경험",
          "Next.js 프레임워크 경험",
          "상태관리 라이브러리 (Redux, Zustand 등) 사용 경험",
          "웹 접근성 및 성능 최적화 경험",
        ],
      },
      techStack: [
        "React",
        "JavaScript",
        "TypeScript",
        "Next.js",
        "Tailwind CSS",
        "Git",
      ],
      process: [
        { step: "서류", status: "active" },
        { step: "코딩테스트", status: "inactive" },
        { step: "1차 면접", status: "inactive" },
        { step: "최종 면접", status: "inactive" },
      ],
      workConditions: {
        salary: "협의 후 결정",
        workLocation: "경기 고양시 일산동구",
        employmentType: "정규직",
        workHours: "09:00 ~ 18:00 (주 5일)",
      },
    },
  };

  const handleStartInterview = () => {
    setIsLoading(true);
    setTimeout(() => {
      onStartInterview?.(selectedJob);
      setIsLoading(false);
    }, 1000);
  };

  // 스켈레톤 로딩 컴포넌트
  const SkeletonSection = () => (
    <Card className="p-6 animate-pulse">
      <View className="gap-4">
        <View className="h-6 bg-muted rounded w-1/4" />
        <View className="gap-2">
          <View className="h-4 bg-muted rounded" />
          <View className="h-4 bg-muted rounded w-5/6" />
          <View className="h-4 bg-muted rounded w-4/6" />
        </View>
      </View>
    </Card>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        {/* 헤더 */}
        <View className="border-b bg-card">
          <View className="flex-row items-center p-4">
            <Button
              variant="ghost"
              size="sm"
              onPress={onBack}
              accessibilityLabel="뒤로 가기"
              className="p-2 h-auto mr-4"
            >
              <ChevronLeft size={20} />
            </Button>
            <Text className="flex-1 font-semibold text-foreground">
              공고 상세
            </Text>
          </View>
        </View>

        {/* 콘텐츠 */}
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View className="gap-6">
            <SkeletonSection />
            <SkeletonSection />
            <SkeletonSection />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* sticky header를 ScrollView의 첫 child로 두고 stickyHeaderIndices 사용 */}
      <ScrollView
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header (sticky) */}
        <View className="bg-card border-b shadow-sm">
          <View className="flex-row items-center p-4">
            <Button
              variant="ghost"
              size="sm"
              onPress={onBack}
              accessibilityLabel="뒤로 가기"
              className="p-2 h-auto mr-4"
            >
              <ChevronLeft size={20} />
            </Button>
            <Text className="flex-1 font-semibold text-foreground">
              공고 상세
            </Text>
          </View>
        </View>

        {/* 본문 */}
        <View style={{ maxWidth: 480, alignSelf: "center", width: "100%" }}>
          {/* Header 섹션 */}
          <View className="p-6 bg-card border-b">
            <View className="gap-4">
              {/* 공고명 + 원문 보기 */}
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-4">
                  <Text className="text-xl font-bold text-foreground mb-2">
                    {jobDetail.title}
                  </Text>
                  <Text className="text-lg text-foreground/80 mb-4">
                    {jobDetail.company}
                  </Text>
                </View>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  accessibilityLabel={`원문 보기: ${jobDetail.company} 공고`}
                  onPress={() => {
                    // 선택적으로 selectedJob.url이 있다면 WebBrowser.openBrowserAsync(url) 사용 가능
                    // import * as WebBrowser from 'expo-web-browser';
                  }}
                >
                  <View className="flex-row items-center gap-2">
                    <ExternalLink size={16} />
                    <Text>원문 보기</Text>
                  </View>
                </Button>
              </View>

              {/* 정보 태그 */}
              <View className="flex-row flex-wrap gap-2">
                {!!jobDetail.location && (
                  <Badge variant="secondary">{jobDetail.location}</Badge>
                )}
                {!!jobDetail.experience && (
                  <Badge variant="secondary">{jobDetail.experience}</Badge>
                )}
                {!!jobDetail.employmentType && (
                  <Badge variant="secondary">{jobDetail.employmentType}</Badge>
                )}
              </View>
            </View>
          </View>

          {/* 모집요강 */}
          <Card className="m-4 p-6">
            <Text className="text-lg font-semibold mb-4">모집요강</Text>

            {/* 담당업무 */}
            <View className="mb-6">
              <Text className="font-medium text-foreground mb-3">담당업무</Text>
              <View className="gap-2">
                {jobDetail.description.responsibilities.map((item, idx) => (
                  <View key={idx} className="flex-row items-start gap-2">
                    <View className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2" />
                    <Text className="text-foreground/80">{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 자격요건 */}
            <View className="mb-6">
              <Text className="font-medium text-foreground mb-3">자격요건</Text>

              {/* 필수 */}
              <View className="mb-4">
                <Text
                  className="text-sm font-medium"
                  style={{ color: "#2563EB", marginBottom: 8 }}
                >
                  필수
                </Text>
                <View className="gap-2">
                  {jobDetail.description.requirements.essential.map(
                    (item, idx) => (
                      <View key={idx} className="flex-row items-start gap-2">
                        <View
                          className="w-1.5 h-1.5 rounded-full mt-2"
                          style={{ backgroundColor: "#60A5FA" }}
                        />
                        <Text className="text-foreground/80">{item}</Text>
                      </View>
                    )
                  )}
                </View>
              </View>

              {/* 우대 */}
              <View>
                <Text
                  className="text-sm font-medium"
                  style={{ color: "#16A34A", marginBottom: 8 }}
                >
                  우대
                </Text>
                <View className="gap-2">
                  {jobDetail.description.requirements.preferred.map(
                    (item, idx) => (
                      <View key={idx} className="flex-row items-start gap-2">
                        <View
                          className="w-1.5 h-1.5 rounded-full mt-2"
                          style={{ backgroundColor: "#34D399" }}
                        />
                        <Text className="text-foreground/80">{item}</Text>
                      </View>
                    )
                  )}
                </View>
              </View>
            </View>

            {/* 기술스택 */}
            <View>
              <Text className="font-medium text-foreground mb-3">기술스택</Text>
              <View className="flex-row flex-wrap gap-2">
                {jobDetail.description.techStack.map((tech, idx) => (
                  <Badge key={idx} variant="outline" className="text-sm">
                    {tech}
                  </Badge>
                ))}
              </View>
            </View>
          </Card>

          {/* 전형절차 */}
          <Card className="m-4 p-6">
            <Text className="text-lg font-semibold mb-4">전형절차</Text>

            {/* 수평 타임라인 */}
            <View className="relative flex-row items-center justify-between">
              {/* 연결선 (회색) */}
              <View className="absolute left-6 right-6 top-6 h-0.5 bg-muted" />
              {jobDetail.description.process.map((item, index) => (
                <View key={index} className="items-center">
                  <View
                    className={`w-12 h-12 rounded-full items-center justify-center text-sm font-medium ${
                      item.status === "active" ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <Text
                      className={`${
                        item.status === "active"
                          ? "text-primary-foreground"
                          : "text-foreground/60"
                      }`}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <Text className="mt-2 text-sm text-foreground text-center">
                    {item.step}
                  </Text>
                </View>
              ))}
            </View>
          </Card>

          {/* 근무조건 */}
          <Card className="m-4 p-6">
            <Text className="text-lg font-semibold mb-4">근무조건</Text>

            <View className="gap-3">
              <View className="flex-row">
                <Text className="w-20 text-sm font-medium text-foreground/60">
                  급여
                </Text>
                <Text className="text-sm text-foreground">
                  {jobDetail.description.workConditions.salary}
                </Text>
              </View>
              <View className="flex-row">
                <Text className="w-20 text-sm font-medium text-foreground/60">
                  근무지
                </Text>
                <Text className="text-sm text-foreground">
                  {jobDetail.description.workConditions.workLocation}
                </Text>
              </View>
              <View className="flex-row">
                <Text className="w-20 text-sm font-medium text-foreground/60">
                  고용형태
                </Text>
                <Text className="text-sm text-foreground">
                  {jobDetail.description.workConditions.employmentType}
                </Text>
              </View>
              <View className="flex-row">
                <Text className="w-20 text-sm font-medium text-foreground/60">
                  근무시간
                </Text>
                <Text className="text-sm text-foreground">
                  {jobDetail.description.workConditions.workHours}
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* CTA 고정 바 */}
      <View className="absolute bottom-0 left-0 right-0 bg-card border-t p-4">
        <View style={{ maxWidth: 480, alignSelf: "center", width: "100%" }}>
          <View className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-3">
            <Text className="text-sm text-foreground text-center">
              다음 단계에서 자기소개서를 작성하고 면접을 진행합니다
            </Text>
          </View>
          <Button
            className="w-full h-12"
            onPress={handleStartInterview}
            disabled={isLoading}
            accessibilityLabel="자기소개서 작성하기"
          >
            {isLoading ? "준비 중..." : "자기소개서 작성하기"}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
