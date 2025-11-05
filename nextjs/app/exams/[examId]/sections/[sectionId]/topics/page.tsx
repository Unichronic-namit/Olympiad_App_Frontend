"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "../../../../../components/dashboard/Navbar";
import { getApiUrl, API_ENDPOINTS } from "../../../../../config/api";

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
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="text-3xl mr-3">📖</div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {group.topic}
                        </h2>
                      </div>

                      {/* Difficulty Dropdown - Top Right Corner */}
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={`difficulty-${groupIndex}`}
                          className="text-sm font-medium text-gray-700 whitespace-nowrap"
                        >
                          Difficulty:
                        </label>
                        <select
                          id={`difficulty-${groupIndex}`}
                          value={currentDifficulty}
                          onChange={(e) =>
                            handleDifficultyChange(group.topic, e.target.value)
                          }
                          className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                        >
                          <option value="Easy">🟢 Easy</option>
                          <option value="Medium">🟡 Medium</option>
                          <option value="Hard">🔴 Hard</option>
                        </select>
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
                              <span className="font-medium text-gray-900">
                                {item.subtopic || group.topic}
                              </span>
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
                              router.push(
                                `/exams/${examId}/sections/${sectionId}/questions?syllabus_id=${item.syllabus_id}&difficulty=${currentDifficulty}`
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
