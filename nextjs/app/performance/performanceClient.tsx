"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../components/dashboard/Navbar";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import PerformanceHistory from "../../components/performance_comp/performance_history";
import PerformanceViewDetails from "../../components/performance_comp/performance_view_details";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type QuestionAttempt = {
  questionId: number;
  question_no: number; // Question number from que_ans_details
  question_text: string; // Question text from questions_data
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string; // Correct option from questions_data (A, B, C, D)
  selected_answer: string | null; // Selected answer from que_ans_details
  solution: string; // Solution from questions_data
  attemptNumber: number;
  selectedAnswer: number | null; // Keep for backward compatibility
  correctAnswer: string | null; // Keep for backward compatibility
  isCorrect: boolean;
  status?: number; // 0 = not attempted, 1 = correct, 2 = incorrect
  timestamp: string;
  timeSpent: number; // in seconds
};

type PerformanceData = {
  id: string;
  examName: string;
  examId: number;
  grade: number | null;
  level: number | null;
  sectionId: number;
  sectionName: string;
  syllabusId: number;
  topicName: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number; // in seconds
  date: string;
  questionAttempts?: QuestionAttempt[];
};

type Stats = {
  totalAttempts: number;
  averageScore: number;
  totalQuestionsAnswered: number;
  totalTimeSpent: number; // in seconds
  bestScore: number;
  weakestSubject: string;
};

