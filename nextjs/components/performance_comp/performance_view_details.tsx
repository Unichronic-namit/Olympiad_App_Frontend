"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";

type QuestionAttempt = {
  questionId: number;
  question_no: number; // Question number from que_ans_details
  question_text: string; // Question text from questions_data
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string; // Correct option from questions_data (A, B, C, D)
  selected_answer: string | null; // Selected answer from que_ans_details
  solution: string; // Solution from questions_data
  attemptNumber: number;
  selectedAnswer: number | null; // Keep for backward compatibility
  correctAnswer: string | null; // Keep for backward compatibility
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

type PerformanceViewDetailsProps = {
  selectedRecord: PerformanceData | null;
  setSelectedRecord: (record: PerformanceData | null) => void;
  isSectionExam: boolean;
  formatTime: (seconds: number) => string;
  openQuestions: Set<string>;
  setOpenQuestions: React.Dispatch<React.SetStateAction<Set<string>>>;
};

export default function PerformanceViewDetails({
  selectedRecord,
  setSelectedRecord,
  isSectionExam,
  formatTime,
  openQuestions,
  setOpenQuestions,
}: PerformanceViewDetailsProps) {
  if (!selectedRecord) return null;

  return (
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
              {!isSectionExam && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  Syllabus: {selectedRecord.topicName}
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedRecord.difficulty.toLowerCase() === "easy"
                        ? "bg-green-100 text-green-700"
                        : selectedRecord.difficulty.toLowerCase() ===
                          "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedRecord.difficulty.charAt(0).toUpperCase() +
                      selectedRecord.difficulty.slice(1).toLowerCase()}
                  </span>
                </p>
              )}
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
              <p className="text-sm text-gray-600 mb-1">Score</p>
              <p className="text-2xl font-bold text-blue-600">
                {selectedRecord.score}/{selectedRecord.totalQuestions}
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
                    const isNotVisited = attempt.status === 3;
                    const isNotAttempted = attempt.status === 0;
                    const isCorrect = attempt.isCorrect;
                    const questionKey = `${attempt.questionId}-${attempt.attemptNumber}`;
                    const isOpen = openQuestions.has(questionKey);

                    return (
                      <Collapsible
                        key={questionKey}
                        open={isOpen}
                        onOpenChange={(open) => {
                          setOpenQuestions((prev) => {
                            const newSet = new Set(prev);
                            if (open) {
                              newSet.add(questionKey);
                            } else {
                              newSet.delete(questionKey);
                            }
                            return newSet;
                          });
                        }}
                        className={`rounded-lg border-2 ${
                          isNotVisited
                            ? "bg-gray-50 border-gray-300"
                            : isNotAttempted
                            ? "bg-purple-50 border-purple-300"
                            : isCorrect
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <CollapsibleTrigger className="w-full p-4 flex flex-col gap-2 hover:bg-opacity-80 transition">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  isNotVisited
                                    ? "bg-gray-500 text-white"
                                    : isNotAttempted
                                    ? "bg-purple-500 text-white"
                                    : isCorrect
                                    ? "bg-green-600 text-white"
                                    : "bg-red-600 text-white"
                                }`}
                              >
                                Question{" "}
                                {attempt.question_no || index + 1}
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  isNotVisited
                                    ? "bg-gray-200 text-gray-800"
                                    : isNotAttempted
                                    ? "bg-purple-200 text-purple-800"
                                    : isCorrect
                                    ? "bg-green-200 text-green-800"
                                    : "bg-red-200 text-red-800"
                                }`}
                              >
                                {isNotVisited
                                  ? "Not Visited"
                                  : isNotAttempted
                                  ? "Not Answered"
                                  : isCorrect
                                  ? "✓ Correct"
                                  : "✗ Incorrect"}
                              </span>
                            </div>
                            <ChevronDownIcon
                              className={`h-5 w-5 text-gray-500 transition-transform ${
                                isOpen ? "transform rotate-180" : ""
                              }`}
                            />
                          </div>
                          <div className="w-full">
                            <p className="text-gray-900 font-medium text-base text-left">
                              {attempt.question_text ||
                                "Question text not available"}
                            </p>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="overflow-hidden">
                          <div className="px-4 pb-4 space-y-4">
                            {/* Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div
                                className={`p-2 rounded ${
                                  attempt.correct_option === "A"
                                    ? "bg-green-50 border border-green-200"
                                    : attempt.selected_answer === "A"
                                    ? "bg-red-50 border border-red-200"
                                    : ""
                                }`}
                              >
                                <span className="font-semibold text-gray-700">
                                  A.{" "}
                                </span>
                                <span className="text-gray-700">
                                  {attempt.option_a}
                                </span>
                              </div>
                              <div
                                className={`p-2 rounded ${
                                  attempt.correct_option === "B"
                                    ? "bg-green-50 border border-green-200"
                                    : attempt.selected_answer === "B"
                                    ? "bg-red-50 border border-red-200"
                                    : ""
                                }`}
                              >
                                <span className="font-semibold text-gray-700">
                                  B.{" "}
                                </span>
                                <span className="text-gray-700">
                                  {attempt.option_b}
                                </span>
                              </div>
                              <div
                                className={`p-2 rounded ${
                                  attempt.correct_option === "C"
                                    ? "bg-green-50 border border-green-200"
                                    : attempt.selected_answer === "C"
                                    ? "bg-red-50 border border-red-200"
                                    : ""
                                }`}
                              >
                                <span className="font-semibold text-gray-700">
                                  C.{" "}
                                </span>
                                <span className="text-gray-700">
                                  {attempt.option_c}
                                </span>
                              </div>
                              <div
                                className={`p-2 rounded ${
                                  attempt.correct_option === "D"
                                    ? "bg-green-50 border border-green-200"
                                    : attempt.selected_answer === "D"
                                    ? "bg-red-50 border border-red-200"
                                    : ""
                                }`}
                              >
                                <span className="font-semibold text-gray-700">
                                  D.{" "}
                                </span>
                                <span className="text-gray-700">
                                  {attempt.option_d}
                                </span>
                              </div>
                            </div>

                            {/* Selected and Correct Answers */}
                            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-sm border-t pt-3">
                              <div>
                                <p className="text-gray-600 mb-1">
                                  Selected Answer
                                </p>
                                <p className="font-semibold text-gray-900">
                                  {attempt.selected_answer ||
                                    "Not answered"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600 mb-1">
                                  Correct Answer
                                </p>
                                <p className="font-semibold text-green-600">
                                  {attempt.correct_option || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Solution */}
                            {attempt.solution && (
                              <div className="border-t pt-3">
                                <p className="text-gray-600 mb-2 font-semibold">
                                  Solution:
                                </p>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {attempt.solution}
                                </p>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
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
  );
}
