// components/InterviewScreen.jsx (Expo / React Native)
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Alert,
  Platform,
} from "react-native";
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
  RotateCcw,
} from "lucide-react-native";
import { Button } from "./ui/button.jsx";
import { Card } from "./ui/card.jsx";

// ===== UX 상수 (UI 카피와 동기화) =====
const PREP_SECONDS = 5; // 녹화 전 준비 시간
const MIN_SECONDS = 15; // 최소 답변 길이 (가이드)
const MAX_SECONDS = 180; // 최대 답변 길이, 초과 시 자동 종료

// 진행바 (간단 버전)
const ProgressBar = ({ value = 0 }) => {
  const v = Math.max(0, Math.min(100, value));
  return (
    <View className="h-2 w-full bg-muted rounded-full overflow-hidden">
      <View className="h-2 bg-primary" style={{ width: `${v}%` }} />
    </View>
  );
};

// 칩 (간단 버전)
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

const DEFAULT_QUESTIONS = [
  "자기소개를 해주세요.",
  "이 직무에 지원하게 된 동기가 무엇인가요?",
  "본인의 강점과 이것이 업무에 어떻게 도움이 될지 설명해주세요.",
  "가장 도전적이었던 프로젝트와 해결 과정을 말씀해주세요.",
  "5년 후 본인의 모습을 어떻게 그리고 계신가요?",
  "저희 회사에 궁금한 점이 있으시다면 말씀해주세요.",
];

