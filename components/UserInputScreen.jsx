// components/UserInputScreen.jsx (Expo / React Native)
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import {
  Upload,
  FileText,
  Briefcase,
  ArrowRight,
  X,
  FileCheck,
  Edit3,
} from "lucide-react-native";

import { Button } from "./ui/button.jsx";
import { Input } from "./ui/input.jsx";
import { Label } from "./ui/label.jsx";
import { Card } from "./ui/card.jsx";
// Textarea가 RN용 래퍼라면 그대로 사용, 아니라면 Input에 multiline prop을 써도 됩니다.
import { Textarea } from "./ui/textarea.jsx";

export function UserInputScreen({ onContinue, profileData }) {
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    jobDescription: "",
    resume: null, // { name, size, mimeType, uri }
    coverLetter: "",
    portfolio: null, // { name, size, mimeType, uri }
  });
  const [errors, setErrors] = useState({});
  const [isEditingCoverLetter, setIsEditingCoverLetter] = useState(false);

  // ProfileInfo 데이터에서 이력서/포트폴리오/자소서 초기화
  useEffect(() => {
    if (profileData) {
      setFormData((prev) => ({
        ...prev,
        resume: profileData.resumeFile || prev.resume,
        coverLetter: profileData.coverLetter || prev.coverLetter,
        portfolio: profileData.portfolioFile || prev.portfolio,
      }));
    }
  }, [profileData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.jobTitle.trim())
      newErrors.jobTitle = "지원 직무를 입력해주세요.";
    if (!formData.resume) newErrors.resume = "이력서를 업로드해주세요.";
    if (!formData.coverLetter.trim())
      newErrors.coverLetter = "자기소개서를 입력해주세요.";
    else if (formData.coverLetter.trim().length < 50)
      newErrors.coverLetter = "자기소개서는 최소 50자 이상 입력해주세요.";
    if (!formData.portfolio)
      newErrors.portfolio = "포트폴리오를 업로드해주세요.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatFileSize = (bytes = 0) => {
    if (!bytes) return "—";
    const k = 1024,
      sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // 파일 피커
  const pickFile = async (type) => {
    const resumeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const portfolioTypes = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    const picker = await DocumentPicker.getDocumentAsync({
      type: type === "resume" ? resumeTypes : portfolioTypes,
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (picker.canceled) return;

    const file = picker.assets?.[0];
    if (!file) return;

    const ext = (file.name?.split(".").pop() || "").toLowerCase();
    const allowList = type === "resume" ? resumeTypes : portfolioTypes;
    const okByMime = file.mimeType && allowList.includes(file.mimeType);
    const okByExt =
      type === "resume"
        ? ["pdf", "doc", "docx"].includes(ext)
        : ["pdf", "ppt", "pptx", "jpg", "jpeg", "png", "gif"].includes(ext);

    if (!(okByMime || okByExt)) {
      Alert.alert(
        "알림",
        type === "resume"
          ? "이력서는 PDF, DOC, DOCX 파일만 업로드 가능합니다."
          : "포트폴리오는 PDF, PPT, PPTX, JPG, PNG, GIF 파일만 업로드 가능합니다."
      );
      return;
    }
    if (typeof file.size === "number" && file.size > 50 * 1024 * 1024) {
      Alert.alert("알림", "파일 크기는 50MB 이하로 업로드해주세요.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [type]: {
        name: file.name,
        size: typeof file.size === "number" ? file.size : 0,
        mimeType:
          file.mimeType ||
          (type === "resume" ? `application/${ext}` : `application/${ext}`),
        uri: file.uri,
      },
    }));
    if (errors[type]) setErrors((prev) => ({ ...prev, [type]: "" }));
  };

  const removeFile = (type) =>
    setFormData((prev) => ({ ...prev, [type]: null }));

  const handleSubmit = () => {
    if (!validateForm()) return;
    onContinue?.(formData);
  };

  return (
    <SafeAreaView className="flex-1 bg-muted/30">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <View
            style={{ maxWidth: 480, alignSelf: "center", width: "100%" }}
            className="gap-6"
          >
            {/* 지원 정보 */}
            <Card className="p-6">
              <View className="flex-row items-center gap-3 mb-4">
                <Briefcase size={20} color="#030213" />
                <Text className="font-semibold text-foreground">지원 정보</Text>
              </View>

              <View className="gap-4">
                <View>
                  <Label>
                    지원 직무 <Text className="text-red-500">*</Text>
                  </Label>
                  <Input
                    placeholder="예: 프론트엔드 개발자"
                    value={formData.jobTitle}
                    onChangeText={(v) => handleInputChange("jobTitle", v)}
                    accessibilityLabel="지원 직무 입력"
                    className={errors.jobTitle ? "border-red-500 mt-1" : "mt-1"}
                  />
                  {errors.jobTitle ? (
                    <Text className="text-sm text-red-500 mt-1">
                      {errors.jobTitle}
                    </Text>
                  ) : null}
                </View>

                <View>
                  <Label>회사명 (선택)</Label>
                  <Input
                    placeholder="예: 카카오, 네이버, 삼성전자"
                    value={formData.company}
                    onChangeText={(v) => handleInputChange("company", v)}
                    accessibilityLabel="회사명 입력"
                    className="mt-1"
                  />
                </View>

                <View>
                  <Label>채용공고 내용 (선택)</Label>
                  {/* Textarea가 RN 래퍼가 아니라면: <Input multiline numberOfLines={3} ... /> 로 대체 */}
                  <Textarea
                    value={formData.jobDescription}
                    onChangeText={(v) => handleInputChange("jobDescription", v)}
                    placeholder="채용공고를 붙여넣으면 더 정확한 질문을 받을 수 있습니다..."
                    className="mt-1"
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            </Card>

            {/* 자기소개서 작성 */}
            <Card className="p-6">
              <View className="flex-row items-center gap-3 mb-4">
                <FileText size={20} color="#030213" />
                <Text className="font-semibold text-foreground">
                  자기소개서 <Text className="text-red-500">*</Text>
                </Text>
              </View>

              <View>
                <Label>자기소개서 내용</Label>
                <Textarea
                  value={formData.coverLetter}
                  onChangeText={(v) => handleInputChange("coverLetter", v)}
                  placeholder={`자기소개서를 입력하세요\n\n예시:\n- 지원 동기\n- 핵심 역량과 경험\n- 해당 직무에 대한 열정\n- 회사에 기여할 수 있는 점`}
                  className={`mt-1 ${
                    errors.coverLetter ? "border-red-500" : ""
                  }`}
                  multiline
                  numberOfLines={8}
                />
                {errors.coverLetter ? (
                  <Text className="text-sm text-red-500 mt-1">
                    {errors.coverLetter}
                  </Text>
                ) : null}
                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-xs text-foreground/60">
                    최소 50자 이상 입력해주세요
                  </Text>
                  <Text className="text-xs text-foreground/60">
                    {formData.coverLetter.length}자
                  </Text>
                </View>
              </View>
            </Card>

            {/* 서류 업로드 */}
            <Card className="p-6">
              <View className="flex-row items-center gap-3 mb-4">
                <Upload size={20} color="#030213" />
                <Text className="font-semibold text-foreground">
                  서류 업로드
                </Text>
              </View>

              <View className="gap-4">
                <FileUploadArea
                  title="이력서"
                  description="PDF, DOC, DOCX 파일"
                  required
                  file={formData.resume}
                  onPick={() => pickFile("resume")}
                  onRemove={() => removeFile("resume")}
                  error={errors.resume}
                  fromProfile={!!profileData?.resumeFile}
                  formatFileSize={formatFileSize}
                />
                <FileUploadArea
                  title="포트폴리오"
                  description="PDF, PPT, PPTX, JPG, PNG, GIF 파일"
                  required
                  file={formData.portfolio}
                  onPick={() => pickFile("portfolio")}
                  onRemove={() => removeFile("portfolio")}
                  error={errors.portfolio}
                  fromProfile={!!profileData?.portfolioFile}
                  formatFileSize={formatFileSize}
                />
              </View>
            </Card>

            {/* 계속하기 버튼 */}
            <Button
              onPress={handleSubmit}
              className="w-full h-12"
              accessibilityLabel="면접으로 계속하기"
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-base text-primary-foreground">
                  면접 시작하기
                </Text>
                <ArrowRight size={16} color="#fff" style={{ marginLeft: 8 }} />
              </View>
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FileUploadArea({
  title,
  description,
  required,
  file,
  onPick,
  onRemove,
  error,
  fromProfile,
  formatFileSize,
}) {
  return (
    <View>
      <View
        className={`border-2 border-dashed rounded-lg p-4 items-center justify-center ${
          error ? "border-red-500" : "border-border"
        }`}
      >
        {!file ? (
          <Pressable onPress={onPick} accessibilityRole="button">
            <View className="items-center">
              <Upload size={32} color="#6B7280" />
              <Text className="mt-2 font-medium text-foreground">
                {title}{" "}
                {required ? <Text className="text-red-500">*</Text> : null}
              </Text>
              <Text className="text-sm text-foreground/60">{description}</Text>
              <Text className="text-xs text-foreground/60 mt-1">
                탭하여 업로드
              </Text>
            </View>
          </Pressable>
        ) : (
          <View className="items-center">
            <View className="flex-row items-center gap-2 mb-2">
              <FileCheck size={28} color="#16A34A" />
              <Button
                variant="ghost"
                size="sm"
                onPress={onRemove}
                accessibilityLabel={`${title} 파일 삭제`}
                className="h-6 px-2"
              >
                <X size={14} />
              </Button>
            </View>
            <Text className="font-medium text-sm text-foreground">
              {file.name}
            </Text>
            <Text className="text-xs text-foreground/60">
              {formatFileSize?.(file.size)}
            </Text>
            {fromProfile ? (
              <Text className="text-xs text-blue-600 mt-1">
                개인정보에서 자동 입력됨
              </Text>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              onPress={onPick}
              className="mt-2"
              accessibilityLabel={`${title} 파일 변경`}
            >
              <View className="flex-row items-center gap-1">
                <Edit3 size={14} />
                <Text className="text-sm">탭하여 변경하기</Text>
              </View>
            </Button>
          </View>
        )}
      </View>

      {error ? (
        <Text className="text-sm text-red-500 mt-1">{error}</Text>
      ) : null}
    </View>
  );
}
