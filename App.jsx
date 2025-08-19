// App.jsx (Expo / React Native)
import React, { useMemo, useState } from "react";
import { SafeAreaView, View, Alert, useColorScheme } from "react-native";

// Screens
import { MainScreen } from "./components/MainScreen";
import { UserInputScreen } from "./components/UserInputScreen";
import { InterviewScreen } from "./components/InterviewScreen";
import { ResultScreen } from "./components/ResultScreen";
import { JobListScreen } from "./components/JobListScreen";
import { JobDetailScreen } from "./components/JobDetailScreen";
import { ProfileInfo } from "./components/ProfileInfo";
import { CoverLetter } from "./components/CoverLetter";
import { Navigation } from "./components/Navigation";

// ===== 라우트 키 상수 (오타/분기를 줄이기 위해 중앙관리) =====
const ROUTES = Object.freeze({
  MAIN: "main",
  INPUT: "input",
  INTERVIEW: "interview",
  RESULTS: "results",
  JOB_LIST: "jobList",
  JOB_DETAIL: "jobDetail",
  PROFILE: "profile",
  COVER_LETTER: "coverLetter",
});

export default function App() {
  const [route, setRoute] = useState(ROUTES.MAIN);

  // 전역 상태 (간단한 단일 파일 상태 관리)
  const [selectedJob, setSelectedJob] = useState(null);
  const [profileData, setProfileData] = useState(null); // ProfileInfo 저장본
  const [coverLetterData, setCoverLetterData] = useState(null); // CoverLetter 저장본
  const [interviewData, setInterviewData] = useState(null); // Interview 결과
  const [jobData, setJobData] = useState(null); // Interview 입력 데이터 (직무/회사/자소서/서류)

  const isDark = useColorScheme() === "dark";

  // ===== 네비게이션 헬퍼 =====
  const go = (next) => setRoute(next);

  const onBack = () => {
    switch (route) {
      case ROUTES.INPUT:
        go(ROUTES.MAIN);
        break;
      case ROUTES.INTERVIEW:
        go(selectedJob ? ROUTES.COVER_LETTER : ROUTES.INPUT);
        break;
      case ROUTES.RESULTS:
        go(ROUTES.INTERVIEW);
        break;
      case ROUTES.JOB_LIST:
        go(ROUTES.MAIN);
        break;
      case ROUTES.JOB_DETAIL:
        go(ROUTES.JOB_LIST);
        break;
      case ROUTES.COVER_LETTER:
        go(ROUTES.JOB_DETAIL);
        break;
      case ROUTES.PROFILE:
        go(ROUTES.MAIN);
        break;
      default:
        break;
    }
  };

  // ===== MainScreen 액션 =====
  const handleStartInterview = () => go(ROUTES.INPUT);
  const handleNavigateToJobList = () => go(ROUTES.JOB_LIST);
  const handleNavigateToProfile = () => go(ROUTES.PROFILE);

  // ===== JobList / JobDetail 흐름 =====
  const handleJobSelect = (job) => {
    setSelectedJob(job);
  };
  const handleNavigateFromList = (screen) => go(screen);
  const handleStartInterviewWithJob = (job) => {
    setSelectedJob(job);
    go(ROUTES.COVER_LETTER); // 공고 기반 플로우는 자기소개서 화면으로 연결
  };

  // ===== Profile 저장 =====
  const handleSaveProfile = (data) => {
    setProfileData(data);
    Alert.alert("알림", "개인정보가 저장되었습니다.");
  };

  // ===== CoverLetter 저장/면접 시작 =====
  const handleSaveCoverLetter = (data) => {
    setCoverLetterData(data);
    Alert.alert("알림", "자기소개서가 저장되었습니다.");
  };

  const handleStartInterviewFromCoverLetter = (jobWithCoverLetter) => {
    // CoverLetter 화면에서 넘어올 때 Interview가 바로 돌 수 있도록 입력 데이터 구성
    setSelectedJob(jobWithCoverLetter);
    setJobData({
      position: jobWithCoverLetter?.title || selectedJob?.title || "",
      company: jobWithCoverLetter?.company || selectedJob?.company || "",
      jobDescription: jobWithCoverLetter?.description || "",
      resume: profileData?.resumeFile || null,
      coverLetter:
        jobWithCoverLetter?.coverLetter || coverLetterData?.coverLetter || "",
      portfolioFile: coverLetterData?.portfolioFile || null,
    });
    go(ROUTES.INTERVIEW);
  };

  // ===== UserInput → Interview =====
  const handleContinueToInterview = (formData) => {
    setJobData({
      position: formData.jobTitle,
      company: formData.company,
      jobDescription: formData.jobDescription,
      resume: formData.resume,
      coverLetter: formData.coverLetter,
      portfolio: formData.portfolio,
    });
    go(ROUTES.INTERVIEW);
  };

  // ===== Interview 완료 → Result =====
  const handleCompleteInterview = (data) => {
    setInterviewData(data);
    go(ROUTES.RESULTS);
  };

  // ===== 다시 시작 =====
  const handleRestart = () => {
    setSelectedJob(null);
    setProfileData(null);
    setCoverLetterData(null);
    setInterviewData(null);
    setJobData(null);
    go(ROUTES.MAIN);
  };

  // ===== 네비게이션 타이틀 유틸 =====
  const navTitle = useMemo(() => {
    const titles = {
      [ROUTES.INPUT]: "면접 준비",
      [ROUTES.INTERVIEW]: "모의 면접",
      [ROUTES.RESULTS]: "면접 결과",
      [ROUTES.JOB_DETAIL]: "공고 상세",
      [ROUTES.PROFILE]: "내 정보 입력",
      [ROUTES.COVER_LETTER]: "자기소개서 작성",
    };
    return titles[route] || "";
  }, [route]);

  return (
    // NativeWind 사용 시 className을 통해 테마/토큰 사용 (프로젝트 설정 필요)
    <SafeAreaView className={`flex-1 ${isDark ? "dark" : ""}`}>
      <View className="flex-1 bg-background">
        {/* 공통 네비게이션 (main/jobList에서는 자동 숨김: 컴포넌트 로직) */}
        <Navigation currentScreen={route} onBack={onBack} title={navTitle} />

        {/* 라우팅 */}
        {route === ROUTES.MAIN && (
          <MainScreen
            onStartInterview={handleStartInterview}
            onNavigateToJobList={handleNavigateToJobList}
            onNavigateToProfile={handleNavigateToProfile}
          />
        )}

        {route === ROUTES.JOB_LIST && (
          <JobListScreen
            onJobSelect={handleJobSelect}
            onNavigate={handleNavigateFromList}
          />
        )}

        {route === ROUTES.JOB_DETAIL && (
          <JobDetailScreen
            selectedJob={selectedJob}
            onBack={onBack}
            onStartInterview={handleStartInterviewWithJob}
          />
        )}

        {route === ROUTES.INPUT && (
          <UserInputScreen
            onContinue={handleContinueToInterview}
            profileData={profileData}
          />
        )}

        {route === ROUTES.INTERVIEW && (
          <InterviewScreen
            jobData={jobData}
            onComplete={handleCompleteInterview}
          />
        )}

        {route === ROUTES.RESULTS && (
          <ResultScreen
            interviewData={interviewData}
            onRestart={handleRestart}
          />
        )}

        {route === ROUTES.PROFILE && (
          <ProfileInfo
            onSave={handleSaveProfile}
            onBack={onBack}
            initialData={profileData}
          />
        )}

        {route === ROUTES.COVER_LETTER && (
          <CoverLetter
            selectedJob={selectedJob}
            onSave={handleSaveCoverLetter}
            onStartInterview={handleStartInterviewFromCoverLetter}
            initialData={coverLetterData}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
