"use client";

// Import the PerformanceData type from the parent component
type PerformanceRecord = {
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
  timeSpent: number;
  date: string;
};

type PaginationInfo = {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
};

type PerformanceHistoryProps = {
  filteredData: PerformanceRecord[];
  paginatedData: PerformanceRecord[];
  paginationInfo: PaginationInfo | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  isSectionExam: boolean;
  formatTime: (seconds: number) => string;
  setSelectedRecord: (record: any) => void;
  startIndex: number;
  endIndex: number;
};

export default function PerformanceHistory({
  filteredData,
  paginatedData,
  paginationInfo,
  currentPage,
  setCurrentPage,
  totalPages,
  isSectionExam,
  formatTime,
  setSelectedRecord,
  startIndex,
  endIndex,
}: PerformanceHistoryProps) {
  return (
    <>
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
                    {isSectionExam
                      ? "Exam/Section"
                      : "Exam/Section/Syllabus"}
                  </th>
                  {!isSectionExam && (
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Difficulty
                    </th>
                  )}
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
                          {!isSectionExam && (
                            <p className="text-sm text-gray-600">
                              Syllabus: {item.topicName}
                            </p>
                          )}
                        </div>
                      </td>
                      {!isSectionExam && (
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
                      )}
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
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Showing {startIndex + 1} to{" "}
                {Math.min(
                  endIndex,
                  paginationInfo?.total || filteredData.length
                )}{" "}
                of {paginationInfo?.total || filteredData.length} results
              </div>
              <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-center">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={
                    !paginationInfo?.has_previous && currentPage === 1
                  }
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                    !paginationInfo?.has_previous && currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Previous
                </button>

                <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto max-w-full sm:max-w-none">
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
                            className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition shrink-0 ${
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
                          <span
                            key={page}
                            className="px-1 sm:px-2 text-gray-500 text-xs sm:text-sm shrink-0"
                          >
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
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
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
    </>
  );
}
