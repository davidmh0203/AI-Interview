// components/JobListScreen.jsx (Expo / React Native)
import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Pressable } from "react-native";
import { Search, Filter, ChevronRight, RotateCcw } from "lucide-react-native";
import { Button } from "./ui/button.jsx";
import { Input } from "./ui/input.jsx";
import { Badge } from "./ui/badge.jsx";
import { Card } from "./ui/card.jsx";

// 더미 데이터
const dummyJobs = [
  {
    id: 1,
    title: "프론트엔드 개발자(React)",
    company: "J-GEAR",
    location: "경기 고양시",
    experience: "신입/경력",
    deadline: "~ 08.31(일)",
    tags: ["정규직", "주 5일", "재택 일부"],
    employmentType: "정규직",
    category: "프론트엔드",
  },
  {
    id: 2,
    title: "백엔드 개발자(Node.js)",
    company: "테크스타트업",
    location: "서울 강남구",
    experience: "경력 3년+",
    deadline: "~ 09.15(일)",
    tags: ["정규직", "주 4일", "완전 재택"],
    employmentType: "정규직",
    category: "백엔드",
  },
  {
    id: 3,
    title: "데이터 분석가",
    company: "데이터기업",
    location: "서울 마포구",
    experience: "신입/경력",
    deadline: "~ 09.30(월)",
    tags: ["정규직", "주 5일", "하이브리드"],
    employmentType: "정규직",
    category: "데이터",
  },
  {
    id: 4,
    title: "UI/UX 기획자",
    company: "디자인스튜디오",
    location: "부산 해운대구",
    experience: "경력 2년+",
    deadline: "~ 09.10(화)",
    tags: ["정규직", "주 5일", "현장근무"],
    employmentType: "정규직",
    category: "기획",
  },
  {
    id: 5,
    title: "프론트엔드 인턴",
    company: "성장기업",
    location: "경기 성남시",
    experience: "인턴",
    deadline: "~ 08.25(일)",
    tags: ["인턴", "주 5일", "현장근무"],
    employmentType: "인턴",
    category: "프론트엔드",
  },
];

const jobCategories = ["프론트엔드", "백엔드", "데이터", "기획"];
const locations = ["서울", "경기", "부산"];

