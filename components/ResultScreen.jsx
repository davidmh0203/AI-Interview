// components/ResultScreen.jsx (Expo / React Native)
import React from "react";
import { SafeAreaView, ScrollView, View, Text, Share } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Trophy,
  Target,
  Clock,
  MessageSquare,
  RotateCcw,
  Share as ShareIcon,
  TrendingUp,
  Star,
} from "lucide-react-native";
import Svg, {
  G,
  Circle,
  Line,
  Polygon,
  Text as SvgText,
} from "react-native-svg";
import { Button } from "./ui/button.jsx";
import { Card } from "./ui/card.jsx";
import { Badge } from "./ui/badge.jsx";
import { Progress } from "./ui/progress.jsx";

// 모의 성과 데이터
const performanceData = [
  { skill: "의사소통", score: 85 },
  { skill: "전문성", score: 78 },
  { skill: "문제해결", score: 82 },
  { skill: "리더십", score: 75 },
  { skill: "자신감", score: 88 },
  { skill: "열정", score: 90 },
];

const feedback = [
  {
    category: "강점",
    icon: TrendingUp,
    color: "#16A34A",
    bgColor: "#ECFDF5",
    items: [
      "명확하고 자신감 있는 의사소통 스타일",
      "과거 경험을 잘 활용한 구체적인 답변",
      "직무에 대한 진정성 있는 열정 표현",
    ],
  },
  {
    category: "개선점",
    icon: Target,
    color: "#EA580C",
    bgColor: "#FFF7ED",
    items: [
      "기술적 세부사항을 더 구체적으로 설명할 필요",
      "STAR 기법을 활용한 답변 구조화 권장",
      "음성 채움어 사용 빈도 줄이기",
    ],
  },
  {
    category: "제안사항",
    icon: MessageSquare,
    color: "#2563EB",
    bgColor: "#EFF6FF",
    items: [
      "기술 개념을 쉽게 설명하는 연습하기",
      "2-3개의 상세한 프로젝트 사례 미리 준비",
      "지원 회사의 최근 동향 사전 조사",
    ],
  },
];

