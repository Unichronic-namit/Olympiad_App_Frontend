// API Configuration
export const API_BASE_URL = "http://localhost:8000";

// API Endpoints
export const API_ENDPOINTS = {
  SIGNUP: "/signup",
  LOGIN: "/login",
  EXAMS: "/exams",
  SECTIONS: "/exams", // GET /exams/{exam_overview_id}/sections
  SYLLABUS: "/sections", // GET /sections/{section_id}/syllabus
  QUESTIONS: "/syllabus", // GET /syllabus/{syllabus_id}/questions
} as const;

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};
