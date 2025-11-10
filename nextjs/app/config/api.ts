// API Configuration
export const API_BASE_URL = "https://olympiad-app-backend-1.onrender.com";

// API Endpoints
export const API_ENDPOINTS = {
  SIGNUP: "/signup",
  LOGIN: "/login",
  EXAMS: "/exams",
  USER_EXAMS: "/user_exam", // GET /user_exam/{user_id}
  USER_INFO: "/user_info", // GET /user_info/{user_id}
  SECTIONS: "/exams", // GET /exams/{exam_overview_id}/sections
  SYLLABUS: "/sections", // GET /sections/{section_id}/syllabus
  QUESTIONS: "/syllabus", // GET /syllabus/{syllabus_id}/questions
  USER_PRACTICE_EXAM: "/user_practice_exam", // POST /user_practice_exam, GET /user_practice_exam/{user_id}
  PRACTICE_EXAM_ATTEMPT_DETAILS: "/practice_exam_attempt_details", // PUT /practice_exam_attempt_details/{practice_exam_attempt_details_id}
  PRACTICE_EXAM_ATTEMPT_DETAILS_FINISH: "/practice_exam_attempt_details_finish", // PUT /practice_exam_attempt_details_finish/{practice_exam_attempt_details_id}
} as const;

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};