// 간단 레이더 차트 (react-native-svg)
const RadarChart = ({ data, size = 240, max = 100, levels = 4 }) => {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 24; // padding
  const N = data.length;

  const angleFor = (i) => (Math.PI * 2 * i) / N - Math.PI / 2;
  const toPoint = (i, valueRatio) => {
    const a = angleFor(i);
    const r = radius * valueRatio;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  // 폴리곤 점들
  const points = data
    .map((d, i) => {
      const v = Math.max(0, Math.min(max, d.score));
      const p = toPoint(i, v / max);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <Svg width="100%" height={size} viewBox={`0 0 ${size} ${size}`}>
      <G>
        {/* 그리드 원 (levels) */}
        {Array.from({ length: levels }).map((_, idx) => {
          const r = radius * ((idx + 1) / levels);
          return (
            <Circle
              key={idx}
              cx={cx}
              cy={cy}
              r={r}
              stroke="#E5E7EB"
              strokeWidth={1}
              fill="none"
            />
          );
        })}

        {/* 축선 + 라벨 */}
        {data.map((d, i) => {
          const p = toPoint(i, 1);
          const labelP = toPoint(i, 1.12);
          return (
            <G key={i}>
              <Line
                x1={cx}
                y1={cy}
                x2={p.x}
                y2={p.y}
                stroke="#E5E7EB"
                strokeWidth={1}
              />
              <SvgText
                x={labelP.x}
                y={labelP.y}
                fontSize="10"
                fill="#6B7280"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {d.skill}
              </SvgText>
            </G>
          );
        })}

        {/* 데이터 폴리곤 */}
        <Polygon
          points={points}
          fill="#3B82F6"
          fillOpacity={0.2}
          stroke="#3B82F6"
          strokeWidth={2}
        />
      </G>
    </Svg>
  );
};

export function ResultScreen({ interviewData, onRestart }) {
  const overallScore = Math.round(
    performanceData.reduce((acc, item) => acc + item.score, 0) /
      performanceData.length
  );
  const answeredQuestions =
    interviewData?.answers?.filter((a) => !a.skipped).length || 4;
  const totalTime =
    interviewData?.answers?.reduce((acc, a) => acc + (a.duration || 120), 0) ||
    480;

  const getScoreColor = (score) => {
    if (score >= 85) return "#16A34A"; // green-600
    if (score >= 70) return "#2563EB"; // blue-600
    if (score >= 60) return "#EA580C"; // orange-600
    return "#DC2626"; // red-600
  };

  const getScoreBadge = (score) => {
    if (score >= 85) return { text: "우수", className: "bg-green-600" };
    if (score >= 70) return { text: "양호", className: "bg-blue-600" };
    if (score >= 60) return { text: "보통", className: "bg-orange-600" };
    return { text: "개선필요", className: "bg-red-600" };
  };

  const scoreBadge = getScoreBadge(overallScore);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `AI 모의면접 결과\n총점: ${overallScore}점\n답변 완료: ${answeredQuestions}개\n소요 시간: ${Math.round(
          totalTime / 60
        )}분`,
      });
    } catch (e) {
      // 공유 취소/오류 무시
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-muted/30">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View
          style={{ maxWidth: 480, alignSelf: "center", width: "100%" }}
          className="gap-6"
        >
          {/* 전체 점수 */}
          <Card className="p-0 overflow-hidden">
            <LinearGradient
              colors={["#030213", "#7C3AED"]} // primary → purple 계열
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-6 items-center"
            >
              <Trophy size={48} color="#fff" />
              <Text className="text-2xl font-bold text-white mt-4 mb-2">
                면접 완료!
              </Text>
              <Text className="text-4xl font-bold text-white mb-2">
                {overallScore}점
              </Text>
              <Badge className={`${scoreBadge.className} text-white border-0`}>
                {scoreBadge.text}
              </Badge>
            </LinearGradient>
          </Card>

          {/* 요약 통계 */}
          <View className="flex-row gap-4">
            <Card className="p-4 items-center flex-1">
              <MessageSquare size={24} color="#030213" />
              <Text className="font-semibold mt-2">{answeredQuestions}개</Text>
              <Text className="text-sm text-foreground/60">답변 완료</Text>
            </Card>

            <Card className="p-4 items-center flex-1">
              <Clock size={24} color="#16A34A" />
              <Text className="font-semibold mt-2">
                {Math.round(totalTime / 60)}분
              </Text>
              <Text className="text-sm text-foreground/60">소요 시간</Text>
            </Card>

            <Card className="p-4 items-center flex-1">
              <Star size={24} color="#7C3AED" />
              <Text className="font-semibold mt-2">
                {performanceData.length}개
              </Text>
              <Text className="text-sm text-foreground/60">평가 항목</Text>
            </Card>
          </View>

          {/* 성과 레이더 차트 + 항목별 점수 */}
          <Card className="p-6">
            <Text className="font-semibold text-center mb-4">
              세부 성과 분석
            </Text>

            <View className="h-64 mb-4">
              <RadarChart data={performanceData} size={240} />
            </View>

            <View className="gap-3">
              {performanceData.map((item, idx) => (
                <View
                  key={idx}
                  className="flex-row items-center justify-between"
                >
                  <Text className="text-sm font-medium">{item.skill}</Text>
                  <View className="flex-row items-center gap-2">
                    <Progress value={item.score} className="w-16 h-2" />
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: getScoreColor(item.score) }}
                    >
                      {item.score}점
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* 상세 피드백 */}
          {feedback.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index} className="p-6">
                <View className="flex-row items-center gap-3 mb-3">
                  <View
                    style={{ backgroundColor: section.bgColor }}
                    className="p-2 rounded-lg"
                  >
                    <Icon size={20} color={section.color} />
                  </View>
                  <Text className="font-semibold">{section.category}</Text>
                </View>

                <View className="gap-2">
                  {section.items.map((item, i) => (
                    <View key={i} className="flex-row items-start gap-2">
                      <View
                        className="w-1.5 h-1.5 rounded-full mt-2"
                        style={{ backgroundColor: section.color }}
                      />
                      <Text className="text-sm text-foreground/60">{item}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            );
          })}

          {/* 액션 버튼 */}
          <View className="gap-3 pt-2">
            <Button
              onPress={onRestart}
              className="w-full h-12 bg-primary"
              accessibilityLabel="다시 면접 연습하기"
            >
              <View className="flex-row items-center justify-center">
                <RotateCcw size={18} color="#fff" />
                <Text className="ml-2 text-white">다시 면접 연습하기</Text>
              </View>
            </Button>

            <Button
              variant="outline"
              className="w-full"
              accessibilityLabel="결과 공유하기"
              onPress={handleShare}
            >
              <View className="flex-row items-center justify-center">
                <ShareIcon size={18} />
                <Text className="ml-2">결과 공유하기</Text>
              </View>
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