export function JobListScreen({ onJobSelect, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 필터링
  const filteredJobs = dummyJobs.filter((job) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(job.category);

    const matchesLocation =
      selectedLocations.length === 0 ||
      selectedLocations.some((loc) => job.location.includes(loc));

    return matchesSearch && matchesCategory && matchesLocation;
  });

  const toggleFilter = (arr, setArr, value) => {
    if (arr.includes(value)) setArr(arr.filter((v) => v !== value));
    else setArr([...arr, value]);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedLocations([]);
    setSearchQuery("");
  };

  const handleJobCardPress = (job) => {
    onJobSelect?.(job);
    onNavigate?.("jobDetail");
  };

  // 스켈레톤
  const SkeletonCard = () => (
    <Card className="p-4 animate-pulse">
      <View className="gap-3">
        <View className="h-5 bg-muted rounded w-3/4" />
        <View className="h-4 bg-muted rounded w-1/2" />
        <View className="flex-row gap-2">
          <View className="h-6 bg-muted rounded w-16" />
          <View className="h-6 bg-muted rounded w-16" />
        </View>
        <View className="h-4 bg-muted rounded w-1/3" />
      </View>
    </Card>
  );

  // 빈 상태
  const EmptyState = () => (
    <View className="items-center justify-center py-16 px-4">
      <View className="w-16 h-16 bg-muted rounded-full items-center justify-center mb-4">
        <Search size={32} color="#9CA3AF" />
      </View>
      <Text className="text-lg font-semibold text-foreground mb-2">
        조건에 맞는 공고가 없습니다
      </Text>
      <Text className="text-foreground/60 mb-4">
        다른 검색어나 필터를 시도해보세요
      </Text>
      <Button
        variant="outline"
        onPress={clearAllFilters}
        accessibilityLabel="필터 초기화"
      >
        <View className="flex-row items-center gap-2">
          <RotateCcw size={16} />
          <Text>필터 초기화</Text>
        </View>
      </Button>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* sticky header를 ScrollView 첫 child로 두고 고정 */}
      <ScrollView
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* AppBar + 검색/필터 (sticky) */}
        <View className="bg-card border-b shadow-sm">
          {/* AppBar */}
          <View className="flex-row items-center justify-between p-4">
            <Text className="text-2xl font-bold text-foreground">채용공고</Text>
            <View className="flex-row items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                accessibilityLabel="검색"
              >
                <Search size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onPress={() => setShowFilter(!showFilter)}
                accessibilityLabel="필터"
              >
                <Filter size={20} />
              </Button>
            </View>
          </View>

          {/* SearchBar */}
          <View className="px-4 pb-4">
            <View className="relative">
              <View className="absolute left-3 top-3">
                <Search size={16} color="#9CA3AF" />
              </View>
              <Input
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="회사명·직무·키워드로 검색"
                accessibilityLabel="채용공고 검색"
                className="pl-8"
                autoCapitalize="none"
                returnKeyType="search"
              />
            </View>
          </View>

          {/* Filter chips */}
          {showFilter && (
            <View className="px-4 pb-4 border-t bg-muted/30">
              {/* 직무별 */}
              <View className="pt-3">
                <Text className="text-sm font-medium text-foreground/80 mb-2">
                  직무별
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {jobCategories.map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategories.includes(category)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onPress={() =>
                        toggleFilter(
                          selectedCategories,
                          setSelectedCategories,
                          category
                        )
                      }
                      className="h-8"
                      accessibilityLabel={`${category} 필터 ${
                        selectedCategories.includes(category) ? "해제" : "적용"
                      }`}
                    >
                      {category}
                    </Button>
                  ))}
                </View>
              </View>

              {/* 지역별 */}
              <View className="mt-3">
                <Text className="text-sm font-medium text-foreground/80 mb-2">
                  지역별
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {locations.map((location) => (
                    <Button
                      key={location}
                      variant={
                        selectedLocations.includes(location)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onPress={() =>
                        toggleFilter(
                          selectedLocations,
                          setSelectedLocations,
                          location
                        )
                      }
                      className="h-8"
                      accessibilityLabel={`${location} 필터 ${
                        selectedLocations.includes(location) ? "해제" : "적용"
                      }`}
                    >
                      {location}
                    </Button>
                  ))}
                </View>
              </View>

              <View className="pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={clearAllFilters}
                  className="h-8"
                  accessibilityLabel="필터 초기화"
                >
                  필터 초기화
                </Button>
              </View>
            </View>
          )}
        </View>

        {/* 목록 */}
        <View className="p-4 gap-4">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : filteredJobs.length === 0 ? (
            <EmptyState />
          ) : (
            filteredJobs.map((job) => (
              <Pressable
                key={job.id}
                onPress={() => handleJobCardPress(job)}
                accessibilityLabel={`${job.title} - ${job.company} - ${job.location} - ${job.deadline}`}
              >
                <Card className="p-4">
                  <View className="gap-3">
                    {/* 공고명 */}
                    <Text className="font-semibold text-foreground">
                      {job.title}
                    </Text>
                    {/* 회사명 · 지역 · 경력 */}
                    <Text className="text-sm text-foreground/60">
                      {job.company} · {job.location} · {job.experience}
                    </Text>
                    {/* 태그 */}
                    <View className="flex-row flex-wrap gap-2">
                      {job.tags.map((tag, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </View>
                    {/* 마감일 + 화살표 */}
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-foreground/60">
                        {job.deadline}
                      </Text>
                      <ChevronRight size={20} color="#9CA3AF" />
                    </View>
                  </View>
                </Card>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
