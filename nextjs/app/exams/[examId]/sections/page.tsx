"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Navbar from "../../../components/dashboard/Navbar";
import { getApiUrl, API_ENDPOINTS } from "../../../config/api";

type Section = {
  section_id: number;
  exam_overview_id: number;
  section: string;
  no_of_questions: number;
  marks_per_question: number;
  total_marks: number;
};

export default function SectionsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params.examId as string;
  const [userData, setUserData] = useState<any>(null);
  const examType = searchParams.get("type");
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [examInfo, setExamInfo] = useState<any>(null);

  // Handle Start Practice for Section Exam flow
  // For section exam flow, just navigate to questions page (no POST API call)
  // Questions will be fetched from /section/{section_id}/questions API
  const handleStartPractice = (sectionId: number) => {
    // Navigate directly to questions page with section exam flag
    router.push(
      `/exams/${examId}/sections/${sectionId}/questions?examType=section`
    );
  };

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
    // Fetch sections from API
    const fetchSections = async () => {
      if (!userData || !examId) return;

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${getApiUrl(API_ENDPOINTS.SECTIONS)}/${examId}/sections`,
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
        console.log("Sections API Response:", responseText);

        if (!response.ok) {
          throw new Error(
            responseText || `Failed to fetch sections: ${response.status}`
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
        const sectionsData = Array.isArray(data)
          ? data
          : data.sections || data.data || [];

        setSections(sectionsData);

        // Extract exam info from first section (all sections have same exam, grade, level)
        if (sectionsData.length > 0 && sectionsData[0]) {
          const firstSection = sectionsData[0];
          setExamInfo({
            exam: firstSection.exam,
            grade: firstSection.grade,
            level: firstSection.level,
          });
        }
      } catch (error: any) {
        console.error("Error fetching sections:", error);
        setError(
          error.message || "Failed to load sections. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (userData && examId) {
      fetchSections();
    }
  }, [userData, examId]);

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
              onClick={() => router.push("/exams")}
              className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
            >
              ← Back to Exams
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sections</h1>
            {examInfo && (
              <p className="text-gray-600">
                {examInfo.exam} - Grade {examInfo.grade}, Level {examInfo.level}
              </p>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading sections...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Sections Grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section) => (
                <div
                  key={section.section_id}
                  className="bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition cursor-pointer"
                  onClick={(e) => {
                    // Only handle card click if it's not a section exam (section exam is handled by button)
                    if (examType !== "section") {
                      router.push(
                        `/exams/${examId}/sections/${section.section_id}/topics`
                      );
                    }
                  }}
                >
                  <div className="p-6">
                    {/* Section Icon and Name */}
                    <div className="flex items-center mb-4">
                      <div className="text-4xl mr-3">📚</div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {section.section}
                      </h2>
                    </div>

                    {/* Section Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">
                          📝 Questions
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          {section.no_of_questions}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">
                          ⭐ Marks per Question
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          {section.marks_per_question}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">
                          🎯 Total Marks
                        </span>
                        <span className="text-lg font-bold text-purple-600">
                          {section.total_marks}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (examType === "section") {
                          handleStartPractice(section.section_id);
                        } else {
                          router.push(
                            `/exams/${examId}/sections/${section.section_id}/topics`
                          );
                        }
                      }}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-lg shadow-sm transition duration-200 flex items-center justify-center gap-2"
                    >
                      <span>
                        {examType === "section"
                          ? "Start Practice"
                          : "Start Learning"}
                      </span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && sections.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Sections Available
              </h3>
              <p className="text-gray-600">No sections found for this exam.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
