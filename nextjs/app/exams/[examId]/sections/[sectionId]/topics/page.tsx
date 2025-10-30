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
  const [selectedSyllabusId, setSelectedSyllabusId] = useState<number | null>(
    null
  );
  const [difficulty, setDifficulty] = useState<string>("Easy");

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

  const handleStart = () => {
    if (selectedSyllabusId && difficulty) {
      router.push(
        `/exams/${examId}/sections/${sectionId}/questions?syllabus_id=${selectedSyllabusId}&difficulty=${difficulty}`
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Topics & Subtopics
                </h1>
                <p className="text-gray-600">
                  Select a topic or subtopic to start practicing
                </p>
              </div>

              {/* Difficulty Dropdown - Top Right */}
              {!isLoading && (
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="difficulty-filter"
                    className="text-sm font-medium text-gray-700 whitespace-nowrap"
                  >
                    Difficulty Level:
                  </label>
                  <select
                    id="difficulty-filter"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer min-w-[120px]"
                  >
                    <option value="Easy">🟢 Easy</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="Hard">🔴 Hard</option>
                  </select>
                </div>
              )}
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
              {groupedTopics.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6"
                >
                  {/* Topic Header */}
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-3">📖</div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {group.topic}
                    </h2>
                  </div>

                  {/* Subtopics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.syllabusItems.map((item) => (
                      <button
                        key={item.syllabus_id}
                        onClick={() => {
                          setSelectedSyllabusId(
                            selectedSyllabusId === item.syllabus_id
                              ? null
                              : item.syllabus_id
                          );
                        }}
                        className={`w-full text-left p-4 rounded-lg transition border-2 ${
                          selectedSyllabusId === item.syllabus_id
                            ? "bg-purple-50 border-purple-600 text-purple-900"
                            : "bg-gray-50 border-gray-200 hover:bg-purple-50 hover:border-purple-300"
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="text-xl mr-2">📝</span>
                          <span className="font-medium text-gray-900">
                            {item.subtopic || group.topic}
                          </span>
                          {selectedSyllabusId === item.syllabus_id && (
                            <span className="ml-auto text-purple-600">✓</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Start Practice Button - Fixed at bottom */}
              <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-4 rounded-t-xl shadow-lg">
                <button
                  onClick={handleStart}
                  disabled={!selectedSyllabusId}
                  className={`w-full py-4 rounded-lg font-bold text-lg transition ${
                    selectedSyllabusId
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {selectedSyllabusId
                    ? `🚀 Start Practice (${difficulty})`
                    : "👉 Please select a topic or subtopic"}
                </button>
              </div>
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
