"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Navbar from "../../../../../components/dashboard/Navbar";
import { getApiUrl, API_ENDPOINTS } from "../../../../../config/api";

type Question = {
  question_id: number;
  syllabus_id: number;
  difficulty: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string; // "A", "B", "C", or "D"
  solution: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function QuestionsPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params.examId as string;
  const sectionId = params.sectionId as string;
  const syllabusId = searchParams.get("syllabus_id");
  const difficultyParam = searchParams.get("difficulty");
  const [practiceExamAttemptDetailsId, setPracticeExamAttemptDetailsId] =
    useState<string | null>(null);

  const [userData, setUserData] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<boolean[]>([]); // Track correct/incorrect for each question
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(
    new Set()
  ); // Track which questions have been answered
  const [questionAnswers, setQuestionAnswers] = useState<Map<number, number>>(
    new Map()
  ); // Track selected answer for each question
  const [showScore, setShowScore] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState<number>(0); // Timer counting up from zero
  const [isTimerActive, setIsTimerActive] = useState(true);

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

    // Get practice_exam_attempt_details_id from localStorage
    const storedPracticeExamAttemptDetailsId = localStorage.getItem(
      "practice_exam_attempt_details_id"
    );
    if (storedPracticeExamAttemptDetailsId) {
      setPracticeExamAttemptDetailsId(storedPracticeExamAttemptDetailsId);
      console.log(
        "Loaded practice_exam_attempt_details_id from localStorage:",
        storedPracticeExamAttemptDetailsId
      );
    }
  }, [router]);

  useEffect(() => {
    // Fetch questions from API
    const fetchQuestions = async () => {
      if (!userData || !syllabusId) return;

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${getApiUrl(API_ENDPOINTS.QUESTIONS)}/${syllabusId}/questions`,
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
        console.log("Questions API Response:", responseText);

        if (!response.ok) {
          throw new Error(
            responseText || `Failed to fetch questions: ${response.status}`
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
        const questionsData: Question[] = Array.isArray(data)
          ? data
          : data.questions || data.data || [];

        // Filter only active questions
        let activeQuestions = questionsData.filter((q) => q.is_active);

        // Filter by difficulty if provided
        if (difficultyParam) {
          activeQuestions = activeQuestions.filter(
            (q) => q.difficulty?.toLowerCase() === difficultyParam.toLowerCase()
          );
        }

        setQuestions(activeQuestions);
      } catch (error: any) {
        console.error("Error fetching questions:", error);
        setError(
          error.message || "Failed to load questions. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (userData && syllabusId) {
      fetchQuestions();
    }
  }, [userData, syllabusId, difficultyParam]);

  // Timer count-up effect
  useEffect(() => {
    if (!isTimerActive || showScore) {
      return;
    }

    const timerInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isTimerActive, showScore]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return; // Don't allow changing answer after submission
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = questions[currentQuestionIndex];
    // Convert correct_option ("A", "B", "C", "D") to index (0, 1, 2, 3)
    const correctOptionIndex =
      currentQuestion.correct_option?.toUpperCase().charCodeAt(0) - 65;
    const correct = selectedAnswer === correctOptionIndex;
    setIsCorrect(correct);
    setShowResult(true);

    // Track the answer result
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = correct;
    setAnswers(newAnswers);

    // Mark question as answered and store the selected answer
    setAnsweredQuestions((prev) => new Set(prev).add(currentQuestionIndex));
    setQuestionAnswers((prev) =>
      new Map(prev).set(currentQuestionIndex, selectedAnswer)
    );
  };

  const handleNextQuestion = async () => {
    // Get current question
    const currentQuestion =
      questions.length > 0 ? questions[currentQuestionIndex] : null;

    console.log("handleNextQuestion called");
    console.log("practiceExamAttemptDetailsId:", practiceExamAttemptDetailsId);
    console.log("currentQuestion:", currentQuestion);
    console.log("selectedAnswer:", selectedAnswer);
    console.log("currentQuestionIndex:", currentQuestionIndex);

    // Save current answer before moving to next question
    if (practiceExamAttemptDetailsId && currentQuestion) {
      try {
        // Convert selected answer index (0,1,2,3) to letter (A,B,C,D)
        // If no answer selected, use empty string
        const selectedAnswerLetter =
          selectedAnswer !== null
            ? String.fromCharCode(65 + selectedAnswer) // 65 is 'A'
            : "";

        // Compare selected answer with correct option
        // correct_option is already in format "A", "B", "C", or "D"
        const correctOption = currentQuestion.correct_option
          ?.toUpperCase()
          .trim();
        const isCorrect =
          selectedAnswerLetter !== "" &&
          selectedAnswerLetter.toUpperCase() === correctOption;

        // Set status: 1 if correct, 2 if incorrect or unanswered
        const status = isCorrect ? 1 : 2;

        const requestPayload = {
          question_id: currentQuestion.question_id,
          status: status,
          selected_answer: selectedAnswerLetter,
        };

        console.log("Correct option:", correctOption);
        console.log("Selected answer:", selectedAnswerLetter);
        console.log("Is correct:", isCorrect);
        console.log("Status:", status);

        console.log("Saving answer with payload:", requestPayload);
        console.log(
          "API URL:",
          `${getApiUrl(
            API_ENDPOINTS.PRACTICE_EXAM_ATTEMPT_DETAILS
          )}/${practiceExamAttemptDetailsId}`
        );

        const response = await fetch(
          `${getApiUrl(
            API_ENDPOINTS.PRACTICE_EXAM_ATTEMPT_DETAILS
          )}/${practiceExamAttemptDetailsId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            mode: "cors",
            body: JSON.stringify(requestPayload),
          }
        );

        const responseText = await response.text();
        console.log(
          "Practice Exam Attempt Details PUT Response Status:",
          response.status
        );
        console.log(
          "Practice Exam Attempt Details PUT Response:",
          responseText
        );

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
            errorMessage = responseText || `HTTP ${response.status}`;
          }
          console.error("Failed to save answer:", errorMessage);
          // Don't block navigation, just log the error
        } else {
          console.log("Answer saved successfully");
        }
      } catch (error: any) {
        console.error("Error saving answer:", error);
        // Don't block navigation, just log the error
      }
    } else {
      console.log(
        "Skipping API call - practiceExamAttemptDetailsId or currentQuestion missing"
      );
    }

    // Mark current question as answered if an answer was selected
    if (selectedAnswer !== null && currentQuestion) {
      setAnsweredQuestions((prev) => new Set(prev).add(currentQuestionIndex));
      setQuestionAnswers((prev) =>
        new Map(prev).set(currentQuestionIndex, selectedAnswer)
      );
    }

    // Move to next question or show score
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      // Restore the selected answer if this question was previously answered
      const savedAnswer = questionAnswers.get(nextIndex);
      setSelectedAnswer(savedAnswer !== undefined ? savedAnswer : null);
      setShowResult(false);
      setIsCorrect(false);
    } else {
      // All questions completed - show score
      setShowScore(true);
    }
  };

  // Calculate score
  const correctCount = answers.filter((isCorrect) => isCorrect).length;
  const incorrectCount = answers.filter((isCorrect) => !isCorrect).length;
  const totalQuestions = questions.length;
  const scorePercentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const handleBackToTopics = () => {
    router.push(`/exams/${examId}/sections/${sectionId}/topics`);
  };

  const handleRetry = () => {
    setShowScore(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
    setAnswers([]);
    setAnsweredQuestions(new Set());
    setQuestionAnswers(new Map());
    setElapsedTime(0); // Reset timer to zero
    setIsTimerActive(true);
  };

  const handleQuestionClick = (index: number) => {
    setCurrentQuestionIndex(index);
    // Restore the selected answer if this question was previously answered
    const savedAnswer = questionAnswers.get(index);
    setSelectedAnswer(savedAnswer !== undefined ? savedAnswer : null);
    setShowResult(false);
    setIsCorrect(false);
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

  const currentQuestion =
    questions.length > 0 ? questions[currentQuestionIndex] : null;

  // Show score screen when exam is completed
  if (showScore && questions.length > 0) {
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
                  ← Back to Topics
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content Area */}
      <main className="md:ml-64">
        <div className="flex gap-6 container mx-auto px-4 md:px-6 py-8">
          {/* Question List Sidebar */}
          {questions.length > 0 && !showScore && (
            <div className="hidden lg:block w-64 shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Questions
                </h3>
                <div className="grid grid-cols-5 gap-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {questions.map((question, index) => {
                    const isAnswered = answeredQuestions.has(index);
                    const isCurrent = currentQuestionIndex === index;

                    return (
                      <button
                        key={question.question_id}
                        onClick={() => handleQuestionClick(index)}
                        className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
                          isCurrent
                            ? "bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2"
                            : isAnswered
                            ? "bg-green-500 text-white hover:bg-green-600"
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
                    <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></div>
                    <span>Not Answered</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Question Content */}
          <div className="flex-1 max-w-4xl">
            {/* Timer and Progress Bar */}
            {questions.length > 0 && (
              <div className="mb-6 space-y-4">
                {/* Timer */}
                <div className="flex justify-end">
                  <div className="px-4 py-2 rounded-lg font-mono text-lg font-bold bg-blue-100 text-blue-700 border-2 border-blue-500">
                    <span className="mr-2">⏱️</span>
                    {formatTime(elapsedTime)}
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <span className="text-sm text-gray-600">
                      {Math.round(
                        ((currentQuestionIndex + 1) / questions.length) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          ((currentQuestionIndex + 1) / questions.length) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading questions...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

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
                  {currentQuestion.difficulty && (
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
                </div>

                {/* Options */}
                <div className="space-y-3 mb-8">
                  {[
                    { label: "A", text: currentQuestion.option_a },
                    { label: "B", text: currentQuestion.option_b },
                    { label: "C", text: currentQuestion.option_c },
                    { label: "D", text: currentQuestion.option_d },
                  ].map((option, index) => {
                    const correctOptionIndex =
                      currentQuestion.correct_option
                        ?.toUpperCase()
                        .charCodeAt(0) - 65;
                    let optionStyle = "";
                    if (showResult) {
                      if (index === correctOptionIndex) {
                        optionStyle =
                          "bg-green-100 border-green-500 text-green-900";
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
                        disabled={showResult}
                        className={`w-full text-left p-4 rounded-lg border-2 transition ${optionStyle}`}
                      >
                        <div className="flex items-center">
                          <span className="font-semibold mr-3">
                            {option.label}.
                          </span>
                          <span>{option.text}</span>
                          {showResult && index === correctOptionIndex && (
                            <span className="ml-auto text-green-700 font-semibold">
                              ✓ Correct
                            </span>
                          )}
                          {showResult &&
                            index === selectedAnswer &&
                            index !== correctOptionIndex && (
                              <span className="ml-auto text-red-700 font-semibold">
                                ✗ Your Answer
                              </span>
                            )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Result Message */}
                {showResult && (
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

                {/* Solution */}
                {showResult && !isCorrect && currentQuestion.solution && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Solution:
                    </h3>
                    <p className="text-blue-800">{currentQuestion.solution}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {!showResult ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      className={`flex-1 py-3 rounded-lg font-semibold transition ${
                        selectedAnswer !== null
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                    >
                      {currentQuestionIndex < questions.length - 1
                        ? "Next Question"
                        : "Finish"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && questions.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">❓</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Questions Available
                </h3>
                <p className="text-gray-600 mb-6">
                  {difficultyParam
                    ? `No ${difficultyParam} difficulty questions found for the selected syllabus item.`
                    : "No questions found for the selected syllabus item."}
                </p>
                <button
                  onClick={() =>
                    router.push(`/exams/${examId}/sections/${sectionId}/topics`)
                  }
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition duration-200 inline-flex items-center gap-2"
                >
                  <span>←</span>
                  <span>Back to Topics</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading questions...</p>
          </div>
        </div>
      }
    >
      <QuestionsPageContent />
    </Suspense>
  );
}
