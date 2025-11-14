"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "../../../../../components/dashboard/Navbar";
import { getApiUrl, API_ENDPOINTS } from "../../../../../config/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SyllabusItem = {
  syllabus_id: number;
  exam_overview_id: number;
  section_id: number;
  topic: string;
  subtopic: string;
};

type GroupedTopic = {
  topic: string;
  syllabusItems: SyllabusItem[];
};

export default function TopicsPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.examId as string;
  const sectionId = params.sectionId as string;
  const [userData, setUserData] = useState<any>(null);
  const [groupedTopics, setGroupedTopics] = useState<GroupedTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  // Track difficulty for each topic (using topic name as key)
  const [topicDifficulties, setTopicDifficulties] = useState<
    Record<string, string>
  >({});
  // Track question counts for each syllabus_id
  const [questionCounts, setQuestionCounts] = useState<Record<number, number>>(
    {}
  );

  useEffect(() => {
    // Check if user is authenticated
    const authenticated = localStorage.getItem("authenticated");
    const storedUserData = localStorage.getItem("user_data");

    if (!authenticated || !storedUserData) {
      router.push("/login");
      return;
    }

    try {
      setUserData(JSON.parse(storedUserData));
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    // Fetch syllabus (topics and subtopics) from API
    const fetchSyllabus = async () => {
      if (!userData || !sectionId) return;

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${getApiUrl(API_ENDPOINTS.SYLLABUS)}/${sectionId}/syllabus`,
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
        console.log("Syllabus API Response:", responseText);

        if (!response.ok) {
          throw new Error(
            responseText || `Failed to fetch syllabus: ${response.status}`
          );
        }

        let data: any;
        try {
          data = responseText ? JSON.parse(responseText) : [];
        } catch (parseError) {
          console.error("Failed to parse JSON:", parseError);
          throw new Error("Invalid response from server");
        }

        // Handle both array and object responses
        const syllabusData: SyllabusItem[] = Array.isArray(data)
          ? data
          : data.syllabus || data.data || [];

        // Group by topic
        const topicMap = new Map<string, SyllabusItem[]>();
        syllabusData.forEach((item) => {
          const topicKey = item.topic || "Uncategorized";
          if (!topicMap.has(topicKey)) {
            topicMap.set(topicKey, []);
          }
          topicMap.get(topicKey)!.push(item);
        });

        // Convert to grouped structure
        const grouped: GroupedTopic[] = Array.from(topicMap.entries()).map(
          ([topic, items]) => ({
            topic,
            syllabusItems: items,
          })
        );

        setGroupedTopics(grouped);

        // Initialize difficulty to "Easy" for each topic
        const initialDifficulties: Record<string, string> = {};
        grouped.forEach((group) => {
          initialDifficulties[group.topic] = "Easy";
        });
        setTopicDifficulties(initialDifficulties);

        // Fetch question counts for each syllabus item
        const counts: Record<number, number> = {};
        const fetchPromises = syllabusData.map(async (item) => {
          try {
            const questionsResponse = await fetch(
              `${getApiUrl(API_ENDPOINTS.QUESTIONS)}/${
                item.syllabus_id
              }/questions`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                mode: "cors",
              }
            );

            if (questionsResponse.ok) {
              const questionsText = await questionsResponse.text();
              try {
                const questionsData = questionsText
                  ? JSON.parse(questionsText)
                  : [];
                const questionsArray = Array.isArray(questionsData)
                  ? questionsData
                  : questionsData.questions || questionsData.data || [];
                // Count only active questions
                const activeQuestions = questionsArray.filter(
                  (q: any) => q.is_active
                );
                counts[item.syllabus_id] = activeQuestions.length;
              } catch (parseError) {
                console.error(
                  `Failed to parse questions for syllabus ${item.syllabus_id}:`,
                  parseError
                );
                counts[item.syllabus_id] = 0;
              }
            } else {
              counts[item.syllabus_id] = 0;
            }
          } catch (error) {
            console.error(
              `Error fetching questions for syllabus ${item.syllabus_id}:`,
              error
            );
            counts[item.syllabus_id] = 0;
          }
        });

        // Wait for all question count fetches to complete
        await Promise.all(fetchPromises);
        setQuestionCounts(counts);
      } catch (error: any) {
        console.error("Error fetching syllabus:", error);
        setError(
          error.message || "Failed to load topics. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (userData && sectionId) {
      fetchSyllabus();
    }
  }, [userData, sectionId]);

  const handleDifficultyChange = (topic: string, difficulty: string) => {
    setTopicDifficulties((prev) => ({
      ...prev,
      [topic]: difficulty,
    }));
  };

  const getTopicDifficulty = (topic: string): string => {
    return topicDifficulties[topic] || "Easy";
  };

  const handleStartPractice = async (
    syllabusId: number,
    difficulty: string
  ) => {
    try {
      // Get user_id from userData
      if (!userData || !userData.user_id) {
        console.error("User ID not found");
        setError("User ID not found. Please login again.");
        return;
      }

      // Prepare request payload - convert difficulty to lowercase for API
      const requestPayload = {
        user_id: parseInt(userData.user_id),
        exam_overview_id: parseInt(examId),
        section_id: parseInt(sectionId),
        syllabus_id: syllabusId,
        difficulty: difficulty.toLowerCase(), // Convert to lowercase for API
      };

      console.log("Starting practice with payload:", requestPayload);
      console.log("API URL:", getApiUrl(API_ENDPOINTS.USER_PRACTICE_EXAM));

      // Call POST API
      const response = await fetch(
        getApiUrl(API_ENDPOINTS.USER_PRACTICE_EXAM),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          mode: "cors",
          body: JSON.stringify(requestPayload),
        }
      );

      const responseText = await response.text();
      console.log("User Practice Exam POST Response Status:", response.status);
      console.log("User Practice Exam POST Response:", responseText);

      let practiceExamAttemptDetailsId: number | null = null;

      if (!response.ok) {
        let errorMessage = responseText;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage =
            errorData.detail ||
            errorData.message ||
            errorData.error ||
            responseText;
        } catch {
          // Use text as is if parsing fails
          errorMessage = responseText || `HTTP ${response.status}`;
        }
        console.error("Failed to start practice:", errorMessage);
        // Don't block navigation, just log the error
        // You can uncomment the line below if you want to show error and prevent navigation
        // setError(errorMessage);
      } else {
        console.log("Practice session started successfully");
        // Parse response to get practice_exam_attempt_details_id
        try {
          const responseData = responseText ? JSON.parse(responseText) : {};
          // Try different possible response formats
          practiceExamAttemptDetailsId =
            responseData.practice_exam_attempt_details_id ||
            responseData.id ||
            responseData.attempt_id ||
            (Array.isArray(responseData) && responseData.length > 0
              ? responseData[0].practice_exam_attempt_details_id ||
                responseData[0].id
              : null);
          console.log(
            "Practice Exam Attempt Details ID:",
            practiceExamAttemptDetailsId
          );

          // Store practice_exam_attempt_details_id in localStorage
          if (practiceExamAttemptDetailsId) {
            localStorage.setItem(
              "practice_exam_attempt_details_id",
              practiceExamAttemptDetailsId.toString()
            );
            console.log(
              "Stored practice_exam_attempt_details_id in localStorage:",
              practiceExamAttemptDetailsId
            );
          }
        } catch (parseError) {
          console.error("Failed to parse response:", parseError);
        }
      }

      // Navigate to questions page
      const queryParams = new URLSearchParams({
        syllabus_id: syllabusId.toString(),
        difficulty: difficulty,
      });
      router.push(
        `/exams/${examId}/sections/${sectionId}/questions?${queryParams.toString()}`
      );
    } catch (error: any) {
      console.error("Error starting practice:", error);
      // Don't block navigation, just log the error
      // You can uncomment the line below if you want to show error and prevent navigation
      // setError(error.message || "Failed to start practice. Please try again.");

      // Still navigate even if API call fails
      router.push(
        `/exams/${examId}/sections/${sectionId}/questions?syllabus_id=${syllabusId}&difficulty=${difficulty}`
      );
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content Area */}
      <main className="md:ml-64">
        <div className="container mx-auto px-4 md:px-6 py-8">
          {/* Page Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push(`/exams/${examId}/sections`)}
              className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
            >
              ← Back to Sections
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Topics & Subtopics
              </h1>
              <p className="text-gray-600">
                Select a topic or subtopic to start practicing. Each topic has
                its own difficulty level.
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading topics...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {!isLoading && !error && (
            <div className="space-y-6">
              {groupedTopics.map((group, groupIndex) => {
                const currentDifficulty = getTopicDifficulty(group.topic);
                return (
                  <div
                    key={groupIndex}
                    className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6"
                  >
                    {/* Topic Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                      <div className="flex items-center">
                        <div className="text-2xl sm:text-3xl mr-2 sm:mr-3">
                          📖
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                          {group.topic}
                        </h2>
                      </div>

                      {/* Difficulty Dropdown - Top Right Corner */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <label
                          htmlFor={`difficulty-${groupIndex}`}
                          className="text-sm font-medium text-gray-700 whitespace-nowrap"
                        >
                          Difficulty:
                        </label>
                        <Select
                          value={currentDifficulty}
                          onValueChange={(value) =>
                            handleDifficultyChange(group.topic, value)
                          }
                        >
                          <SelectTrigger
                            id={`difficulty-${groupIndex}`}
                            className="w-full sm:w-[140px] text-sm sm:text-base"
                          >
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Easy">🟢 Easy</SelectItem>
                            <SelectItem value="Medium">🟡 Medium</SelectItem>
                            <SelectItem value="Hard">🔴 Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Subtopics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.syllabusItems.map((item) => (
                        <div
                          key={item.syllabus_id}
                          className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition p-4 flex flex-col"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center flex-1">
                              <span className="text-xl mr-2">📝</span>
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">
                                  {item.subtopic || group.topic}
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                  {questionCounts[item.syllabus_id] !==
                                  undefined
                                    ? `${
                                        questionCounts[item.syllabus_id]
                                      } question${
                                        questionCounts[item.syllabus_id] !== 1
                                          ? "s"
                                          : ""
                                      }`
                                    : "Loading..."}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Difficulty Badge - Shows the topic's difficulty */}
                          <div className="mb-3">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                currentDifficulty === "Easy"
                                  ? "bg-green-100 text-green-700"
                                  : currentDifficulty === "Medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {currentDifficulty === "Easy" && "🟢"}
                              {currentDifficulty === "Medium" && "🟡"}
                              {currentDifficulty === "Hard" && "🔴"}
                              <span className="ml-1">{currentDifficulty}</span>
                            </span>
                          </div>

                          {/* Start Button */}
                          <button
                            onClick={() => {
                              handleStartPractice(
                                item.syllabus_id,
                                currentDifficulty
                              );
                            }}
                            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2 mt-auto"
                          >
                            <span>Start Practice</span>
                            <span>→</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && groupedTopics.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Topics Available
              </h3>
              <p className="text-gray-600">No topics found for this section.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
