"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/dashboard/Navbar";
import { getApiUrl, API_ENDPOINTS } from "../config/api";

type QuestionAttempt = {
  questionId: number;
  attemptNumber: number;
  selectedAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
  timestamp: string;
  timeSpent: number; // in seconds
};

type PerformanceData = {
  id: string;
  examName: string;
  examId: number;
  sectionId: number;
  sectionName: string;
  syllabusId: number;
  topicName: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number; // in minutes
  date: string;
  questionAttempts?: QuestionAttempt[];
};

type Stats = {
  totalAttempts: number;
  averageScore: number;
  totalQuestionsAnswered: number;
  totalTimeSpent: number;
  bestScore: number;
  weakestSubject: string;
};

export default function PerformanceClient() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState<PerformanceData | null>(
    null
  );

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

        // Fetch performance data from API
        const response = await fetch(
          `${getApiUrl(API_ENDPOINTS.USER_PRACTICE_EXAM)}/${
            parsedUserData.user_id
          }`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            mode: "cors",
          }
        );

        const responseText = await response.text();
        console.log("Performance API Response:", responseText);

        if (!response.ok) {
          throw new Error(
            responseText ||
              `Failed to fetch performance data: ${response.status}`
          );
        }

        let apiData: any;
        try {
          apiData = responseText ? JSON.parse(responseText) : [];
        } catch (parseError) {
          console.error("Failed to parse JSON:", parseError);
          throw new Error("Invalid response from server");
        }

        // Fetch exams to get exam names
        const examsResponse = await fetch(getApiUrl(API_ENDPOINTS.EXAMS), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          mode: "cors",
        });

        const examsText = await examsResponse.text();
        let examsData: any[] = [];
        if (examsResponse.ok && examsText) {
          try {
            const parsedExams = JSON.parse(examsText);
            if (Array.isArray(parsedExams)) {
              examsData = parsedExams;
            } else {
              examsData = parsedExams.exams || parsedExams.data || [];
            }
          } catch (e) {
            console.error("Failed to parse exams:", e);
          }
        }

        // Transform API data to PerformanceData format
        const transformedData: Array<PerformanceData & { sortDate: string }> =
          [];

        for (const item of apiData) {
          const attemptDetails = item.practice_exam_attempt_details;
          if (!attemptDetails) continue;

          // Find exam name
          const exam = Array.isArray(examsData)
            ? examsData.find(
                (e) => e.exam_overview_id === item.exam_overview_id
              )
            : null;
          const examName = exam?.exam || `Exam ${item.exam_overview_id}`;

          // Fetch section name
          let sectionName = `Section ${item.section_id}`;
          try {
            const sectionResponse = await fetch(
              `${getApiUrl(API_ENDPOINTS.SECTIONS)}/${
                item.exam_overview_id
              }/sections`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                mode: "cors",
              }
            );
            const sectionText = await sectionResponse.text();
            if (sectionResponse.ok && sectionText) {
              const sectionsData = JSON.parse(sectionText);
              const sections = Array.isArray(sectionsData)
                ? sectionsData
                : sectionsData.sections || sectionsData.data || [];
              const section = sections.find(
                (s: any) => s.section_id === item.section_id
              );
              if (section) {
                sectionName = section.section || sectionName;
              }
            }
          } catch (e) {
            console.error("Failed to fetch section:", e);
          }

          // Fetch topic name from syllabus
          let topicName = `Topic ${item.syllabus_id}`;
          try {
            const syllabusResponse = await fetch(
              `${getApiUrl(API_ENDPOINTS.SYLLABUS)}/${
                item.section_id
              }/syllabus`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                mode: "cors",
              }
            );
            const syllabusText = await syllabusResponse.text();
            if (syllabusResponse.ok && syllabusText) {
              const syllabusData = JSON.parse(syllabusText);
              const syllabusItems = Array.isArray(syllabusData)
                ? syllabusData
                : syllabusData.syllabus || syllabusData.data || [];
              const syllabusItem = syllabusItems.find(
                (s: any) => s.syllabus_id === item.syllabus_id
              );
              if (syllabusItem) {
                topicName =
                  syllabusItem.topic || syllabusItem.subtopic || topicName;
              }
            }
          } catch (e) {
            console.error("Failed to fetch syllabus:", e);
          }

          // Process que_ans_details
          const queAnsDetails = attemptDetails.que_ans_details || [];
          const correctAnswers = queAnsDetails.filter(
            (q: any) => q.status === 1
          ).length;
          const incorrectAnswers = queAnsDetails.filter(
            (q: any) => q.status === 2
          ).length;
          const totalQuestions = queAnsDetails.length;

          // Transform question attempts
          const questionAttempts: QuestionAttempt[] = queAnsDetails.map(
            (q: any, index: number) => ({
              questionId: q.question_id,
              attemptNumber: 1,
              selectedAnswer: q.selected_answer
                ? q.selected_answer.toUpperCase().charCodeAt(0) - 65
                : null,
              correctAnswer: 0, // We don't have this in the response
              isCorrect: q.status === 1,
              timestamp: attemptDetails.start_time || item.created_at,
              timeSpent: 0, // We don't have this in the response
            })
          );

          const sortDate = attemptDetails.start_time || item.created_at;

          transformedData.push({
            id: `${item.user_practice_exam_id}-${attemptDetails.practice_exam_attempt_details_id}`,
            examName: examName,
            examId: item.exam_overview_id,
            sectionId: item.section_id,
            sectionName: sectionName,
            syllabusId: item.syllabus_id,
            topicName: topicName,
            difficulty: item.difficulty,
            score: attemptDetails.score || correctAnswers,
            totalQuestions: totalQuestions || 0,
            correctAnswers: correctAnswers,
            incorrectAnswers: incorrectAnswers,
            timeSpent: attemptDetails.total_time
              ? Math.round(attemptDetails.total_time / 60)
              : 0,
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
        calculateStats(finalData);
      } catch (error) {
        console.error("Error loading performance data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformanceData();
  }, [router]);

  const calculateStats = (data: PerformanceData[]) => {
    if (data.length === 0) {
      setStats({
        totalAttempts: 0,
        averageScore: 0,
        totalQuestionsAnswered: 0,
        totalTimeSpent: 0,
        bestScore: 0,
        weakestSubject: "N/A",
      });
      return;
    }

    const totalAttempts = data.length;
    const totalQuestions = data.reduce((sum, d) => sum + d.totalQuestions, 0);
    const totalCorrect = data.reduce((sum, d) => sum + d.correctAnswers, 0);
    const totalTime = data.reduce((sum, d) => sum + d.timeSpent, 0);
    const scores = data.map((d) => (d.score / d.totalQuestions) * 100);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const bestScore = Math.max(...scores);

    // Find weakest subject (subject with lowest average score)
    const subjectScores: Record<string, number[]> = {};
    data.forEach((d) => {
      if (!subjectScores[d.examName]) {
        subjectScores[d.examName] = [];
      }
      subjectScores[d.examName].push((d.score / d.totalQuestions) * 100);
    });

    let weakestSubject = "N/A";
    let lowestAvg = 100;
    Object.entries(subjectScores).forEach(([subject, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg < lowestAvg) {
        lowestAvg = avg;
        weakestSubject = subject;
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

    let matchesDate = true;
    if (filterDateRange !== "all") {
      const itemDate = new Date(item.date);
      const now = new Date();
      const daysAgo = parseInt(filterDateRange);

      matchesDate =
        itemDate.getTime() >= now.getTime() - daysAgo * 24 * 60 * 60 * 1000;
    }

    return matchesDifficulty && matchesDate;
  });

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
                      {stats.totalTimeSpent}m
                    </p>
                  </div>
                  <div className="text-4xl">⏰</div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Difficulty
                </label>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Date
                </label>
                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
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
                        Exam/Topic
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
                    {filteredData.map((item) => {
                      const percentage =
                        item.totalQuestions > 0
                          ? Math.round((item.score / item.totalQuestions) * 100)
                          : 0;
                      return (
                        <tr
                          key={item.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.examName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {item.topicName}
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
                            {item.timeSpent} min
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            <div>
                              {new Date(item.date).toLocaleDateString()}
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
            </div>
          )}

          {/* Detailed Attempt Modal */}
          {selectedRecord && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Attempt Details
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {selectedRecord.examName} - {selectedRecord.topicName}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Date: {new Date(selectedRecord.date).toLocaleString()}
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
                        {selectedRecord.timeSpent}m
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
                          (attempt, index) => (
                            <div
                              key={`${attempt.questionId}-${attempt.attemptNumber}`}
                              className={`p-4 rounded-lg border-2 ${
                                attempt.isCorrect
                                  ? "bg-green-50 border-green-200"
                                  : "bg-red-50 border-red-200"
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                      attempt.isCorrect
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
                                    attempt.isCorrect
                                      ? "bg-green-200 text-green-800"
                                      : "bg-red-200 text-red-800"
                                  }`}
                                >
                                  {attempt.isCorrect
                                    ? "✓ Correct"
                                    : "✗ Incorrect"}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
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
                                    {String.fromCharCode(
                                      65 + attempt.correctAnswer
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600 mb-1">
                                    Attempt Number
                                  </p>
                                  <p className="font-semibold text-gray-900">
                                    {attempt.attemptNumber}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600 mb-1">
                                    Time Spent
                                  </p>
                                  <p className="font-semibold text-gray-900">
                                    {attempt.timeSpent}s
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
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
