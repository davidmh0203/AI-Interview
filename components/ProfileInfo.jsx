// components/ProfileInfo.jsx (Expo / React Native)
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Alert,
  Platform,
  Pressable,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Upload,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
} from "lucide-react-native";

import { Button } from "./ui/button.jsx";
import { Card } from "./ui/card.jsx";
import { Input } from "./ui/input.jsx";
import { Label } from "./ui/label.jsx";

export function ProfileInfo({ onSave, onBack, initialData = null }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    birthDate: initialData?.birthDate || "", // ISO yyyy-mm-dd string 권장
    address: initialData?.address || "",
    resumeFile: initialData?.resumeFile || null, // { name, size, type, uri }
    ...(initialData || {}),
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "이름을 입력해주세요.";
    if (!formData.email.trim()) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요.";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "연락처를 입력해주세요.";
    } else if (!/^[0-9-+\s()]{10,}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "올바른 연락처 형식을 입력해주세요.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 파일 선택 (RN은 input[file]/드래그앤드롭 X → DocumentPicker 사용)
  const pickResume = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (res.canceled) return;

    const file = res.assets?.[0];
    if (!file) return;

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const ext = (file.name?.split(".").pop() || "").toLowerCase();
    const okByMime = file.mimeType && allowed.includes(file.mimeType);
    const okByExt = ["pdf", "doc", "docx"].includes(ext);

    if (!(okByMime || okByExt)) {
      Alert.alert("알림", "PDF, DOC, DOCX 파일만 업로드 가능합니다.");
      return;
    }

    // 일부 플랫폼에서 size가 undefined일 수 있음 → 존재할 때만 검사
    if (typeof file.size === "number" && file.size > 10 * 1024 * 1024) {
      Alert.alert("알림", "파일 크기는 10MB 이하로 업로드해주세요.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      resumeFile: {
        name: file.name,
        size: typeof file.size === "number" ? file.size : 0,
        type: file.mimeType || `application/${ext}`,
        uri: file.uri,
      },
    }));
  };

  const removeResume = () =>
    setFormData((prev) => ({ ...prev, resumeFile: null }));

  const formatFileSize = (bytes = 0) => {
    if (bytes === 0) return "—";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    // MB까지만 표기
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      // 실제 저장/전송 로직과 연결
      await new Promise((r) => setTimeout(r, 600));
      onSave?.(formData);
    } catch (e) {
      console.error(e);
      Alert.alert("알림", "저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDatePicker = () => setShowDatePicker(true);
  const onDateChange = (event, date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (date) {
      const iso = date.toISOString().slice(0, 10); // yyyy-mm-dd
      handleInputChange("birthDate", iso);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {/* 헤더 */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground mb-2">
            내 정보 입력
          </Text>
          <Text className="text-muted-foreground">
            모든 채용공고에 공통으로 사용되는 기본 정보를 입력해주세요.
          </Text>
        </View>

        {/* 기본 정보 */}
        <Card className="p-6 mb-6">
          <View className="flex-row items-center gap-2 mb-4">
            <User size={20} color="#030213" />
            <Text className="text-lg font-semibold text-foreground">
              기본 정보
            </Text>
          </View>

          <View className="gap-4">
            {/* 이름 */}
            <View>
              <Label className="text-sm font-medium">
                이름 <Text className="text-red-500">*</Text>
              </Label>
              <Input
                value={formData.name}
                onChangeText={(v) => handleInputChange("name", v)}
                placeholder="성명을 입력하세요"
                accessibilityLabel="이름 입력"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name ? (
                <Text className="text-sm text-red-500 mt-1">{errors.name}</Text>
              ) : null}
            </View>

            {/* 이메일 */}
            <View>
              <Label className="text-sm font-medium">
                이메일 <Text className="text-red-500">*</Text>
              </Label>
              <View className="relative">
                <View className="absolute left-3 top-3">
                  <Mail size={16} color="#717182" />
                </View>
                <Input
                  value={formData.email}
                  onChangeText={(v) => handleInputChange("email", v)}
                  keyboardType="email-address"
                  placeholder="example@email.com"
                  accessibilityLabel="이메일 입력"
                  className={`pl-8 ${errors.email ? "border-red-500" : ""}`}
                  autoCapitalize="none"
                />
              </View>
              {errors.email ? (
                <Text className="text-sm text-red-500 mt-1">
                  {errors.email}
                </Text>
              ) : null}
            </View>

            {/* 연락처 */}
            <View>
              <Label className="text-sm font-medium">
                연락처 <Text className="text-red-500">*</Text>
              </Label>
              <View className="relative">
                <View className="absolute left-3 top-3">
                  <Phone size={16} color="#717182" />
                </View>
                <Input
                  value={formData.phone}
                  onChangeText={(v) => handleInputChange("phone", v)}
                  keyboardType="phone-pad"
                  placeholder="010-1234-5678"
                  accessibilityLabel="연락처 입력"
                  className={`pl-8 ${errors.phone ? "border-red-500" : ""}`}
                />
              </View>
              {errors.phone ? (
                <Text className="text-sm text-red-500 mt-1">
                  {errors.phone}
                </Text>
              ) : null}
            </View>

            {/* 생년월일 */}
            <View>
              <Label className="text-sm font-medium">
                생년월일 <Text className="text-muted-foreground">(선택)</Text>
              </Label>
              <Pressable
                onPress={openDatePicker}
                accessibilityRole="button"
                className="border rounded-md px-3 py-3 bg-input-background"
              >
                <View className="flex-row items-center">
                  <Calendar size={16} color="#717182" />
                  <Text className="ml-2 text-foreground">
                    {formData.birthDate ? formData.birthDate : "YYYY-MM-DD"}
                  </Text>
                </View>
              </Pressable>

              {showDatePicker && (
                <DateTimePicker
                  value={
                    formData.birthDate
                      ? new Date(formData.birthDate)
                      : new Date(2000, 0, 1)
                  }
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onDateChange}
                />
              )}
            </View>

            {/* 주소 */}
            <View>
              <Label className="text-sm font-medium">
                주소 <Text className="text-muted-foreground">(선택)</Text>
              </Label>
              <View className="relative">
                <View className="absolute left-3 top-3">
                  <MapPin size={16} color="#717182" />
                </View>
                <Input
                  value={formData.address}
                  onChangeText={(v) => handleInputChange("address", v)}
                  placeholder="주소를 입력하세요"
                  accessibilityLabel="주소 입력"
                  className="pl-8"
                />
              </View>
            </View>
          </View>
        </Card>

        {/* 이력서 업로드 */}
        <Card className="p-6 mb-6">
          <View className="flex-row items-center gap-2 mb-4">
            <FileText size={20} color="#030213" />
            <Text className="text-lg font-semibold text-foreground">
              이력서 업로드
            </Text>
          </View>

          {!formData.resumeFile ? (
            <View className="border border-dashed rounded-lg p-6 items-center">
              <Upload size={48} color="#717182" />
              <Text className="text-sm text-muted-foreground mt-3 mb-2">
                이력서 파일을 선택하세요
              </Text>
              <Text className="text-xs text-muted-foreground mb-4">
                지원 형식: PDF, DOC, DOCX (최대 10MB)
              </Text>
              <Button
                variant="outline"
                onPress={pickResume}
                accessibilityLabel="이력서 파일 선택"
              >
                파일 선택
              </Button>
            </View>
          ) : (
            <View className="border rounded-lg p-4 bg-muted/30">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <FileText size={28} color="#030213" />
                  <View>
                    <Text className="font-medium text-sm text-foreground">
                      {formData.resumeFile.name}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {formatFileSize(formData.resumeFile.size)}
                    </Text>
                  </View>
                </View>
                <Button
                  variant="ghost"
                  onPress={removeResume}
                  accessibilityLabel="이력서 파일 삭제"
                >
                  <X size={16} color="#111111" />
                </Button>
              </View>
            </View>
          )}
        </Card>

        {/* 저장/뒤로 버튼 */}
        <View className="gap-3 mb-8">
          <Button
            onPress={handleSubmit}
            disabled={isSubmitting}
            accessibilityLabel="내 정보 저장"
            className="h-12"
          >
            {isSubmitting ? "저장 중..." : "내 정보 저장"}
          </Button>

          {onBack ? (
            <Button
              variant="outline"
              onPress={onBack}
              accessibilityLabel="뒤로 가기"
              className="h-12"
            >
              뒤로 가기
            </Button>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
