// components/UserInputScreen.jsx (Expo / React Native)
import React, { useEffect, useMemo, useState } from "react";
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

// ===== UI/UX 상수 (다른 화면과 통일) =====
const RESUME_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const RESUME_EXT = ["pdf", "doc", "docx"];

const PORTFOLIO_MIME = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/gif",
];
const PORTFOLIO_EXT = ["pdf", "ppt", "pptx", "jpg", "jpeg", "png", "gif"];

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50MB (CoverLetter 화면과 동일)
const MIN_CL_LENGTH = 50; // 최소 글자 수 (트림 기준)
const MAX_CL_LENGTH = 2000; // 최대 글자 수 (과도한 길이 방지)

export function UserInputScreen({ onContinue, profileData }) {
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    jobDescription: "",
    resume: null, // { name, size, mimeType, uri }
    coverLetter: "",
    portfolio: null, // { name, size, mimeType, uri } (선택)
  });
  const [errors, setErrors] = useState({});

  // ProfileInfo에서 가져온 기본 파일/자소서 연결
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

  const trimmedCL = useMemo(
    () => (formData.coverLetter || "").replace(/^\s+|\s+$/g, ""),
    [formData.coverLetter]
  );

  const isValid = useMemo(() => {
    return (
      (formData.jobTitle || "").trim().length > 0 &&
      !!formData.resume &&
      trimmedCL.length >= MIN_CL_LENGTH
    );
  }, [formData.jobTitle, formData.resume, trimmedCL]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!(formData.jobTitle || "").trim())
      newErrors.jobTitle = "지원 직무를 입력해주세요.";
    if (!formData.resume) newErrors.resume = "이력서를 업로드해주세요.";

    if (!trimmedCL) newErrors.coverLetter = "자기소개서를 입력해주세요.";
    else if (trimmedCL.length < MIN_CL_LENGTH)
      newErrors.coverLetter = `자기소개서는 최소 ${MIN_CL_LENGTH}자 이상 입력해주세요.`;

    // 포트폴리오는 선택사항(이전 화면과 정책 일치)
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatFileSize = (bytes = 0) => {
    if (!bytes) return "—";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.min(
      Math.floor(Math.log(bytes) / Math.log(k)),
      sizes.length - 1
    );
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const pickFile = async (type) => {
    const isResume = type === "resume";
    const allowMime = isResume ? RESUME_MIME : PORTFOLIO_MIME;
    const allowExt = isResume ? RESUME_EXT : PORTFOLIO_EXT;

    const picker = await DocumentPicker.getDocumentAsync({
      type: allowMime,
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (picker.canceled) return;

    const file = picker.assets?.[0];
    if (!file) return;

    const ext = (file.name?.split(".").pop() || "").toLowerCase();
    const okByMime = file.mimeType && allowMime.includes(file.mimeType);
    const okByExt = allowExt.includes(ext);

    if (!(okByMime || okByExt)) {
      Alert.alert(
        "알림",
        isResume
          ? "이력서는 PDF, DOC, DOCX 파일만 업로드 가능합니다."
          : "포트폴리오는 PDF, PPT, PPTX, JPG, PNG, GIF 파일만 업로드 가능합니다."
      );
      return;
    }
    if (typeof file.size === "number" && file.size > MAX_FILE_BYTES) {
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
          (isResume ? `application/${ext}` : `application/${ext}`),
        uri: file.uri,
      },
    }));
    if (errors[type]) setErrors((prev) => ({ ...prev, [type]: "" }));
  };

  const removeFile = (type) =>
    setFormData((prev) => ({ ...prev, [type]: null }));

  const handleSubmit = () => {
    if (!validateForm()) return;
    const payload = {
      ...formData,
      coverLetter: trimmedCL.slice(0, MAX_CL_LENGTH),
      jobTitle: (formData.jobTitle || "").trim(),
      company: (formData.company || "").trim(),
      jobDescription: (formData.jobDescription || "").trim(),
    };
    onContinue?.(payload);
  };

  return (
    <SafeAreaView className="flex-1 bg-muted/30">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={80}
      >
        <ScrollView
          contentContainerStyle={{ padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
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
                {/* 직무 */}
                <View>
                  <Label>
                    지원 직무 <Text className="text-red-500">*</Text>
                  </Label>
                  <Input
                    placeholder="예: 프론트엔드 개발자"
                    value={formData.jobTitle}
                    onChangeText={(v) => handleInputChange("jobTitle", v)}
                    accessibilityLabel="지원 직무 입력"
                    testID="input-jobTitle"
                    className={errors.jobTitle ? "border-red-500 mt-1" : "mt-1"}
                    autoCapitalize="none"
                  />
                  {errors.jobTitle ? (
                    <Text className="text-sm text-red-500 mt-1">
                      {errors.jobTitle}
                    </Text>
                  ) : null}
                </View>

                {/* 회사명 */}
                <View>
                  <Label>
                    회사명 <Text className="text-muted-foreground">(선택)</Text>
                  </Label>
                  <Input
                    placeholder="예: 카카오, 네이버, 삼성전자"
                    value={formData.company}
                    onChangeText={(v) => handleInputChange("company", v)}
                    accessibilityLabel="회사명 입력"
                    testID="input-company"
                    autoCapitalize="none"
                    className="mt-1"
                  />
                </View>

                {/* 채용공고 내용 */}
                <View>
                  <Label>
                    채용공고 내용{" "}
                    <Text className="text-muted-foreground">(선택)</Text>
                  </Label>
                  {/* Textarea가 RN 래퍼가 아니라면: <Input multiline numberOfLines={3} ... /> 로 대체 */}
                  <Textarea
                    value={formData.jobDescription}
                    onChangeText={(v) => handleInputChange("jobDescription", v)}
                    placeholder="채용공고를 붙여넣으면 더 정확한 질문을 받을 수 있습니다..."
                    className="mt-1"
                    multiline
                    numberOfLines={3}
                    testID="input-jobDescription"
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
                  onChangeText={(v) =>
                    handleInputChange("coverLetter", v.slice(0, MAX_CL_LENGTH))
                  }
                  placeholder={`자기소개서를 입력하세요\n\n예시:\n- 지원 동기\n- 핵심 역량과 경험\n- 직무에 대한 열정\n- 회사에 기여할 수 있는 점`}
                  className={`mt-1 ${
                    errors.coverLetter ? "border-red-500" : ""
                  }`}
                  multiline
                  numberOfLines={8}
                  testID="input-coverLetter"
                />
                {errors.coverLetter ? (
                  <Text className="text-sm text-red-500 mt-1">
                    {errors.coverLetter}
                  </Text>
                ) : null}
                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-xs text-foreground/60">
                    최소 {MIN_CL_LENGTH}자 이상 입력해주세요
                  </Text>
                  <Text className="text-xs text-foreground/60">
                    {trimmedCL.length}/{MAX_CL_LENGTH}자
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
                  description="PDF, DOC, DOCX 파일 (최대 50MB)"
                  required
                  file={formData.resume}
                  onPick={() => pickFile("resume")}
                  onRemove={() => removeFile("resume")}
                  error={errors.resume}
                  fromProfile={!!profileData?.resumeFile}
                  formatFileSize={formatFileSize}
                  testIDPrefix="resume"
                />

                <FileUploadArea
                  title="포트폴리오"
                  description="PDF, PPT, PPTX, JPG, PNG, GIF 파일 (최대 50MB)"
                  required={false}
                  file={formData.portfolio}
                  onPick={() => pickFile("portfolio")}
                  onRemove={() => removeFile("portfolio")}
                  error={errors.portfolio}
                  fromProfile={!!profileData?.portfolioFile}
                  formatFileSize={formatFileSize}
                  testIDPrefix="portfolio"
                />
              </View>
            </Card>

            {/* 계속하기 버튼 */}
            <Button
              onPress={handleSubmit}
              className="w-full h-12"
              accessibilityLabel="면접으로 계속하기"
              testID="continue-btn"
              disabled={!isValid}
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-base text-primary-foreground">
                  {isValid
                    ? "면접 시작하기"
                    : `입력값을 확인해주세요 (자기소개서 ${MIN_CL_LENGTH}자 이상)`}
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
  testIDPrefix = "file",
}) {
  return (
    <View>
      <View
        className={`border-2 border-dashed rounded-lg p-4 items-center justify-center ${
          error ? "border-red-500" : "border-border"
        }`}
      >
        {!file ? (
          <Pressable
            onPress={onPick}
            accessibilityRole="button"
            testID={`${testIDPrefix}-pick`}
          >
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
                testID={`${testIDPrefix}-remove`}
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
              testID={`${testIDPrefix}-change`}
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
