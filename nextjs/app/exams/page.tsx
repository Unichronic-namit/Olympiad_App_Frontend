"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/dashboard/Navbar";
import { getApiUrl, API_ENDPOINTS } from "../config/api";

type Exam = {
  exam_overview_id: number;
  exam: string;
  grade: number;
  level: number;
  total_questions: number;
  total_marks: number;
  total_time_mins: number;
};

export default function ExamsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<number | string | null>(
    null
  );

  // Filter exams based on grade
  const filterExams = (examsData: Exam[], grade: number | string | null) => {
    if (!grade && grade !== 0) {
      // If no grade selected, show all exams
      setFilteredExams(examsData);
      return;
    }

    // Convert to number for comparison (handles both string and number)
    const gradeNum = typeof grade === "string" ? parseInt(grade, 10) : grade;
    const filtered = examsData.filter(
      (exam: Exam) => exam.grade === gradeNum || exam.grade === grade
    );
    setFilteredExams(filtered);
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
    // Fetch exams from API
    const fetchExams = async () => {
      if (!userData) return;

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(getApiUrl(API_ENDPOINTS.EXAMS), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          mode: "cors",
        });

        const responseText = await response.text();
        console.log("Exams API Response:", responseText);

        if (!response.ok) {
          throw new Error(
            responseText || `Failed to fetch exams: ${response.status}`
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
        const examsData = Array.isArray(data)
          ? data
          : data.exams || data.data || [];

        // Use the data directly as it matches our API response structure
        setExams(examsData);

        // Set initial selected grade to user's grade if available
        if (!selectedGrade && userData.grade) {
          const userGradeNum =
            typeof userData.grade === "string"
              ? parseInt(userData.grade, 10)
              : userData.grade;
          setSelectedGrade(userGradeNum);
        }

        // Filter exams based on selected grade or user's grade
        filterExams(examsData, selectedGrade || userData.grade);
      } catch (error: any) {
        console.error("Error fetching exams:", error);
        setError(
          error.message || "Failed to load exams. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (userData) {
      fetchExams();
    }
  }, [userData]);

  // Handle grade selection from dropdown
  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const grade = value === "all" ? null : value ? parseInt(value, 10) : null;
    setSelectedGrade(grade);
    filterExams(exams, grade);
  };

  // Get unique grades from exams
  const availableGrades = Array.from(
    new Set(exams.map((exam) => exam.grade))
  ).sort((a, b) => a - b);

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
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Exams</h1>
              <p className="text-gray-600">
                {selectedGrade !== null
                  ? `Showing exams for Grade ${selectedGrade}`
                  : userData?.grade
                  ? `Showing exams for Grade ${userData.grade}`
                  : "Browse and select exams to practice or take tests"}
              </p>
            </div>

            {/* Grade Filter Dropdown */}
            {!isLoading && exams.length > 0 && (
              <div className="flex items-center gap-2">
                <label
                  htmlFor="grade-filter"
                  className="text-sm font-medium text-gray-700 whitespace-nowrap"
                >
                  Filter by Grade:
                </label>
                <select
                  id="grade-filter"
                  value={
                    selectedGrade !== null
                      ? selectedGrade.toString()
                      : userData?.grade
                      ? userData.grade.toString()
                      : "all"
                  }
                  onChange={handleGradeChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer min-w-[120px]"
                >
                  <option value="all">All Grades</option>
                  {availableGrades.map((grade) => (
                    <option key={grade} value={grade.toString()}>
                      Grade {grade}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading exams...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Exams Grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => (
                <div
                  key={exam.exam_overview_id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
                >
                  {/* Exam Name */}
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {exam.exam}
                  </h2>

                  {/* Grade and Level */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                        Grade {exam.grade}
                      </span>
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                        Level {exam.level}
                      </span>
                    </div>
                  </div>

                  {/* Exam Details */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Questions</p>
                      <p className="text-xl font-bold text-gray-900">
                        {exam.total_questions || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Marks</p>
                      <p className="text-xl font-bold text-gray-900">
                        {exam.total_marks || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Time</p>
                      <p className="text-xl font-bold text-gray-900">
                        {exam.total_time_mins || 0}m
                      </p>
                    </div>
                  </div>

                  {/* View Section Button */}
                  <button
                    onClick={() => {
                      router.push(`/exams/${exam.exam_overview_id}/sections`);
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition duration-200"
                  >
                    View Sections
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Empty State (if no exams) */}
          {!isLoading && !error && filteredExams.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {selectedGrade !== null
                  ? `No Exams Available for Grade ${selectedGrade}`
                  : userData?.grade
                  ? `No Exams Available for Grade ${userData.grade}`
                  : "No Exams Available"}
              </h3>
              <p className="text-gray-600">
                {selectedGrade !== null || userData?.grade
                  ? "Check back later for new exam announcements for this grade."
                  : "Check back later for new exam announcements."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
