// components/CoverLetter.jsx (Expo / React Native)
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Alert,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import {
  FileText,
  Upload,
  X,
  Briefcase,
  ArrowRight,
} from "lucide-react-native";
import { Button } from "./ui/button.jsx";
import { Card } from "./ui/card.jsx";
import { Label } from "./ui/label.jsx";

export function CoverLetter({
  selectedJob,
  onSave,
  onStartInterview,
  initialData = {},
}) {
  const [formData, setFormData] = useState({
    coverLetter: initialData.coverLetter || "",
    portfolioFile: initialData.portfolioFile || null, // { name, size, type, uri }
    ...initialData,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    const text = (formData.coverLetter || "").trim();
    if (!text) newErrors.coverLetter = "자기소개서를 입력해주세요.";
    else if (text.length < 50)
      newErrors.coverLetter = "자기소개서는 최소 50자 이상 입력해주세요.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickPortfolio = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "image/jpeg",
        "image/png",
        "image/gif",
      ],
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (res.canceled) return;
    const file = res.assets?.[0];
    if (!file) return;

    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];
    const okMime = file.mimeType && allowed.includes(file.mimeType);
    if (!okMime) {
      Alert.alert(
        "알림",
        "PDF, PPT, PPTX, DOC, DOCX, JPG, PNG, GIF 파일만 업로드 가능합니다."
      );
      return;
    }
    if (typeof file.size === "number" && file.size > 50 * 1024 * 1024) {
      Alert.alert("알림", "파일 크기는 50MB 이하로 업로드해주세요.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      portfolioFile: {
        name: file.name,
        size: typeof file.size === "number" ? file.size : 0,
        type: file.mimeType,
        uri: file.uri,
      },
    }));
  };

  const removePortfolio = () =>
    setFormData((prev) => ({ ...prev, portfolioFile: null }));

  const formatFileSize = (bytes = 0) => {
    if (bytes === 0) return "—";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getFileIcon = (fileType = "") => {
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("presentation")) return "📊";
    if (fileType.includes("word")) return "📝";
    return "📎";
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 600)); // 모의 저장
      onSave?.(formData);
    } catch (e) {
      console.error(e);
      Alert.alert("알림", "저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStart = async () => {
    if (!validateForm()) return;
    setIsStarting(true);
    try {
      await new Promise((r) => setTimeout(r, 600)); // 자동 저장
      onSave?.(formData);
      onStartInterview?.({ ...selectedJob, coverLetter: formData.coverLetter });
    } catch (e) {
      console.error(e);
      Alert.alert(
        "알림",
        "면접 시작 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {/* 헤더 */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground mb-2">
            자기소개서 작성
          </Text>
          <Text className="text-muted-foreground mb-4">
            선택한 공고에 맞춰 자기소개서를 작성하세요.
          </Text>

          {selectedJob ? (
            <Card className="p-4 bg-primary/5 border border-primary/20">
              <View className="flex-row items-center gap-3">
                <Briefcase size={20} color="#030213" />
                <View>
                  <Text className="font-semibold text-sm text-foreground">
                    {selectedJob.title}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {selectedJob.company}
                  </Text>
                </View>
              </View>
            </Card>
          ) : null}
        </View>

        <View className="gap-6">
          {/* 자기소개서 */}
          <Card className="p-6">
            <View className="flex-row items-center gap-2 mb-4">
              <FileText size={20} color="#030213" />
              <Text className="text-lg font-semibold text-foreground">
                자기소개서
              </Text>
            </View>

            <View>
              <Label className="text-sm font-medium mb-2">
                자기소개서 <Text className="text-red-500">*</Text>
              </Label>
              <TextInput
                value={formData.coverLetter}
                onChangeText={(v) => handleInputChange("coverLetter", v)}
                placeholder={`자기소개서를 입력하세요\n\n예시:\n- 지원 동기\n- 핵심 역량과 경험\n- 해당 직무에 대한 열정\n- 회사에 기여할 수 있는 점`}
                multiline
                textAlignVertical="top"
                className={`rounded-md bg-input-background px-3 py-3 ${
                  errors.coverLetter ? "border border-red-500" : ""
                }`}
                style={{ minHeight: 300 }}
                accessibilityLabel="자기소개서 입력"
              />
              {errors.coverLetter ? (
                <Text className="text-sm text-red-500 mt-1">
                  {errors.coverLetter}
                </Text>
              ) : null}

              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-xs text-muted-foreground">
                  최소 50자 이상 입력해주세요
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {formData.coverLetter.length}자
                </Text>
              </View>
            </View>
          </Card>

          {/* 포트폴리오 첨부 */}
          <Card className="p-6">
            <View className="flex-row items-center gap-2 mb-4">
              <Upload size={20} color="#030213" />
              <Text className="text-lg font-semibold text-foreground">
                포트폴리오 첨부
              </Text>
              <Text className="text-sm text-muted-foreground">(선택)</Text>
            </View>

            {!formData.portfolioFile ? (
              <View className="border border-dashed rounded-lg p-6 items-center">
                <Upload size={32} color="#717182" />
                <Text className="text-sm text-muted-foreground mt-3 mb-2">
                  포트폴리오 파일을 선택하세요
                </Text>
                <Text className="text-xs text-muted-foreground mb-4">
                  지원 형식: PDF, PPT, PPTX, DOC, DOCX, JPG, PNG, GIF (최대
                  50MB)
                </Text>
                <Button
                  variant="outline"
                  onPress={pickPortfolio}
                  accessibilityLabel="포트폴리오 파일 선택"
                >
                  파일 선택
                </Button>
              </View>
            ) : (
              <View className="border rounded-lg p-4 bg-muted/30">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <Text className="text-2xl">
                      {getFileIcon(formData.portfolioFile.type)}
                    </Text>
                    <View>
                      <Text className="font-medium text-sm text-foreground">
                        {formData.portfolioFile.name}
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        {formatFileSize(formData.portfolioFile.size)}
                      </Text>
                    </View>
                  </View>
                  <Button
                    variant="ghost"
                    onPress={removePortfolio}
                    accessibilityLabel="포트폴리오 파일 삭제"
                  >
                    <X size={16} color="#111111" />
                  </Button>
                </View>
              </View>
            )}
          </Card>

          {/* 액션 */}
          <View className="gap-3 mb-8">
            <Button
              variant="outline"
              onPress={handleSave}
              disabled={isSaving}
              className="h-12"
              accessibilityLabel="자기소개서 저장"
            >
              {isSaving ? "저장 중..." : "자기소개서 저장"}
            </Button>

            <Button
              onPress={handleStart}
              disabled={isStarting}
              className="h-14 bg-primary"
              accessibilityLabel="면접 시작하기"
            >
              {isStarting ? (
                "준비 중..."
              ) : (
                <View className="flex-row items-center justify-center">
                  <ArrowRight size={20} color="#ffffff" />
                  <Text className="ml-2 text-lg text-primary-foreground">
                    면접 시작하기
                  </Text>
                </View>
              )}
            </Button>

            <Text className="text-center text-sm text-muted-foreground">
              면접 시작 시 자기소개서가 자동으로 저장됩니다
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