// Helper function to format time in hours, minutes, and seconds
const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds}s`);
  }

  return parts.join(" ");
};

export default function PerformanceClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examType = searchParams.get("type"); // "section" or "syllabus"
  const isSectionExam = examType === "section";
  const [userData, setUserData] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  console.log("stats", stats);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<PerformanceData | null>(
    null
  );
  console.log("selectedRecord", selectedRecord);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [paginationInfo, setPaginationInfo] = useState<{
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  } | null>(null);
  const [totalAttemptsFromStats, setTotalAttemptsFromStats] = useState<
    number | null
  >(null);
  const [totalTimeFromAllAttempts, setTotalTimeFromAllAttempts] = useState<
    number | null
  >(null);
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(new Set());
  const [apiStatistics, setApiStatistics] = useState<{
    total_time: number;
    best_score: number;
    average_score: number;
    total_attempts: number;
  } | null>(null);

  useEffect(() => {
    // Check authentication
    const authenticated = localStorage.getItem("authenticated");
    const storedUserData = localStorage.getItem("user_data");

    if (!authenticated || !storedUserData) {
      router.push("/login");
      return;
    }

    const fetchPerformanceData = async () => {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);

        if (!parsedUserData || !parsedUserData.user_id) {
          console.error("User ID not found");
          setIsLoading(false);
          return;
        }

        // Build query parameters for API call
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          page_size: itemsPerPage.toString(),
        });

        // Add search parameter if provided
        if (searchQuery.trim()) {
          queryParams.append("search", searchQuery.trim());
        }

        // Add difficulty filter if not "all" and not section exam flow
        if (filterDifficulty !== "all" && !isSectionExam) {
          queryParams.append("difficulty", filterDifficulty);
        }

        // Fetch performance data from API with pagination, search, and filters
        // Use different API endpoint based on exam type (section or syllabus)
        const apiEndpoint = isSectionExam
          ? API_ENDPOINTS.USER_PRACTICE_SECTION_EXAM
          : API_ENDPOINTS.USER_PRACTICE_EXAM;
        const apiUrl = `${getApiUrl(apiEndpoint)}/${
          parsedUserData.user_id
        }?${queryParams.toString()}`;

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          mode: "cors",
        });

        const responseText = await response.text();
        console.log("Performance API Response:", responseText);

        if (!response.ok) {
          throw new Error(
            responseText ||
              `Failed to fetch performance data: ${response.status}`
          );
        }

        let apiResponse: any;
        try {
          apiResponse = responseText
            ? JSON.parse(responseText)
            : { data: [], pagination: null };
        } catch (parseError) {
          console.error("Failed to parse JSON:", parseError);
          throw new Error("Invalid response from server");
        }

        // Extract data, pagination, and statistics from response
        const apiData = apiResponse.data || [];
        const pagination = apiResponse.pagination || null;
        const statistics = apiResponse.statistics || null;

        if (pagination) {
          setPaginationInfo(pagination);
        }

        // Store statistics from API response
        if (statistics) {
          setApiStatistics(statistics);
        }

        // Transform API data to PerformanceData format
        const transformedData: Array<PerformanceData & { sortDate: string }> =
          [];

        for (const item of apiData) {
          const attemptDetails = item.practice_exam_attempt_details;
          if (!attemptDetails) continue;

          // Get exam name from exam_overview in response
          const examName =
            item.exam_overview?.exam || `Exam ${item.exam_overview_id}`;

          // Get grade and level from exam_overview in response
          const grade = item.exam_overview?.grade || null;
          const level = item.exam_overview?.level || null;

          // Get section name from section in response
          const sectionName =
            item.section?.section || `Section ${item.section_id}`;

          // Get topic name from syllabus in response
          const topicName = item.syllabus?.topic || `Topic ${item.syllabus_id}`;
          // Get subtopic name from syllabus in response
          const subtopicName = item.syllabus?.subtopic || null;
          // Combine topic and subtopic for display
          const displayName = subtopicName
            ? `${topicName} - ${subtopicName}`
            : topicName;

          // Process que_ans_details
          const queAnsDetails = attemptDetails.que_ans_details || [];
          const correctAnswers = queAnsDetails.filter(
            (q: any) => q.status === 1
          ).length;
          const incorrectAnswers = queAnsDetails.filter(
            (q: any) => q.status === 2
          ).length;

          // Get questions_data from API response (only for syllabus flow)
          const questionsData = item.questions?.questions_data || [];

          // Get total questions - for section flow use que_ans_details.length, for syllabus flow use questions_data.length
          const totalQuestions = isSectionExam
            ? queAnsDetails.length || 0
            : questionsData.length || queAnsDetails.length || 0;

          // Transform question attempts - use questions_data as source, match with que_ans_details
          const questionAttempts: QuestionAttempt[] = questionsData.map(
            (question: any) => {
              // Find matching entry in que_ans_details by question_id
              const queAnsDetail = queAnsDetails.find(
                (q: any) => q.question_id === question.question_id
              );

              return {
                questionId: question.question_id,
                question_no: queAnsDetail?.question_no || 0,
                question_text: question.question_text || "",
                option_a: question.option_a || "",
                option_b: question.option_b || "",
                option_c: question.option_c || "",
                option_d: question.option_d || "",
                correct_option: question.correct_option || "", // From questions_data
                selected_answer: queAnsDetail?.selected_answer || null, // From que_ans_details
                solution: question.solution || "", // From questions_data
                attemptNumber: 1,
                selectedAnswer: queAnsDetail?.selected_answer
                  ? queAnsDetail.selected_answer.toUpperCase().charCodeAt(0) -
                    65
                  : null,
                correctAnswer: question.correct_option || null, // From questions_data
                isCorrect: queAnsDetail?.status === 1,
                status: queAnsDetail?.status ?? 0, // Store status to check for not attempted
                timestamp: attemptDetails.start_time || item.created_at,
                timeSpent: 0, // We don't have this in the response
              };
            }
          );

          const sortDate = attemptDetails.start_time || item.created_at;

          transformedData.push({
            id: `${item.user_practice_exam_id}-${attemptDetails.practice_exam_attempt_details_id}`,
            examName: examName,
            examId: item.exam_overview_id,
            grade: grade,
            level: level,
            sectionId: item.section_id,
            sectionName: sectionName,
            syllabusId: item.syllabus_id,
            topicName: displayName,
            difficulty: item.difficulty,
            score: attemptDetails.score || correctAnswers,
            totalQuestions: totalQuestions || 0,
            correctAnswers: correctAnswers,
            incorrectAnswers: incorrectAnswers,
            timeSpent: attemptDetails.total_time || 0, // Store in seconds
            date:
              attemptDetails.end_time ||
              attemptDetails.start_time ||
              item.created_at,
            questionAttempts: questionAttempts,
            sortDate: sortDate,
          });
        }

        // Sort by start_time (most recent first)
        transformedData.sort((a, b) => {
          const dateA = new Date(a.sortDate).getTime();
          const dateB = new Date(b.sortDate).getTime();
          return dateB - dateA; // Descending order (most recent first)
        });

        // Remove sortDate before setting state
        const finalData: PerformanceData[] = transformedData.map(
          ({ sortDate, ...rest }) => rest
        );

        setPerformanceData(finalData);

        // Use statistics from API response if available
        if (statistics) {
          // Use statistics from the filtered API response
          setTotalAttemptsFromStats(statistics.total_attempts);
          setTotalTimeFromAllAttempts(statistics.total_time);
          calculateStatsFromApi(statistics, finalData);
        } else {
          // Fallback: Fetch stats separately without filters/search to get total attempts and total time
          // Use different API endpoint for stats based on exam type
          const statsEndpoint = isSectionExam
            ? API_ENDPOINTS.USER_PRACTICE_SECTION_EXAM
            : API_ENDPOINTS.USER_PRACTICE_EXAM;
          const statsUrl = `${getApiUrl(statsEndpoint)}/${
            parsedUserData.user_id
          }?page=1&page_size=1000`; // Large page size to get all records for stats

          const statsResponse = await fetch(statsUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            mode: "cors",
          });

          if (statsResponse.ok) {
            const statsResponseText = await statsResponse.text();
            try {
              const statsApiResponse = statsResponseText
                ? JSON.parse(statsResponseText)
                : { data: [], pagination: null, statistics: null };
              const statsPagination = statsApiResponse.pagination || null;
              const statsData = statsApiResponse.data || [];
              const statsStatistics = statsApiResponse.statistics || null;

              if (statsStatistics) {
                // Use statistics from unfiltered API response
                setTotalAttemptsFromStats(statsStatistics.total_attempts);
                setTotalTimeFromAllAttempts(statsStatistics.total_time);
                calculateStatsFromApi(statsStatistics, finalData);
              } else {
                // Fallback: Calculate from data
                let calculatedTotalTime = 0;
                statsData.forEach((item: any) => {
                  const attemptDetails = item.practice_exam_attempt_details;
                  if (attemptDetails && attemptDetails.total_time) {
                    calculatedTotalTime += attemptDetails.total_time;
                  }
                });

                setTotalTimeFromAllAttempts(calculatedTotalTime);

                if (statsPagination) {
                  setTotalAttemptsFromStats(statsPagination.total);
                  calculateStats(
                    finalData,
                    statsPagination.total,
                    calculatedTotalTime
                  );
                } else {
                  calculateStats(finalData, null, calculatedTotalTime);
                }
              }
            } catch (parseError) {
              console.error("Failed to parse stats JSON:", parseError);
              calculateStats(finalData, null, 0);
            }
          } else {
            // Fallback if stats API fails
            calculateStats(finalData, null, 0);
          }
        }
      } catch (error) {
        console.error("Error loading performance data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformanceData();
  }, [
    router,
    currentPage,
    filterDifficulty,
    searchQuery,
    examType,
    isSectionExam,
  ]);

  // Calculate stats from API statistics object
  const calculateStatsFromApi = (
    statistics: {
      total_time: number;
      best_score: number;
      average_score: number;
      total_attempts: number;
    },
    data?: PerformanceData[]
  ) => {
    // Calculate total questions answered from provided data or current performanceData
    const dataToUse = data || performanceData;
    const totalQuestionsAnswered = dataToUse.reduce(
      (sum, d) => sum + d.totalQuestions,
      0
    );

    setStats({
      totalAttempts: statistics.total_attempts,
      averageScore: Math.round(statistics.average_score),
      totalQuestionsAnswered: totalQuestionsAnswered,
      totalTimeSpent: statistics.total_time, // Already in seconds
      bestScore: Math.round(statistics.best_score), // Already a percentage
      weakestSubject: "N/A", // Not available in statistics
    });
  };

  const calculateStats = (
    data: PerformanceData[],
    totalAttemptsFromApi?: number | null,
    totalTimeFromAllAttempts?: number
  ) => {
    // Use stored total attempts from stats API if available, otherwise use provided value or data length
    const totalAttempts =
      totalAttemptsFromStats !== null
        ? totalAttemptsFromStats
        : totalAttemptsFromApi !== null && totalAttemptsFromApi !== undefined
        ? totalAttemptsFromApi
        : data.length;

    if (data.length === 0) {
      setStats({
        totalAttempts: totalAttempts,
        averageScore: 0,
        totalQuestionsAnswered: 0,
        totalTimeSpent: totalTimeFromAllAttempts ?? 0,
        bestScore: 0,
        weakestSubject: "N/A",
      });
      return;
    }
    const totalQuestions = data.reduce((sum, d) => sum + d.totalQuestions, 0);
    const totalCorrect = data.reduce((sum, d) => sum + d.correctAnswers, 0);
    // Use totalTimeFromAllAttempts if filter is "all", otherwise use filtered data
    const filteredTime = data.reduce((sum, d) => sum + d.timeSpent, 0);
    const totalTime: number =
      filterDifficulty === "all" &&
      totalTimeFromAllAttempts !== null &&
      totalTimeFromAllAttempts !== undefined
        ? totalTimeFromAllAttempts
        : filteredTime; // Total in seconds
    const scores = data
      .filter((d) => d.totalQuestions > 0) // Filter out zero division cases
      .map((d) => (d.score / d.totalQuestions) * 100);
    const averageScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

    // Find weakest subject (subject with lowest average score)
    const subjectScores: Record<string, number[]> = {};
    data.forEach((d) => {
      if (!subjectScores[d.examName]) {
        subjectScores[d.examName] = [];
      }
      // Only add score if totalQuestions > 0 to avoid NaN
      if (d.totalQuestions > 0) {
        subjectScores[d.examName].push((d.score / d.totalQuestions) * 100);
      }
    });

    let weakestSubject = "N/A";
    let lowestAvg = 100;
    Object.entries(subjectScores).forEach(([subject, scores]) => {
      if (scores.length > 0) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (avg < lowestAvg && !isNaN(avg)) {
          lowestAvg = avg;
          weakestSubject = subject;
        }
      }
    });

    setStats({
      totalAttempts,
      averageScore: Math.round(averageScore),
      totalQuestionsAnswered: totalQuestions,
      totalTimeSpent: totalTime,
      bestScore: Math.round(bestScore),
      weakestSubject,
    });
  };

  const filteredData = performanceData.filter((item) => {
    // Skip difficulty filtering for section exam flow
    if (isSectionExam) {
      return true;
    }
    const matchesDifficulty =
      filterDifficulty === "all" ||
      item.difficulty.toLowerCase() === filterDifficulty.toLowerCase();

    return matchesDifficulty;
  });

  // Use API pagination info if available, otherwise calculate from filtered data
  const totalPages =
    paginationInfo?.total_pages ||
    Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = paginationInfo
    ? (paginationInfo.page - 1) * paginationInfo.page_size
    : (currentPage - 1) * itemsPerPage;
  const endIndex = paginationInfo
    ? startIndex + paginationInfo.page_size
    : startIndex + itemsPerPage;
  const paginatedData = filteredData; // Data is already paginated from API

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDifficulty, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="md:ml-64">
        <div className="container mx-auto px-4 md:px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Performance</h1>
            <p className="text-gray-600 mt-1">
              Track your progress and analyze your performance
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Attempts</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.totalAttempts}
                    </p>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Average Score</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {stats.averageScore}%
                    </p>
                  </div>
                  <div className="text-4xl">📈</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Best Score</p>
                    <p className="text-3xl font-bold text-green-600">
                      {stats.bestScore}%
                    </p>
                  </div>
                  <div className="text-4xl">🏆</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Time Spent</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatTime(stats.totalTimeSpent)}
                    </p>
                  </div>
                  <div className="text-4xl">⏰</div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <Input
                  type="text"
                  placeholder={
                    isSectionExam
                      ? "Search by exam or section..."
                      : "Search by exam, section, topic or subtopic..."
                  }
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  className="w-full text-sm sm:text-base"
                />
              </div>
              {!isSectionExam && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Difficulty
                  </label>
                  <Select
                    value={filterDifficulty}
                    onValueChange={setFilterDifficulty}
                  >
                    <SelectTrigger className="w-full text-sm sm:text-base">
                      <SelectValue placeholder="All Difficulties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <PerformanceHistory
            filteredData={filteredData}
            paginatedData={paginatedData}
            paginationInfo={paginationInfo}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            isSectionExam={isSectionExam}
            formatTime={formatTime}
            setSelectedRecord={setSelectedRecord}
            startIndex={startIndex}
            endIndex={endIndex}
          />

          <PerformanceViewDetails
            selectedRecord={selectedRecord}
            setSelectedRecord={setSelectedRecord}
            isSectionExam={isSectionExam}
            formatTime={formatTime}
            openQuestions={openQuestions}
            setOpenQuestions={setOpenQuestions}
          />
        </div>
      </main>
    </div>
  );
}
