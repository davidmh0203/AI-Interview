// components/InterviewScreen.jsx (Expo / React Native)
import React, { useState, useEffect } from "react";
import { SafeAreaView, ScrollView, View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Mic,
  Camera,
  Play,
  Pause,
  SkipForward,
  ArrowRight,
  Clock,
  CheckCircle,
} from "lucide-react-native";
import { Button } from "./ui/button.jsx";
import { Card } from "./ui/card.jsx";

// 간단 ProgressBar 대체 (필요시 ./ui/progress.jsx로 교체 가능)
const ProgressBar = ({ value = 0 }) => {
  const v = Math.max(0, Math.min(100, value));
  return (
    <View className="h-2 w-full bg-muted rounded-full overflow-hidden">
      <View className="h-2 bg-primary" style={{ width: `${v}%` }} />
    </View>
  );
};

// 간단 Badge 대체 (필요시 ./ui/badge.jsx로 교체 가능)
const Chip = ({ variant = "secondary", children }) => {
  const base = "px-2 py-1 rounded-md";
  const styles =
    variant === "secondary"
      ? `${base} bg-secondary`
      : variant === "outline"
      ? `${base} border border-border`
      : base;
  return (
    <View className={styles}>
      <Text className="text-xs text-foreground">{children}</Text>
    </View>
  );
};

const SAMPLE_QUESTIONS = [
  "자기소개를 해주세요.",
  "이 직무에 지원하게 된 동기가 무엇인가요?",
  "본인의 가장 큰 강점과 이것이 업무에 어떻게 도움이 될지 설명해주세요.",
  "지금까지 진행했던 프로젝트 중 가장 도전적이었던 것과 어떻게 해결했는지 말씀해주세요.",
  "5년 후 본인의 모습을 어떻게 그리고 계신가요?",
  "저희 회사에 궁금한 점이 있으시다면 말씀해주세요.",
];

