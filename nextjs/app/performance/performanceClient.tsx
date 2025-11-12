"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/dashboard/Navbar";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
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
  attemptNumber: number;
  selectedAnswer: number | null;
  correctAnswer: string | null; // Store as string (A, B, C, D) from API
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

        // Add difficulty filter if not "all"
        if (filterDifficulty !== "all") {
          queryParams.append("difficulty", filterDifficulty);
        }

        // Fetch performance data from API with pagination, search, and filters
        const apiUrl = `${getApiUrl(API_ENDPOINTS.USER_PRACTICE_EXAM)}/${
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
          // Get total questions from questions.question_ids array length
          const totalQuestions =
            item.questions?.question_ids?.length || queAnsDetails.length || 0;

          // Transform question attempts
          const questionAttempts: QuestionAttempt[] = queAnsDetails.map(
            (q: any, index: number) => ({
              questionId: q.question_id,
              attemptNumber: 1,
              selectedAnswer: q.selected_answer
                ? q.selected_answer.toUpperCase().charCodeAt(0) - 65
                : null,
              correctAnswer: q.correct_option || null, // Get correct_option from API response
              isCorrect: q.status === 1,
              status: q.status, // Store status to check for not attempted
              timestamp: attemptDetails.start_time || item.created_at,
              timeSpent: 0, // We don't have this in the response
            })
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
          const statsUrl = `${getApiUrl(API_ENDPOINTS.USER_PRACTICE_EXAM)}/${
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
  }, [router, currentPage, filterDifficulty, searchQuery]);

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
      averageScore: Math.round(statistics.average_score * 100), // Convert decimal to percentage
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <Input
                  type="text"
                  placeholder="Search by exam, topic, or section..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Difficulty
                </label>
                <Select
                  value={filterDifficulty}
                  onValueChange={setFilterDifficulty}
                >
                  <SelectTrigger className="w-full">
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
            </div>
          </div>

          {/* Performance History */}
          {filteredData.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Performance Data
              </h3>
              <p className="text-gray-600 mb-6">
                Complete some practice tests to see your performance here.
              </p>
              <a
                href="/practice"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                Start Practicing
              </a>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Exam/Section/Syllabus
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Difficulty
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Score
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Questions
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Time
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Date & Time
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item) => {
                      const percentage =
                        item.totalQuestions > 0
                          ? Math.round((item.score / item.totalQuestions) * 100)
                          : null;
                      return (
                        <tr
                          key={item.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.examName}
                                {item.grade !== null && item.level !== null && (
                                  <span className="ml-2 text-sm font-normal text-gray-600">
                                    (Grade {item.grade}, Level {item.level})
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-600">
                                Section: {item.sectionName}
                              </p>
                              <p className="text-sm text-gray-600">
                                Syllabus: {item.topicName}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                item.difficulty.toLowerCase() === "easy"
                                  ? "bg-green-100 text-green-700"
                                  : item.difficulty.toLowerCase() === "medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.difficulty.charAt(0).toUpperCase() +
                                item.difficulty.slice(1).toLowerCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <span className="font-semibold text-gray-900">
                                {item.score}/{item.totalQuestions}
                              </span>
                              {percentage !== null ? (
                                <span
                                  className={`ml-2 text-sm font-medium ${
                                    percentage >= 80
                                      ? "text-green-600"
                                      : percentage >= 60
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  ({percentage}%)
                                </span>
                              ) : (
                                <span className="ml-2 text-sm font-medium text-gray-500">
                                  (-)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            <div className="text-sm">
                              <span className="text-green-600">
                                ✓ {item.correctAnswers}
                              </span>
                              {" / "}
                              <span className="text-red-600">
                                ✗ {item.incorrectAnswers}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {formatTime(item.timeSpent)}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            <div>
                              {new Date(item.date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                              <br />
                              <span className="text-xs text-gray-500">
                                {new Date(item.date).toLocaleTimeString()}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => setSelectedRecord(item)}
                              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(
                      endIndex,
                      paginationInfo?.total || filteredData.length
                    )}{" "}
                    of {paginationInfo?.total || filteredData.length} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={
                        !paginationInfo?.has_previous && currentPage === 1
                      }
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        !paginationInfo?.has_previous && currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => {
                          // Show first page, last page, current page, and pages around current
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-2 rounded-lg font-medium transition ${
                                  currentPage === page
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return (
                              <span key={page} className="px-2 text-gray-500">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={
                        !paginationInfo?.has_next && currentPage === totalPages
                      }
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        !paginationInfo?.has_next && currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Detailed Attempt Modal */}
          {selectedRecord && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Attempt Details
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {selectedRecord.examName}
                        {selectedRecord.grade !== null &&
                          selectedRecord.level !== null && (
                            <span className="ml-2 text-sm">
                              (Grade {selectedRecord.grade}, Level{" "}
                              {selectedRecord.level})
                            </span>
                          )}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Section: {selectedRecord.sectionName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Syllabus: {selectedRecord.topicName}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Date:{" "}
                        {new Date(selectedRecord.date).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        )}{" "}
                        {new Date(selectedRecord.date).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedRecord(null)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">
                        Total Questions
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedRecord.totalQuestions}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Correct</p>
                      <p className="text-2xl font-bold text-green-600">
                        {selectedRecord.correctAnswers}
                      </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Incorrect</p>
                      <p className="text-2xl font-bold text-red-600">
                        {selectedRecord.incorrectAnswers}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Time Spent</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatTime(selectedRecord.timeSpent)}
                      </p>
                    </div>
                  </div>

                  {/* Question Attempts */}
                  {selectedRecord.questionAttempts &&
                  selectedRecord.questionAttempts.length > 0 ? (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Question-by-Question Breakdown
                      </h3>
                      <div className="space-y-3">
                        {selectedRecord.questionAttempts.map(
                          (attempt, index) => {
                            const isNotAttempted = attempt.status === 0;
                            const isCorrect = attempt.isCorrect;
                            return (
                              <div
                                key={`${attempt.questionId}-${attempt.attemptNumber}`}
                                className={`p-4 rounded-lg border-2 ${
                                  isNotAttempted
                                    ? "bg-gray-50 border-gray-300"
                                    : isCorrect
                                    ? "bg-green-50 border-green-200"
                                    : "bg-red-50 border-red-200"
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                        isNotAttempted
                                          ? "bg-gray-500 text-white"
                                          : isCorrect
                                          ? "bg-green-600 text-white"
                                          : "bg-red-600 text-white"
                                      }`}
                                    >
                                      Question {index + 1}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      {new Date(
                                        attempt.timestamp
                                      ).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                      isNotAttempted
                                        ? "bg-gray-200 text-gray-800"
                                        : isCorrect
                                        ? "bg-green-200 text-green-800"
                                        : "bg-red-200 text-red-800"
                                    }`}
                                  >
                                    {isNotAttempted
                                      ? "Not Attempted"
                                      : isCorrect
                                      ? "✓ Correct"
                                      : "✗ Incorrect"}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mt-3 text-sm">
                                  <div>
                                    <p className="text-gray-600 mb-1">
                                      Selected Answer
                                    </p>
                                    <p className="font-semibold text-gray-900">
                                      {attempt.selectedAnswer !== null
                                        ? String.fromCharCode(
                                            65 + attempt.selectedAnswer
                                          )
                                        : "Not answered"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600 mb-1">
                                      Correct Answer
                                    </p>
                                    <p className="font-semibold text-green-600">
                                      {attempt.correctAnswer || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>
                        Detailed question attempts not available for this
                        record.
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
