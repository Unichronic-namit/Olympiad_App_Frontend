import Navbar from "../../app/components/dashboard/Navbar";

type ShowScoreProps = {
  scorePercentage: number;
  correctCount: number;
  incorrectCount: number;
  totalQuestions: number;
  handleBackToTopics: () => void;
  isSectionExam: boolean;
  handleRetry: () => void;
};

export default function ShowScore({
  scorePercentage,
  correctCount,
  incorrectCount,
  totalQuestions,
  handleBackToTopics,
  isSectionExam,
  handleRetry,
}: ShowScoreProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="md:ml-64">
        <div className="container mx-auto px-4 md:px-6 py-8 max-w-4xl">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
            {/* Score Header */}
            <div className="mb-8">
              <div className="text-6xl mb-4">
                {scorePercentage >= 80
                  ? "🎉"
                  : scorePercentage >= 60
                  ? "👍"
                  : "📚"}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Exam Completed!
              </h1>
              <p className="text-gray-600">Here's how you performed</p>
            </div>

            {/* Score Circle */}
            <div className="mb-8 flex justify-center">
              <div className="relative w-48 h-48">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#e5e7eb"
                    strokeWidth="16"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke={
                      scorePercentage >= 80
                        ? "#10b981"
                        : scorePercentage >= 60
                        ? "#3b82f6"
                        : "#ef4444"
                    }
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 88 * (1 - scorePercentage / 100)
                    }`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <div className="text-5xl font-bold text-gray-900">
                      {scorePercentage}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Score</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                <div className="text-4xl font-bold text-green-700 mb-2">
                  {correctCount}
                </div>
                <div className="text-sm font-medium text-green-800">
                  Correct Answers
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
                <div className="text-4xl font-bold text-red-700 mb-2">
                  {incorrectCount}
                </div>
                <div className="text-sm font-medium text-red-800">
                  Incorrect Answers
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                <div className="text-4xl font-bold text-blue-700 mb-2">
                  {totalQuestions}
                </div>
                <div className="text-sm font-medium text-blue-800">
                  Total Questions
                </div>
              </div>
            </div>

            {/* Performance Message */}
            <div
              className={`p-4 rounded-lg mb-8 ${
                scorePercentage >= 80
                  ? "bg-green-50 border border-green-200"
                  : scorePercentage >= 60
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-yellow-50 border border-yellow-200"
              }`}
            >
              <p
                className={`font-semibold ${
                  scorePercentage >= 80
                    ? "text-green-800"
                    : scorePercentage >= 60
                    ? "text-blue-800"
                    : "text-yellow-800"
                }`}
              >
                {scorePercentage >= 80
                  ? "🎊 Excellent! You've mastered this topic!"
                  : scorePercentage >= 60
                  ? "👍 Good work! Keep practicing to improve!"
                  : "📚 Keep practicing! You're making progress!"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleBackToTopics}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-sm transition duration-200"
              >
                ← {isSectionExam ? "Back to Sections" : "Back to Topics"}
              </button>
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition duration-200"
              >
                🔄 Retry Exam
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
