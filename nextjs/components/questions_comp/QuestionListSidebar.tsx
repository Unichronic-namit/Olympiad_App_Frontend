import type { Question } from "./question_page_client";

type QuestionListSidebarProps = {
  questions: Question[];
  currentQuestionIndex: number;
  answeredQuestions: Set<number>;
  notVisitedQuestions: Set<number>;
  notAnsweredQuestions: Set<number>;
  handleQuestionClick: (index: number) => void;
  showScore: boolean;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
};

export default function QuestionListSidebar({
  questions,
  currentQuestionIndex,
  answeredQuestions,
  notVisitedQuestions,
  notAnsweredQuestions,
  handleQuestionClick,
  showScore,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
}: QuestionListSidebarProps) {
  return (
    <>
      {/* Question List Sidebar - Desktop */}
      {questions.length > 0 && !showScore && (
        <div className="hidden lg:block w-64 shrink-0 py-9">
          {/* Spacer to align with question display (matches timer/progress bar section) */}
          <div className="mb-6 space-y-4">
            {/* Invisible timer/finish button row to match height */}
            <div className="flex justify-between items-center opacity-0 pointer-events-none">
              <div className="px-4 py-2 rounded-lg font-mono text-lg font-bold">
                <span className="mr-2">⏱️</span>
                00:00
              </div>
              <button className="px-4 py-2 font-semibold rounded-lg">
                Finish
              </button>
            </div>
            {/* Invisible progress bar section to match height */}
            <div>
              <div className="w-full bg-transparent rounded-full h-2">
                <div className="bg-transparent h-2 rounded-full w-full"></div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Questions
            </h3>
            <div className="grid grid-cols-5 gap-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {questions.map((question, index) => {
                const isAnswered = answeredQuestions.has(index);
                const isCurrent = currentQuestionIndex === index;
                const isNotVisited = notVisitedQuestions.has(index);
                const isNotAnswered = notAnsweredQuestions.has(index);

                return (
                  <button
                    key={question.question_id}
                    onClick={() => handleQuestionClick(index)}
                    className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
                      isCurrent
                        ? "bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2"
                        : isAnswered
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : isNotAnswered
                        ? "bg-purple-500 text-white hover:bg-purple-600"
                        : isNotVisited
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                <div className="w-4 h-4 rounded bg-purple-500"></div>
                <span>Not Answered</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></div>
                <span>Not Visited</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question List Sidebar - Mobile */}
      {questions.length > 0 && !showScore && isMobileSidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          ></div>

          {/* Mobile Sidebar */}
          <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto">
            <div className="flex flex-col h-full p-4">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Questions
                </h3>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Questions Grid */}
              <div className="grid grid-cols-5 gap-2 flex-1 overflow-y-auto">
                {questions.map((question, index) => {
                  const isAnswered = answeredQuestions.has(index);
                  const isCurrent = currentQuestionIndex === index;
                  const isNotVisited = notVisitedQuestions.has(index);
                  const isNotAnswered = notAnsweredQuestions.has(index);

                  return (
                    <button
                      key={question.question_id}
                      onClick={() => {
                        handleQuestionClick(index);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
                        isCurrent
                          ? "bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2"
                          : isAnswered
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : isNotAnswered
                          ? "bg-purple-500 text-white hover:bg-purple-600"
                          : isNotVisited
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-4 h-4 rounded bg-green-500"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                  <div className="w-4 h-4 rounded bg-purple-500"></div>
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                  <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></div>
                  <span>Not Visited</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
