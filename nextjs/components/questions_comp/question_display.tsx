"use client";

import Image from "next/image";

type QuestionDisplayProps = {
  isLoading: boolean;
  error: string;
  currentQuestion: any;
  currentQuestionIndex: number;
  questionsLength: number;
  isSectionExam: boolean;
  showResult: boolean;
  selectedAnswer: number | null;
  handleAnswerSelect: (answerIndex: number) => void;
  isCorrect: boolean;
  handleSubmitAnswer: () => void;
  handleNextQuestion: () => void;
  isSubmittingAnswer: boolean;
  submittedQuestions: Set<number>;
};

export default function QuestionDisplay({
  isLoading,
  error,
  currentQuestion,
  currentQuestionIndex,
  questionsLength,
  isSectionExam,
  showResult,
  selectedAnswer,
  handleAnswerSelect,
  isCorrect,
  handleSubmitAnswer,
  handleNextQuestion,
  isSubmittingAnswer,
  submittedQuestions,
}: QuestionDisplayProps) {
  return (
    <>
      {/* Question Display */}
      {!isLoading && !error && currentQuestion && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Question Number and Difficulty */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-sm text-gray-500">Question</span>
              <h2 className="text-2xl font-bold text-gray-900">
                #{currentQuestionIndex + 1}
              </h2>
            </div>
            {!isSectionExam && currentQuestion.difficulty && (
              <span
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  currentQuestion.difficulty === "easy"
                    ? "bg-green-100 text-green-700"
                    : currentQuestion.difficulty === "medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {currentQuestion.difficulty}
              </span>
            )}
          </div>

          {/* Question Text */}
          <div className="mb-8">
            <p className="text-lg text-gray-900 leading-relaxed">
              {currentQuestion.question_text}
            </p>
            {/* Question Image */}
            {currentQuestion.question_image_url && (
              <div className="mt-4">
                <Image
                  src={currentQuestion.question_image_url}
                  alt="Question image"
                  width={600}
                  height={400}
                  className="rounded-lg border border-gray-200 max-w-full h-auto"
                  unoptimized
                />
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {[
              {
                label: "A",
                text: currentQuestion.option_a,
                imageUrl: currentQuestion.option_a_image_url,
              },
              {
                label: "B",
                text: currentQuestion.option_b,
                imageUrl: currentQuestion.option_b_image_url,
              },
              {
                label: "C",
                text: currentQuestion.option_c,
                imageUrl: currentQuestion.option_c_image_url,
              },
              {
                label: "D",
                text: currentQuestion.option_d,
                imageUrl: currentQuestion.option_d_image_url,
              },
            ].map((option, index) => {
              const correctOptionIndex =
                currentQuestion.correct_option?.toUpperCase().charCodeAt(0) -
                65;
              let optionStyle = "";
              // For section exam: Don't show result colors, just show selected
              // For syllabus exam: Show result colors (correct/incorrect)
              if (!isSectionExam && showResult) {
                if (index === correctOptionIndex) {
                  optionStyle = "bg-green-100 border-green-500 text-green-900";
                } else if (
                  index === selectedAnswer &&
                  index !== correctOptionIndex
                ) {
                  optionStyle = "bg-red-100 border-red-500 text-red-900";
                } else {
                  optionStyle = "bg-gray-50 border-gray-300";
                }
              } else {
                optionStyle =
                  selectedAnswer === index
                    ? "bg-blue-100 border-blue-500 text-blue-900"
                    : "bg-gray-50 border-gray-300 hover:bg-blue-50 cursor-pointer";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={!isSectionExam && showResult}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${optionStyle}`}
                >
                  <div className="flex items-start">
                    <span className="font-semibold mr-3 mt-1">
                      {option.label}.
                    </span>
                    <div className="flex-1">
                      {option.text && (
                        <span className="block mb-2">{option.text}</span>
                      )}
                      {option.imageUrl && (
                        <div className="mt-2">
                          <Image
                            src={option.imageUrl}
                            alt={`Option ${option.label} image`}
                            width={400}
                            height={300}
                            className="rounded-lg border border-gray-200 max-w-full h-auto"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>
                    {!isSectionExam &&
                      showResult &&
                      index === correctOptionIndex && (
                        <span className="ml-auto text-green-700 font-semibold whitespace-nowrap">
                          ✓ Correct
                        </span>
                      )}
                    {!isSectionExam &&
                      showResult &&
                      index === selectedAnswer &&
                      index !== correctOptionIndex && (
                        <span className="ml-auto text-red-700 font-semibold whitespace-nowrap">
                          ✗ Your Answer
                        </span>
                      )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Result Message - Only for syllabus exam */}
          {!isSectionExam && showResult && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                isCorrect
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <p
                className={`font-semibold ${
                  isCorrect ? "text-green-800" : "text-red-800"
                }`}
              >
                {isCorrect
                  ? "✓ Correct! Well done!"
                  : "✗ Incorrect. The correct answer is shown above."}
              </p>
            </div>
          )}

          {/* Solution - Only for syllabus exam */}
          {!isSectionExam &&
            showResult &&
            !isCorrect &&
            currentQuestion.solution && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Solution:</h3>
                <p className="text-blue-800">{currentQuestion.solution}</p>
              </div>
            )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {/* For section exam: Submit Answer button automatically moves to next question */}
            {/* For syllabus exam: Submit Answer shows result, then Next Question button appears */}
            {isSectionExam || !showResult ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={
                  // For section exam: Only disable if no answer selected or loading
                  // For syllabus exam: Disable if no answer selected OR already submitted
                  selectedAnswer === null ||
                  isSubmittingAnswer ||
                  (!isSectionExam &&
                    submittedQuestions.has(currentQuestionIndex))
                }
                className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  selectedAnswer !== null &&
                  !isSubmittingAnswer &&
                  (isSectionExam ||
                    !submittedQuestions.has(currentQuestionIndex))
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isSubmittingAnswer ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  "Submit Answer"
                )}
              </button>
            ) : null}
            {/* For syllabus exam: Show Next Question button after submitting */}
            {!isSectionExam && showResult && (
              <button
                onClick={handleNextQuestion}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                {currentQuestionIndex < questionsLength - 1
                  ? "Next Question"
                  : "Finish"}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
