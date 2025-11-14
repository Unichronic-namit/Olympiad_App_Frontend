"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
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
  question_image_url: string | null;
  option_a_image_url: string | null;
  option_b_image_url: string | null;
  option_c_image_url: string | null;
  option_d_image_url: string | null;
};

function QuestionsPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params.examId as string;
  const sectionId = params.sectionId as string;
  const syllabusId = searchParams.get("syllabus_id");
  const difficultyParam = searchParams.get("difficulty");
  const examType = searchParams.get("examType"); // "section" for section exam flow
  const isSectionExam = examType === "section";
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
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(
    new Set()
  ); // Track which questions have been submitted (showResult = true)
  const [questionResults, setQuestionResults] = useState<Map<number, boolean>>(
    new Map()
  ); // Track correct/incorrect result for each submitted question
  const [notVisitedQuestions, setNotVisitedQuestions] = useState<Set<number>>(
    new Set()
  ); // Track which questions have not been visited (not in API response)
  const [notAnsweredQuestions, setNotAnsweredQuestions] = useState<Set<number>>(
    new Set()
  ); // Track which questions have status 0 (not answered)
  const [showScore, setShowScore] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState<number>(0); // Timer counting up from zero
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // Mobile sidebar state
  const firstQuestionInitialized = useRef(false); // Track if first question PUT call has been made
  const [retryData, setRetryData] = useState<{
    user_id: number;
    exam_overview_id: number;
    section_id: number;
    syllabus_id: number;
    difficulty: string;
  } | null>(null); // Store data for retry exam POST call

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

  // Fetch saved answers from API
  // useEffect(() => {
  //   const fetchSavedAnswers = async () => {
  //     if (!practiceExamAttemptDetailsId) return;

  //     try {
  //       const response = await fetch(
  //         `${getApiUrl(
  //           API_ENDPOINTS.PRACTICE_EXAM_ATTEMPT_DETAILS
  //         )}/${practiceExamAttemptDetailsId}`,
  //         {
  //           method: "GET",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Accept: "application/json",
  //           },
  //           mode: "cors",
  //         }
  //       );

  //       const responseText = await response.text();
  //       console.log("Saved Answers API Response:", responseText);

  //       if (!response.ok) {
  //         console.error(
  //           "Failed to fetch saved answers:",
  //           responseText || response.status
  //         );
  //         return;
  //       }

  //       let savedAnswers: any[] = [];
  //       try {
  //         savedAnswers = responseText ? JSON.parse(responseText) : [];
  //       } catch (parseError) {
  //         console.error("Failed to parse saved answers:", parseError);
  //         return;
  //       }

  //       // Restore saved answers
  //       const answeredSet = new Set<number>();
  //       const answersMap = new Map<number, number>();
  //       const answersArray: boolean[] = [];
  //       const submittedSet = new Set<number>();
  //       const resultsMap = new Map<number, boolean>();
  //       const notAnsweredSet = new Set<number>();
  //       const visitedSet = new Set<number>(); // Track questions that appear in API response

  //       savedAnswers.forEach((answer: any) => {
  //         const questionId = answer.question_id;
  //         // Find the index of this question in the questions array
  //         const questionIndex = questions.findIndex(
  //           (q) => q.question_id === questionId
  //         );

  //         if (questionIndex !== -1) {
  //           // Mark as visited (appears in API response)
  //           visitedSet.add(questionIndex);

  //           // Check if status is 0 (not answered)
  //           if (answer.status === 0) {
  //             notAnsweredSet.add(questionIndex);
  //           }

  //           // Convert selected_answer letter (A, B, C, D) to index (0, 1, 2, 3)
  //           const answerIndex = answer.selected_answer
  //             ? answer.selected_answer.toUpperCase().charCodeAt(0) - 65
  //             : null;

  //           if (answerIndex !== null) {
  //             answeredSet.add(questionIndex);
  //             answersMap.set(questionIndex, answerIndex);
  //             const isCorrect = answer.status === 1;
  //             answersArray[questionIndex] = isCorrect;
  //             // Mark as submitted if it has a status (means it was submitted)
  //             if (answer.status !== undefined && answer.status !== 0) {
  //               submittedSet.add(questionIndex);
  //               resultsMap.set(questionIndex, isCorrect);
  //             }
  //           }
  //         }
  //       });

  //       // Questions not in API response are not visited
  //       const notVisitedSet = new Set<number>();
  //       questions.forEach((_, index) => {
  //         if (!visitedSet.has(index)) {
  //           notVisitedSet.add(index);
  //         }
  //       });

  //       setAnsweredQuestions(answeredSet);
  //       setQuestionAnswers(answersMap);
  //       setAnswers(answersArray);
  //       setSubmittedQuestions(submittedSet);
  //       setQuestionResults(resultsMap);
  //       setNotAnsweredQuestions(notAnsweredSet);
  //       setNotVisitedQuestions(notVisitedSet);

  //       console.log("Restored saved answers:", {
  //         answeredQuestions: Array.from(answeredSet),
  //         questionAnswers: Array.from(answersMap.entries()),
  //       });
  //     } catch (error: any) {
  //       console.error("Error fetching saved answers:", error);
  //     }
  //   };

  //   if (practiceExamAttemptDetailsId && questions.length > 0) {
  //     fetchSavedAnswers();
  //   }
  // }, [practiceExamAttemptDetailsId, questions]);

  useEffect(() => {
    // Fetch questions from API
    const fetchQuestions = async () => {
      // For section exam flow, we need sectionId; for syllabus flow, we need syllabusId
      if (
        !userData ||
        (!isSectionExam && !syllabusId) ||
        (isSectionExam && !sectionId)
      )
        return;

      setIsLoading(true);
      setError("");

      try {
        // Use different API endpoint based on exam type
        const apiUrl = isSectionExam
          ? `${getApiUrl(
              API_ENDPOINTS.SECTION_QUESTIONS
            )}/${sectionId}/questions`
          : `${getApiUrl(API_ENDPOINTS.QUESTIONS)}/${syllabusId}/questions`;

        console.log("Fetching questions from:", apiUrl);
        console.log("Exam type:", isSectionExam ? "section" : "syllabus");

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          mode: "cors",
        });

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

        // Filter by difficulty if provided (only for syllabus exam flow)
        if (difficultyParam && !isSectionExam) {
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

    if (
      userData &&
      ((!isSectionExam && syllabusId) || (isSectionExam && sectionId))
    ) {
      fetchQuestions();
    }
  }, [userData, syllabusId, sectionId, difficultyParam, isSectionExam]);

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

  // Helper function to update state from PUT response
  const updateStateFromPutResponse = (responseData: any) => {
    if (
      !responseData ||
      !responseData.que_ans_details ||
      !Array.isArray(responseData.que_ans_details)
    ) {
      return;
    }

    const queAnsDetails = responseData.que_ans_details;
    const answeredSet = new Set<number>();
    const answersMap = new Map<number, number>();
    const answersArray: boolean[] = [];
    const submittedSet = new Set<number>();
    const resultsMap = new Map<number, boolean>();
    const notAnsweredSet = new Set<number>();
    const visitedSet = new Set<number>();

    queAnsDetails.forEach((answer: any) => {
      const questionId = answer.question_id;
      // Find the index of this question in the questions array
      const questionIndex = questions.findIndex(
        (q) => q.question_id === questionId
      );

      if (questionIndex !== -1) {
        // Mark as visited (appears in API response)
        visitedSet.add(questionIndex);

        // Check if status is 0 (not answered)
        if (answer.status === 0) {
          notAnsweredSet.add(questionIndex);
        }

        // Convert selected_answer letter (A, B, C, D) to index (0, 1, 2, 3)
        const answerIndex = answer.selected_answer
          ? answer.selected_answer.toUpperCase().charCodeAt(0) - 65
          : null;

        if (answerIndex !== null) {
          answeredSet.add(questionIndex);
          answersMap.set(questionIndex, answerIndex);
          const isCorrect = answer.status === 1;
          answersArray[questionIndex] = isCorrect;
          // Mark as submitted if it has a status (means it was submitted)
          if (answer.status !== undefined && answer.status !== 0) {
            submittedSet.add(questionIndex);
            resultsMap.set(questionIndex, isCorrect);
          }
        }
      }
    });

    // Questions not in API response are not visited
    const notVisitedSet = new Set<number>();
    questions.forEach((_, index) => {
      if (!visitedSet.has(index)) {
        notVisitedSet.add(index);
      }
    });

    // Update all states
    setAnsweredQuestions(answeredSet);
    setQuestionAnswers(answersMap);
    setAnswers(answersArray);
    setSubmittedQuestions(submittedSet);
    setQuestionResults(resultsMap);
    setNotAnsweredQuestions(notAnsweredSet);
    setNotVisitedQuestions(notVisitedSet);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return; // Don't allow changing answer after submission
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = async () => {
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

    // Mark question as submitted and store the result
    setSubmittedQuestions((prev) => new Set(prev).add(currentQuestionIndex));
    setQuestionResults((prev) =>
      new Map(prev).set(currentQuestionIndex, correct)
    );

    // Remove from not visited and not answered sets if they were there
    setNotVisitedQuestions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(currentQuestionIndex);
      return newSet;
    });
    setNotAnsweredQuestions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(currentQuestionIndex);
      return newSet;
    });

    // Make PUT API call when submitting answer
    if (practiceExamAttemptDetailsId && currentQuestion) {
      try {
        // Convert selected answer index (0,1,2,3) to letter (A,B,C,D)
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

        // Set status: 1 if correct, 2 if incorrect
        const status = isCorrect ? 1 : 2;

        const requestPayload = {
          question_id: currentQuestion.question_id,
          status: status,
          selected_answer: selectedAnswerLetter,
        };

        console.log("Submitting answer - PUT API call:", {
          practiceExamAttemptDetailsId,
          question_id: currentQuestion.question_id,
          payload: requestPayload,
        });

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
        console.log("Submit answer PUT API Response:", responseText);

        if (response.ok) {
          // Parse and update state from response
          try {
            const responseData = responseText ? JSON.parse(responseText) : null;
            if (responseData) {
              updateStateFromPutResponse(responseData);
            }
          } catch (parseError) {
            console.error("Failed to parse PUT response:", parseError);
          }
        } else {
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
          console.error("Failed to submit answer:", errorMessage);
        }
      } catch (error: any) {
        console.error("Error submitting answer:", error);
      }
    }
  };

  const handleNextQuestion = async () => {
    // Move to next question or finish exam
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      // Restore the selected answer if this question was previously answered
      const savedAnswer = questionAnswers.get(nextIndex);
      setSelectedAnswer(savedAnswer !== undefined ? savedAnswer : null);
      setShowResult(false);
      setIsCorrect(false);
    } else {
      // All questions completed - call finish API
      if (practiceExamAttemptDetailsId) {
        try {
          // Calculate score (number of correct answers)
          const correctCount = answers.filter((isCorrect) => isCorrect).length;

          // Calculate total_time (elapsed time in seconds)
          const totalTimeSeconds = elapsedTime;

          // Get end_time (current timestamp in ISO format)
          const endTime = new Date().toISOString();

          const finishPayload = {
            score: correctCount,
            total_time: totalTimeSeconds,
            end_time: endTime,
          };

          console.log("Finishing exam from Next Question - PUT API call:", {
            practiceExamAttemptDetailsId,
            payload: finishPayload,
          });

          const finishResponse = await fetch(
            `${getApiUrl(
              API_ENDPOINTS.PRACTICE_EXAM_ATTEMPT_DETAILS_FINISH
            )}/${practiceExamAttemptDetailsId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              mode: "cors",
              body: JSON.stringify(finishPayload),
            }
          );

          const finishResponseText = await finishResponse.text();
          console.log(
            "Finish exam PUT API Response (from Next Question):",
            finishResponseText
          );

          if (finishResponse.ok) {
            // Parse and update state from response if needed
            try {
              const finishResponseData = finishResponseText
                ? JSON.parse(finishResponseText)
                : null;
              if (finishResponseData) {
                // Update state from finish response if needed
                updateStateFromPutResponse(finishResponseData);

                // Extract retry data from finish response
                if (finishResponseData.user_practice_exam) {
                  const userPracticeExam =
                    finishResponseData.user_practice_exam;
                  setRetryData({
                    user_id: userPracticeExam.user_id || 0,
                    exam_overview_id: userPracticeExam.exam_overview_id || 0,
                    section_id: userPracticeExam.section_id || 0,
                    syllabus_id: userPracticeExam.syllabus_id || 0,
                    difficulty: userPracticeExam.difficulty || "easy",
                  });
                  console.log("Stored retry data:", {
                    user_id: userPracticeExam.user_id,
                    exam_overview_id: userPracticeExam.exam_overview_id,
                    section_id: userPracticeExam.section_id,
                    syllabus_id: userPracticeExam.syllabus_id,
                    difficulty: userPracticeExam.difficulty,
                  });
                }
              }
            } catch (parseError) {
              console.error("Failed to parse finish response:", parseError);
            }
          } else {
            console.error(
              "Failed to finish exam:",
              finishResponseText || finishResponse.status
            );
          }
        } catch (error: any) {
          console.error("Error finishing exam:", error);
        }
      }

      // Stop the timer
      setIsTimerActive(false);

      // Show score screen
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

  const handleFinish = async () => {
    // Save current answer before finishing (if answer is selected)
    const currentQuestion =
      questions.length > 0 ? questions[currentQuestionIndex] : null;

    if (
      practiceExamAttemptDetailsId &&
      currentQuestion &&
      selectedAnswer !== null
    ) {
      try {
        const selectedAnswerLetter =
          selectedAnswer !== null
            ? String.fromCharCode(65 + selectedAnswer)
            : "";

        const correctOption = currentQuestion.correct_option
          ?.toUpperCase()
          .trim();
        const isCorrect =
          selectedAnswerLetter !== "" &&
          selectedAnswerLetter.toUpperCase() === correctOption;
        const status = isCorrect ? 1 : 2;

        const requestPayload = {
          question_id: currentQuestion.question_id,
          status: status,
          selected_answer: selectedAnswerLetter,
        };

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
        if (response.ok) {
          // Parse and update state from response
          try {
            const responseData = responseText ? JSON.parse(responseText) : null;
            if (responseData) {
              updateStateFromPutResponse(responseData);
            }
          } catch (parseError) {
            console.error("Failed to parse PUT response:", parseError);
          }
        }
      } catch (error: any) {
        console.error("Error saving answer:", error);
      }
    }

    // Mark current question as answered if an answer was selected
    if (selectedAnswer !== null && currentQuestion) {
      setAnsweredQuestions((prev) => new Set(prev).add(currentQuestionIndex));
      setQuestionAnswers((prev) =>
        new Map(prev).set(currentQuestionIndex, selectedAnswer)
      );
    }

    // Calculate score and time for finish API call
    if (practiceExamAttemptDetailsId) {
      try {
        // Calculate score (number of correct answers)
        const correctCount = answers.filter((isCorrect) => isCorrect).length;

        // Calculate total_time (elapsed time in seconds)
        const totalTimeSeconds = elapsedTime;

        // Get end_time (current timestamp in ISO format)
        const endTime = new Date().toISOString();

        const finishPayload = {
          score: correctCount,
          total_time: totalTimeSeconds,
          end_time: endTime,
        };

        console.log("Finishing exam - PUT API call:", {
          practiceExamAttemptDetailsId,
          payload: finishPayload,
        });

        const finishResponse = await fetch(
          `${getApiUrl(
            API_ENDPOINTS.PRACTICE_EXAM_ATTEMPT_DETAILS_FINISH
          )}/${practiceExamAttemptDetailsId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            mode: "cors",
            body: JSON.stringify(finishPayload),
          }
        );

        const finishResponseText = await finishResponse.text();
        console.log("Finish exam PUT API Response:", finishResponseText);

        if (finishResponse.ok) {
          // Parse and update state from response if needed
          try {
            const finishResponseData = finishResponseText
              ? JSON.parse(finishResponseText)
              : null;
            if (finishResponseData) {
              // Update state from finish response if needed
              updateStateFromPutResponse(finishResponseData);

              // Extract retry data from finish response
              if (finishResponseData.user_practice_exam) {
                const userPracticeExam = finishResponseData.user_practice_exam;
                setRetryData({
                  user_id: userPracticeExam.user_id || 0,
                  exam_overview_id: userPracticeExam.exam_overview_id || 0,
                  section_id: userPracticeExam.section_id || 0,
                  syllabus_id: userPracticeExam.syllabus_id || 0,
                  difficulty: userPracticeExam.difficulty || "easy",
                });
                console.log("Stored retry data (from Finish button):", {
                  user_id: userPracticeExam.user_id,
                  exam_overview_id: userPracticeExam.exam_overview_id,
                  section_id: userPracticeExam.section_id,
                  syllabus_id: userPracticeExam.syllabus_id,
                  difficulty: userPracticeExam.difficulty,
                });
              }
            }
          } catch (parseError) {
            console.error("Failed to parse finish response:", parseError);
          }
        } else {
          console.error(
            "Failed to finish exam:",
            finishResponseText || finishResponse.status
          );
        }
      } catch (error: any) {
        console.error("Error finishing exam:", error);
      }
    }

    // Stop the timer
    setIsTimerActive(false);

    // Show score screen
    setShowScore(true);
  };

  const handleRetry = async () => {
    // Make POST call to start new practice session
    if (retryData) {
      try {
        const requestPayload = {
          user_id: retryData.user_id,
          exam_overview_id: retryData.exam_overview_id,
          section_id: retryData.section_id,
          syllabus_id: retryData.syllabus_id,
          difficulty: retryData.difficulty.toLowerCase(), // Convert to lowercase for API
        };

        console.log("Retrying exam - POST API call:", {
          payload: requestPayload,
        });

        const response = await fetch(
          getApiUrl(API_ENDPOINTS.USER_PRACTICE_EXAM),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            mode: "cors",
            body: JSON.stringify(requestPayload),
          }
        );

        const responseText = await response.text();
        console.log("Retry exam POST Response Status:", response.status);
        console.log("Retry exam POST Response:", responseText);

        if (response.ok) {
          // Parse response to get practice_exam_attempt_details_id
          try {
            const responseData = responseText ? JSON.parse(responseText) : {};
            const newPracticeExamAttemptDetailsId =
              responseData.practice_exam_attempt_details_id ||
              responseData.id ||
              responseData.attempt_id ||
              (Array.isArray(responseData) && responseData.length > 0
                ? responseData[0].practice_exam_attempt_details_id ||
                  responseData[0].id
                : null);

            console.log(
              "New Practice Exam Attempt Details ID:",
              newPracticeExamAttemptDetailsId
            );

            // Store new practice_exam_attempt_details_id in localStorage
            if (newPracticeExamAttemptDetailsId) {
              localStorage.setItem(
                "practice_exam_attempt_details_id",
                newPracticeExamAttemptDetailsId.toString()
              );
              setPracticeExamAttemptDetailsId(
                newPracticeExamAttemptDetailsId.toString()
              );
              console.log(
                "Stored new practice_exam_attempt_details_id in localStorage:",
                newPracticeExamAttemptDetailsId
              );
            }
          } catch (parseError) {
            console.error("Failed to parse retry response:", parseError);
          }
        } else {
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
          console.error("Failed to retry exam:", errorMessage);
        }
      } catch (error: any) {
        console.error("Error retrying exam:", error);
      }
    } else {
      console.error("Retry data not available. Cannot retry exam.");
    }

    // Reset all exam state
    setShowScore(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
    setAnswers([]);
    setAnsweredQuestions(new Set());
    setQuestionAnswers(new Map());
    setSubmittedQuestions(new Set());
    setQuestionResults(new Map());
    setNotVisitedQuestions(new Set());
    setNotAnsweredQuestions(new Set());
    setElapsedTime(0); // Reset timer to zero
    setIsTimerActive(true);
    firstQuestionInitialized.current = false; // Reset first question initialization flag
  };

  const handleQuestionClick = async (index: number) => {
    setCurrentQuestionIndex(index);
    // Restore the selected answer if this question was previously answered
    const savedAnswer = questionAnswers.get(index);
    setSelectedAnswer(savedAnswer !== undefined ? savedAnswer : null);

    // If question was previously submitted, restore the result state
    if (submittedQuestions.has(index)) {
      const wasCorrect = questionResults.get(index) ?? false;
      setIsCorrect(wasCorrect);
      setShowResult(true);
    } else {
      setShowResult(false);
      setIsCorrect(false);
    }

    // Check if question is already answered (green) or not answered (purple)
    const isAnswered = answeredQuestions.has(index);
    const isNotAnswered = notAnsweredQuestions.has(index);

    // Don't make PUT API call if question is already answered (green) or not answered (purple)
    if (isAnswered || isNotAnswered) {
      // Just remove from not visited set if it was there
      setNotVisitedQuestions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
      return; // Skip the PUT API call
    }

    // Remove from not visited and not answered sets when clicked (if they were there)
    setNotVisitedQuestions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
    setNotAnsweredQuestions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });

    // Make PUT API call when clicking on a question (only for not visited questions)
    if (
      practiceExamAttemptDetailsId &&
      questions.length > 0 &&
      index < questions.length
    ) {
      const clickedQuestion = questions[index];

      try {
        const requestPayload = {
          question_id: clickedQuestion.question_id,
          status: 0,
          selected_answer: null,
        };

        console.log("Question clicked - PUT API call:", {
          practiceExamAttemptDetailsId,
          question_id: clickedQuestion.question_id,
          payload: requestPayload,
        });

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
        console.log("Question click PUT API Response:", responseText);

        if (response.ok) {
          // Parse and update state from response
          try {
            const responseData = responseText ? JSON.parse(responseText) : null;
            if (responseData) {
              updateStateFromPutResponse(responseData);
            }
          } catch (parseError) {
            console.error("Failed to parse PUT response:", parseError);
          }
        } else {
          console.error(
            "Failed to update question click:",
            responseText || response.status
          );
        }
      } catch (error: any) {
        console.error("Error updating question click:", error);
      }
    }
  };

  // PUT API call for first question when page loads
  useEffect(() => {
    const initializeFirstQuestion = async () => {
      if (
        practiceExamAttemptDetailsId &&
        questions.length > 0 &&
        currentQuestionIndex === 0 &&
        !firstQuestionInitialized.current
      ) {
        const firstQuestion = questions[0];

        try {
          const requestPayload = {
            question_id: firstQuestion.question_id,
            status: 0,
            selected_answer: null,
          };

          console.log("Initializing first question - PUT API call:", {
            practiceExamAttemptDetailsId,
            question_id: firstQuestion.question_id,
            payload: requestPayload,
          });

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
            "First question initialization PUT API Response:",
            responseText
          );

          if (response.ok) {
            // Parse and update state from response
            try {
              const responseData = responseText
                ? JSON.parse(responseText)
                : null;
              if (responseData) {
                updateStateFromPutResponse(responseData);
              }
            } catch (parseError) {
              console.error("Failed to parse PUT response:", parseError);
            }
            // Mark as initialized only on success
            firstQuestionInitialized.current = true;
          } else {
            console.error(
              "Failed to initialize first question:",
              responseText || response.status
            );
          }
        } catch (error: any) {
          console.error("Error initializing first question:", error);
        }
      }
    };

    // Only call once when questions are first loaded and we're on the first question
    if (
      questions.length > 0 &&
      currentQuestionIndex === 0 &&
      !firstQuestionInitialized.current
    ) {
      initializeFirstQuestion();
    }
  }, [practiceExamAttemptDetailsId, questions, currentQuestionIndex]);

  // Restore saved answer and result state when current question changes
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const savedAnswer = questionAnswers.get(currentQuestionIndex);
      if (savedAnswer !== undefined) {
        setSelectedAnswer(savedAnswer);
      } else {
        setSelectedAnswer(null);
      }

      // If question was previously submitted, restore the result state
      if (submittedQuestions.has(currentQuestionIndex)) {
        const wasCorrect = questionResults.get(currentQuestionIndex) ?? false;
        setIsCorrect(wasCorrect);
        setShowResult(true);
      } else {
        setShowResult(false);
        setIsCorrect(false);
      }
    }
  }, [
    currentQuestionIndex,
    questions,
    questionAnswers,
    submittedQuestions,
    questionResults,
  ]);

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
      <Navbar
        isQuestionsPage={true}
        onMobileMenuClick={() => setIsMobileSidebarOpen(true)}
      />

      {/* Main Content Area */}
      <main className="md:ml-64">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="flex gap-6 items-start">
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

            {/* Main Question Content */}
            <div className="flex-1 max-w-4xl">
              {/* Timer, Finish Button, and Progress Bar - Above Question Display */}
              {questions.length > 0 && !showScore && (
                <div className="mb-6 space-y-4">
                  {/* Timer and Finish Button Row */}
                  <div className="flex justify-between items-center">
                    {/* Timer - Top Left */}
                    <div className="px-4 py-2 rounded-lg font-mono text-lg font-bold bg-blue-100 text-blue-700 border-2 border-blue-500">
                      <span className="mr-2">⏱️</span>
                      {formatTime(elapsedTime)}
                    </div>

                    {/* Finish Button - Top Right */}
                    <button
                      onClick={handleFinish}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200"
                    >
                      Finish
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        Question {currentQuestionIndex + 1} of{" "}
                        {questions.length}
                      </span>
                      <span className="text-sm text-gray-600">
                        {/* {Math.round(
                          ((currentQuestionIndex + 1) / questions.length) * 100
                        )}
                        % */}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            ((currentQuestionIndex + 1) / questions.length) *
                            100
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
                          optionStyle =
                            "bg-red-100 border-red-500 text-red-900";
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
                          <div className="flex items-start">
                            <span className="font-semibold mr-3 mt-1">
                              {option.label}.
                            </span>
                            <div className="flex-1">
                              {option.text && (
                                <span className="block mb-2">
                                  {option.text}
                                </span>
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
                            {showResult && index === correctOptionIndex && (
                              <span className="ml-auto text-green-700 font-semibold whitespace-nowrap">
                                ✓ Correct
                              </span>
                            )}
                            {showResult &&
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
                      <p className="text-blue-800">
                        {currentQuestion.solution}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    {!showResult ? (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={
                          selectedAnswer === null ||
                          submittedQuestions.has(currentQuestionIndex)
                        }
                        className={`flex-1 py-3 rounded-lg font-semibold transition ${
                          selectedAnswer !== null &&
                          !submittedQuestions.has(currentQuestionIndex)
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
                      router.push(
                        `/exams/${examId}/sections/${sectionId}/topics`
                      )
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