export function InterviewScreen({
  jobData,
  onComplete,
  questions = DEFAULT_QUESTIONS,
}) {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState(
    /** "idle" | "prep" | "rec" | "done" */ "idle"
  );
  const [elapsed, setElapsed] = useState(0); // 녹화 경과 (sec)
  const [prepLeft, setPrepLeft] = useState(PREP_SECONDS);
  const [records, setRecords] = useState([]); // {question, duration, skipped, createdAt}

  const timerRef = useRef(null);
  const qTotal = questions.length;
  const isLast = idx === qTotal - 1;

  const progress = useMemo(() => ((idx + 1) / qTotal) * 100, [idx, qTotal]);
  const currentQuestion = questions[idx];

  useEffect(() => {
    return () => stopAllTimers();
  }, []);

  const stopAllTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // ===== 시간 포맷 =====
  const mmss = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ===== 단계 전환 =====
  const beginPrep = () => {
    stopAllTimers();
    setPhase("prep");
    setPrepLeft(PREP_SECONDS);
    timerRef.current = setInterval(() => {
      setPrepLeft((v) => {
        if (v <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          beginRec();
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  };

  const beginRec = () => {
    stopAllTimers();
    setPhase("rec");
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed((v) => {
        const nv = v + 1;
        // 최대 길이 도달 시 자동 종료
        if (nv >= MAX_SECONDS) {
          setTimeout(() => stopRec(), 0);
        }
        return nv;
      });
    }, 1000);
  };

  const stopRec = () => {
    stopAllTimers();
    setPhase("done");
    setRecords((prev) => {
      const next = [...prev];
      next[idx] = {
        question: currentQuestion,
        duration: elapsed,
        skipped: false,
        createdAt: new Date().toISOString(),
      };
      return next;
    });
  };

  const redoRec = () => {
    // 덮어쓰기 확인
    if (records[idx] && !records[idx].skipped) {
      Alert.alert("다시 녹화", "이 질문의 기존 녹화를 덮어쓸까요?", [
        { text: "취소" },
        {
          text: "덮어쓰기",
          style: "destructive",
          onPress: () => beginPrep(),
        },
      ]);
    } else {
      beginPrep();
    }
  };

  const skipQuestion = () => {
    Alert.alert(
      "질문 건너뛰기",
      "이 질문을 건너뛰면 평가에서 불리할 수 있어요. 그래도 건너뛸까요?",
      [
        { text: "계속 답변", style: "default" },
        {
          text: "건너뛰기",
          style: "destructive",
          onPress: () => {
            setRecords((prev) => {
              const next = [...prev];
              next[idx] = {
                question: currentQuestion,
                duration: 0,
                skipped: true,
                createdAt: new Date().toISOString(),
              };
              return next;
            });
            goNext();
          },
        },
      ]
    );
  };

  const canProceed = useMemo(() => {
    const r = records[idx];
    if (!r) return false;
    if (r.skipped) return true;
    return (r.duration ?? 0) >= MIN_SECONDS; // 최소 답변 길이 충족
  }, [records, idx]);

  const goNext = () => {
    stopAllTimers();
    if (isLast) {
      onComplete?.({ answers: records, jobData });
      return;
    }
    setIdx((v) => v + 1);
    setPhase("idle");
    setElapsed(0);
    setPrepLeft(PREP_SECONDS);
  };

  // ===== 뷰 =====
  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={["#eff6ff", "#e0e7ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 p-6"
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ maxWidth: 520, alignSelf: "center", width: "100%" }}>
            {/* 진행률 */}
            <View className="mb-8">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">
                  질문 {idx + 1} / {qTotal}
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
                <Chip variant="secondary">Q{idx + 1}</Chip>
                {jobData?.company ? (
                  <Chip variant="outline">{jobData.company}</Chip>
                ) : null}
                {jobData?.jobTitle ? (
                  <Chip variant="outline">{jobData.jobTitle}</Chip>
                ) : null}
              </View>

              <Text className="text-lg font-semibold text-foreground mb-4">
                {currentQuestion}
              </Text>

              <Text className="text-sm text-muted-foreground">
                답변은{" "}
                <Text className="font-semibold">최소 {MIN_SECONDS}초</Text>{" "}
                이상을 권장합니다. (최대 {mmss(MAX_SECONDS)}까지 녹화)
              </Text>
            </Card>

            {/* 녹화 영역 */}
            <Card className="p-6 mb-6 bg-card">
              {/* 준비 단계 */}
              {phase === "prep" && (
                <View className="items-center">
                  <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-4">
                    <View className="w-12 h-12 bg-primary rounded-full items-center justify-center">
                      <Play size={24} color="#fff" />
                    </View>
                  </View>
                  <Text className="text-lg font-semibold text-foreground">
                    곧 녹화를 시작합니다
                  </Text>
                  <View className="flex-row items-center gap-2 mt-2">
                    <Clock size={16} color="#717182" />
                    <Text className="text-xl font-bold">{prepLeft}s</Text>
                  </View>
                  <Text className="text-sm text-muted-foreground mt-2">
                    카메라 각도와 마이크 상태를 점검하세요.
                  </Text>
                </View>
              )}

              {/* 녹화 중 */}
              {phase === "rec" && (
                <View className="items-center">
                  <View className="w-24 h-24 bg-red-100 rounded-full items-center justify-center mb-4">
                    <View className="w-12 h-12 bg-red-500 rounded-full items-center justify-center">
                      <Pause size={24} color="#fff" />
                    </View>
                  </View>
                  <Text
                    className="text-lg font-semibold"
                    style={{ color: "#DC2626" }}
                  >
                    녹화 중...
                  </Text>
                  <View className="flex-row items-center gap-2 mt-2">
                    <Clock size={16} color="#717182" />
                    <Text className="text-2xl font-bold text-foreground">
                      {mmss(elapsed)}
                    </Text>
                  </View>
                  <Text className="text-xs text-muted-foreground mt-1">
                    최대 {mmss(MAX_SECONDS)}가 되면 자동으로 멈춰요
                  </Text>

                  <Button
                    onPress={stopRec}
                    variant="destructive"
                    className="w-full mt-4"
                    accessibilityLabel="녹화 중지"
                    testID="stop-rec"
                  >
                    <View className="flex-row items-center justify-center">
                      <Pause size={18} color="#fff" />
                      <Text className="ml-2 text-base text-white">
                        녹화 중지
                      </Text>
                    </View>
                  </Button>
                </View>
              )}

              {/* 완료/대기 */}
              {(phase === "idle" || phase === "done") && (
                <View className="items-center">
                  <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-4">
                    <View className="w-12 h-12 bg-primary rounded-full items-center justify-center">
                      {records[idx] && !records[idx]?.skipped ? (
                        <CheckCircle size={24} color="#fff" />
                      ) : (
                        <Mic size={24} color="#fff" />
                      )}
                    </View>
                  </View>

                  <View className="items-center mb-2">
                    <Text className="text-muted-foreground">
                      {records[idx]
                        ? records[idx].skipped
                          ? "이 질문을 건너뛰었습니다"
                          : `답변이 녹화되었습니다 • ${mmss(
                              records[idx].duration
                            )}`
                        : "답변 녹화 준비 완료"}
                    </Text>
                  </View>

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

                  <View className="w-full mt-4 gap-3">
                    <Button
                      onPress={beginPrep}
                      className="w-full bg-primary"
                      disabled={phase === "prep"}
                      accessibilityLabel="녹화 시작"
                      testID="start-prep"
                    >
                      <View className="flex-row items-center justify-center">
                        <Play size={18} color="#fff" />
                        <Text className="ml-2 text-base text-primary-foreground">
                          {records[idx] ? "추가 녹화" : "녹화 시작"}
                        </Text>
                      </View>
                    </Button>

                    {records[idx] && !records[idx]?.skipped ? (
                      <Button
                        onPress={redoRec}
                        variant="outline"
                        className="w-full"
                        accessibilityLabel="다시 녹화"
                        testID="redo-rec"
                      >
                        <View className="flex-row items-center justify-center">
                          <RotateCcw size={16} />
                          <Text className="ml-2 text-base">다시 녹화</Text>
                        </View>
                      </Button>
                    ) : null}
                  </View>
                </View>
              )}
            </Card>

            {/* 액션 */}
            {phase !== "rec" && (
              <View className="gap-3">
                <Button
                  onPress={goNext}
                  className="w-full h-12"
                  disabled={!canProceed}
                  accessibilityLabel={
                    isLast ? "면접 완료하기" : "다음 질문으로"
                  }
                  testID="next-btn"
                >
                  <View className="flex-row items-center justify-center">
                    <Text className="text-base text-primary-foreground">
                      {isLast ? "면접 완료하기" : "다음 질문"}
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
                  testID="skip-btn"
                >
                  <View className="flex-row items-center justify-center">
                    <SkipForward size={16} />
                    <Text className="ml-2 text-base">질문 건너뛰기</Text>
                  </View>
                </Button>

                <Text className="text-center text-xs text-muted-foreground">
                  최소 {MIN_SECONDS}초 이상 답변 시 다음으로 진행할 수 있어요.
                  (건너뛰기는 가능)
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