export function InterviewScreen({ jobData, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [hasRecorded, setHasRecorded] = useState(false);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setHasRecorded(false); // 시작 시 false로 두고, 멈출 때 true로 바꿔 정확도 ↑
  };

  const stopRecording = () => {
    setIsRecording(false);
    setHasRecorded(true);
    // 모의 답변 저장
    setAnswers((prev) => [
      ...prev,
      {
        question: SAMPLE_QUESTIONS[currentQuestion],
        duration: recordingTime,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const nextQuestion = () => {
    if (currentQuestion < SAMPLE_QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setRecordingTime(0);
      setHasRecorded(false);
    } else {
      // 면접 완료
      onComplete?.({ answers, jobData });
    }
  };

  const skipQuestion = () => {
    setAnswers((prev) => [
      ...prev,
      {
        question: SAMPLE_QUESTIONS[currentQuestion],
        skipped: true,
        timestamp: new Date().toISOString(),
      },
    ]);
    nextQuestion();
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = ((currentQuestion + 1) / SAMPLE_QUESTIONS.length) * 100;
  const isLastQuestion = currentQuestion === SAMPLE_QUESTIONS.length - 1;
  const canProceed = answers.length > currentQuestion || hasRecorded;

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={["#eff6ff", "#e0e7ff"]} // from-blue-50 → to-indigo-100 근사
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 p-6"
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={{ maxWidth: 480, alignSelf: "center", width: "100%" }}>
            {/* 진행률 */}
            <View className="mb-8">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">
                  질문 {currentQuestion + 1} / {SAMPLE_QUESTIONS.length}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {Math.round(progress)}% 완료
                </Text>
              </View>
              <View className="mt-2">
                <ProgressBar value={progress} />
              </View>
            </View>

            {/* 질문 카드 */}
            <Card className="p-6 mb-8 bg-card">
              <View className="flex-row items-center gap-2 mb-4">
                <Chip variant="secondary">Q{currentQuestion + 1}</Chip>
                {jobData?.company ? (
                  <Chip variant="outline">{jobData.company}</Chip>
                ) : null}
              </View>

              <Text className="text-lg font-semibold text-foreground mb-4">
                {SAMPLE_QUESTIONS[currentQuestion]}
              </Text>

              <Text className="text-sm text-muted-foreground">
                충분히 생각한 후 답변을 녹화해주세요.
              </Text>
              {jobData?.jobTitle ? (
                <Text className="text-sm text-muted-foreground mt-2">
                  지원 직무: {jobData.jobTitle}
                </Text>
              ) : null}
            </Card>

            {/* 녹화 영역 (모의 UI) */}
            <Card className="p-6 mb-6 bg-card">
              <View className="items-center">
                {isRecording ? (
                  <View className="w-full">
                    <View className="items-center mb-4">
                      <View className="w-24 h-24 bg-red-100 rounded-full items-center justify-center">
                        <View className="w-12 h-12 bg-red-500 rounded-full items-center justify-center">
                          <Pause size={24} color="#fff" />
                        </View>
                      </View>
                    </View>

                    <View className="items-center">
                      <Text
                        className="text-lg font-semibold"
                        style={{ color: "#DC2626" }}
                      >
                        녹화 중...
                      </Text>
                      <View className="flex-row items-center gap-2 mt-2">
                        <Clock size={16} color="#717182" />
                        <Text className="text-2xl font-bold text-foreground">
                          {formatTime(recordingTime)}
                        </Text>
                      </View>
                    </View>

                    <Button
                      onPress={stopRecording}
                      variant="destructive"
                      className="w-full mt-4"
                      accessibilityLabel="녹화 중지"
                    >
                      <View className="flex-row items-center justify-center">
                        <Pause size={18} color="#fff" />
                        <Text className="ml-2 text-base text-white">
                          녹화 중지
                        </Text>
                      </View>
                    </Button>
                  </View>
                ) : (
                  <View className="w-full">
                    <View className="items-center mb-4">
                      <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center">
                        <View className="w-12 h-12 bg-primary rounded-full items-center justify-center">
                          {hasRecorded ? (
                            <CheckCircle size={24} color="#fff" />
                          ) : (
                            <Mic size={24} color="#fff" />
                          )}
                        </View>
                      </View>
                    </View>

                    <View className="items-center">
                      <Text className="text-muted-foreground mb-2">
                        {hasRecorded
                          ? "답변이 녹화되었습니다"
                          : "답변 녹화 준비 완료"}
                      </Text>
                      <View className="flex-row items-center gap-4">
                        <View className="flex-row items-center gap-1">
                          <Mic size={16} color="#111" />
                          <Text>오디오</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <Camera size={16} color="#111" />
                          <Text>비디오</Text>
                        </View>
                      </View>
                    </View>

                    <Button
                      onPress={startRecording}
                      className="w-full mt-4 bg-primary"
                      disabled={isRecording}
                      accessibilityLabel={
                        hasRecorded ? "다시 녹화하기" : "녹화 시작"
                      }
                    >
                      <View className="flex-row items-center justify-center">
                        <Play size={18} color="#fff" />
                        <Text className="ml-2 text-base text-primary-foreground">
                          {hasRecorded ? "다시 녹화" : "녹화 시작"}
                        </Text>
                      </View>
                    </Button>
                  </View>
                )}
              </View>
            </Card>

            {/* 액션 버튼 */}
            {!isRecording ? (
              <View className="gap-3">
                <Button
                  onPress={nextQuestion}
                  className="w-full h-12"
                  disabled={!canProceed}
                  accessibilityLabel={
                    isLastQuestion ? "면접 완료하기" : "다음 질문으로"
                  }
                >
                  <View className="flex-row items-center justify-center">
                    <Text className="text-base text-primary-foreground">
                      {isLastQuestion ? "면접 완료하기" : "다음 질문"}
                    </Text>
                    <ArrowRight
                      size={16}
                      color="#fff"
                      style={{ marginLeft: 8 }}
                    />
                  </View>
                </Button>

                <Button
                  onPress={skipQuestion}
                  variant="outline"
                  className="w-full"
                  accessibilityLabel="이 질문 건너뛰기"
                >
                  <View className="flex-row items-center justify-center">
                    <SkipForward size={16} />
                    <Text className="ml-2 text-base">질문 건너뛰기</Text>
                  </View>
                </Button>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
