// App.jsx
import React, { useState } from "react";
import { SafeAreaView, View, Alert, useColorScheme } from "react-native";
import { MainScreen } from "./components/MainScreen";
import { UserInputScreen } from "./components/UserInputScreen";
import { InterviewScreen } from "./components/InterviewScreen";
import { ResultScreen } from "./components/ResultScreen";
import { JobListScreen } from "./components/JobListScreen";
import { JobDetailScreen } from "./components/JobDetailScreen";
import { ProfileInfo } from "./components/ProfileInfo";
import { CoverLetter } from "./components/CoverLetter";
import { Navigation } from "./components/Navigation";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("main");
  const [jobData, setJobData] = useState(null);
  const [interviewData, setInterviewData] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [coverLetterData, setCoverLetterData] = useState(null);

  const isDark = useColorScheme() === "dark";

  const handleStartInterview = () => setCurrentScreen("input");
  const handleNavigateToJobList = () => setCurrentScreen("jobList");
  const handleJobSelect = (job) => setSelectedJob(job);
  const handleNavigate = (screen) => setCurrentScreen(screen);

  const handleStartInterviewWithJob = (job) => {
    setSelectedJob(job);
    setCurrentScreen("coverLetter");
  };

  const handleNavigateToProfile = () => {
    console.log("프로필 화면으로 이동 중...");
    setCurrentScreen("profile");
  };

  const handleSaveProfile = (data) => {
    setProfileData(data);
    Alert.alert("알림", "개인정보가 저장되었습니다.");
  };

  const handleSaveCoverLetter = (data) => {
    setCoverLetterData(data);
    Alert.alert("알림", "자기소개서가 저장되었습니다.");
  };

  const handleStartInterviewFromCoverLetter = (jobWithCoverLetter) => {
    setSelectedJob(jobWithCoverLetter);
    setJobData({
      position: jobWithCoverLetter.title,
      company: jobWithCoverLetter.company,
      jobDescription: jobWithCoverLetter.description || "",
      resume: profileData?.resumeFile || null,
      coverLetter:
        jobWithCoverLetter.coverLetter || coverLetterData?.coverLetter || "",
      portfolioFile: coverLetterData?.portfolioFile || null,
    });
    setCurrentScreen("interview");
  };

  const handleContinueToInterview = (formData) => {
    setJobData({
      position: formData.jobTitle,
      company: formData.company,
      jobDescription: formData.jobDescription,
      resume: formData.resume,
      coverLetter: formData.coverLetter,
      portfolio: formData.portfolio,
    });
    setCurrentScreen("interview");
  };

  const handleCompleteInterview = (data) => {
    setInterviewData(data);
    setCurrentScreen("results");
  };

  const handleRestart = () => {
    setCurrentScreen("main");
    setJobData(null);
    setInterviewData(null);
    setSelectedJob(null);
    setCoverLetterData(null);
  };

  const handleBack = () => {
    switch (currentScreen) {
      case "input":
        setCurrentScreen("main");
        break;
      case "interview":
        setCurrentScreen(selectedJob ? "coverLetter" : "input");
        break;
      case "results":
        setCurrentScreen("interview");
        break;
      case "jobList":
        setCurrentScreen("main");
        break;
      case "jobDetail":
        setCurrentScreen("jobList");
        break;
      case "coverLetter":
        setCurrentScreen("jobDetail");
        break;
      case "profile":
        setCurrentScreen("main");
        break;
      default:
        break;
    }
  };

  // RN에서는 className을 쓰려면 NativeWind가 필요합니다(아래 2,3번 설정).
  return (
    <SafeAreaView className={`flex-1 ${isDark ? "dark" : ""}`}>
      <View className="flex-1 bg-background">
        <Navigation currentScreen={currentScreen} onBack={handleBack} />

        {currentScreen === "main" && (
          <MainScreen
            onStartInterview={handleStartInterview}
            onNavigateToJobList={handleNavigateToJobList}
            onNavigateToProfile={handleNavigateToProfile}
          />
        )}

        {currentScreen === "jobList" && (
          <JobListScreen
            onJobSelect={handleJobSelect}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === "jobDetail" && (
          <JobDetailScreen
            selectedJob={selectedJob}
            onBack={handleBack}
            onStartInterview={handleStartInterviewWithJob}
          />
        )}

        {currentScreen === "input" && (
          <UserInputScreen
            onContinue={handleContinueToInterview}
            profileData={profileData}
          />
        )}

        {currentScreen === "interview" && (
          <InterviewScreen
            jobData={jobData}
            onComplete={handleCompleteInterview}
          />
        )}

        {currentScreen === "results" && (
          <ResultScreen
            interviewData={interviewData}
            onRestart={handleRestart}
          />
        )}

        {currentScreen === "profile" && (
          <ProfileInfo
            onSave={handleSaveProfile}
            onBack={handleBack}
            initialData={profileData}
          />
        )}

        {currentScreen === "coverLetter" && (
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
