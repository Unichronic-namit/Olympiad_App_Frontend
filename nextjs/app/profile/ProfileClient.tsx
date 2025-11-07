"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik, FieldArray, FormikProvider } from "formik";
import { z } from "zod";
import { ChevronDownIcon, X } from "lucide-react";
import Navbar from "../components/dashboard/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiUrl, API_ENDPOINTS } from "@/app/config/api";
import { MultiSelect } from "@/components/ui/multi-select";

type GradeExam = {
  grade: number;
  exams: number[]; // Array of exam_overview_id values
  isExisting?: boolean; // Flag to mark existing entries from userExams
};

type UserData = {
  first_name: string;
  last_name: string;
  email: string;
  grade_exams: GradeExam[];
  date_of_birth: string;
  phone_number: string;
  country_code: string;
  school_name: string;
  city: string;
  state: string;
  profile_image?: string;
};

// Zod validation schema
const userDataSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .regex(
      /^[A-Za-z\s'-]+$/,
      "First name can only contain letters, spaces, hyphens, and apostrophes"
    ),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .regex(
      /^[A-Za-z\s'-]+$/,
      "Last name can only contain letters, spaces, hyphens, and apostrophes"
    ),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  grade_exams: z
    .array(
      z.object({
        grade: z.number().min(0).max(12), // Allow 0 for unselected grade
        exams: z
          .array(z.number().min(1))
          .min(1, "At least one exam must be selected"),
        isExisting: z.boolean().optional(),
      })
    )
    .min(1, "At least one grade-exam combination must be selected")
    .refine(
      (items) => {
        // Filter out items with grade 0 (unselected) for validation
        const validItems = items.filter((item) => item.grade > 0);
        return validItems.length > 0;
      },
      { message: "At least one grade-exam combination must be selected" }
    ),
  date_of_birth: z
    .string()
    .min(1, "Date of birth is required")
    .refine(
      (date) => {
        const dobDate = new Date(date);
        const now = new Date();
        return dobDate <= now;
      },
      { message: "Date of birth cannot be in the future" }
    )
    .refine(
      (date) => {
        const dobDate = new Date(date);
        const now = new Date();
        const age =
          (now.getTime() - dobDate.getTime()) / (365.25 * 24 * 3600 * 1000);
        return age >= 5;
      },
      { message: "Minimum age is 5 years" }
    ),
  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9]{7,15}$/, "Phone number must be 7-15 digits"),
  country_code: z
    .string()
    .min(1, "Country code is required")
    .regex(/^\+[0-9]{1,4}$/, "Country code must be in format +XXX"),
  school_name: z
    .string()
    .min(1, "School name is required")
    .min(2, "School name must be at least 2 characters"),
  city: z
    .string()
    .min(1, "City is required")
    .min(2, "City must be at least 2 characters"),
  state: z
    .string()
    .min(1, "State is required")
    .min(2, "State must be at least 2 characters"),
  profile_image: z.string().optional(),
});

export default function ProfileClient() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [exams, setExams] = useState<any[]>([]);
  const [userExams, setUserExams] = useState<any[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const formik = useFormik<UserData>({
    initialValues: {
    first_name: "",
    last_name: "",
    email: "",
      grade_exams: [{ grade: 8, exams: [], isExisting: false }],
    date_of_birth: "",
    phone_number: "",
    country_code: "+91",
    school_name: "",
    city: "",
    state: "",
    profile_image: "",
    },
    enableReinitialize: true,
    validate: (values) => {
      try {
        userDataSchema.parse(values);
        return {};
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors: any = {};
          error.issues.forEach((issue) => {
            const path = issue.path;
            if (path.length === 0) return;

            // Handle nested paths like grade_exams[0].grade or grade_exams[0].exams
            if (path.length > 1) {
              const [fieldName, index, nestedField] = path;
              if (fieldName === "grade_exams" && typeof index === "number") {
                if (!errors.grade_exams) {
                  errors.grade_exams = [];
                }
                if (!errors.grade_exams[index]) {
                  errors.grade_exams[index] = {};
                }
                if (nestedField) {
                  errors.grade_exams[index][nestedField] = issue.message;
                } else {
                  errors.grade_exams[index] = issue.message;
                }
              } else {
                // Handle other nested fields
                const key = path.join(".");
                errors[key] = issue.message;
              }
            } else {
              // Handle simple fields
              errors[path[0].toString()] = issue.message;
            }
          });
          return errors;
        }
        return {};
      }
    },
    onSubmit: async (values) => {
      try {
        setErrorMessage("");
        setSuccessMessage("");

        // Get user_id from localStorage
        const storedUserData = localStorage.getItem("user_data");
        if (!storedUserData) {
          setErrorMessage("User data not found. Please login again.");
          return;
        }

        const parsedStoredData = JSON.parse(storedUserData);
        const userId = parsedStoredData.user_id;

        if (!userId) {
          setErrorMessage("User ID not found. Please login again.");
          return;
        }

        const userIdString = String(userId);

        // Prepare user info payload (excluding grade_exams)
        const userInfoPayload = {
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          date_of_birth: values.date_of_birth,
          country_code: values.country_code,
          phone_number: values.phone_number,
          profile_image: values.profile_image || "",
          school_name: values.school_name,
          city: values.city,
          state: values.state,
        };

        // 1. PUT request to update user info
        const userInfoUrl = `${getApiUrl(
          API_ENDPOINTS.USER_INFO
        )}/${userIdString}`;
        console.log("Updating user info:", userInfoUrl);
        console.log("User info payload:", userInfoPayload);

        const userInfoResponse = await fetch(userInfoUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          mode: "cors",
          body: JSON.stringify(userInfoPayload),
        });

        const userInfoResponseText = await userInfoResponse.text();
        console.log("User Info PUT Response Status:", userInfoResponse.status);
        console.log("User Info PUT Response:", userInfoResponseText);

        if (!userInfoResponse.ok) {
          let errorMessage = userInfoResponseText;
          try {
            const errorData = JSON.parse(userInfoResponseText);
            errorMessage =
              errorData.detail || errorData.message || userInfoResponseText;
          } catch {
            // Use text as is
          }
          throw new Error(
            errorMessage ||
              `Failed to update user info: ${userInfoResponse.status}`
          );
        }

        // 2. POST request to update user_exams
        // Prepare user_exams payload - flatten exams arrays to array of exam_overview_id integers
        // Get all existing exam IDs to filter them out
        const existingExamIds = userExams.map(
          (exam: any) => exam.exam_overview_id
        );

        // Get all selected exam IDs from the form
        const allSelectedExamIds = values.grade_exams.flatMap((item) =>
          item.exams.filter((examId) => examId > 0)
        );

        // Filter out existing exam IDs to get only newly added exams
        const newExamIds = allSelectedExamIds.filter(
          (examId) => !existingExamIds.includes(examId)
        );

        console.log("Existing exam IDs:", existingExamIds);
        console.log("All selected exam IDs:", allSelectedExamIds);
        console.log("New exam IDs to add:", newExamIds);

        // Use USER_EXAMS endpoint for POST to update user_exams table
        const userExamsUrl = `${getApiUrl(
          API_ENDPOINTS.USER_EXAMS
        )}/${userIdString}`;
        console.log("Updating user exams:", userExamsUrl);

        // Only send request if there are new exams to add
        if (newExamIds.length > 0) {
          console.log("Sending new exam IDs:", newExamIds);
          const userExamsResponse = await fetch(userExamsUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            mode: "cors",
            body: JSON.stringify({ exam_overview_ids: newExamIds }),
          });

          const userExamsResponseText = await userExamsResponse.text();
          console.log(
            "User Exams POST Response Status:",
            userExamsResponse.status
          );
          console.log("User Exams POST Response:", userExamsResponseText);

          if (!userExamsResponse.ok) {
            let errorMessage = userExamsResponseText;
            try {
              const errorData = JSON.parse(userExamsResponseText);
              // Handle different error response formats
              if (typeof errorData === "object") {
                errorMessage =
                  errorData.detail ||
                  errorData.message ||
                  errorData.error ||
                  JSON.stringify(errorData);
              } else {
                errorMessage = userExamsResponseText;
              }
            } catch {
              // Use text as is if parsing fails
              errorMessage =
                userExamsResponseText || `HTTP ${userExamsResponse.status}`;
            }
            throw new Error(
              errorMessage ||
                `Failed to update user exams: ${userExamsResponse.status}`
            );
          }
        } else {
          console.log("No new exams to add, skipping POST request");
        }

        // Update localStorage
        const updatedUserData = { ...userData, ...values };
        // localStorage.setItem("user_data", JSON.stringify(updatedUserData));

        // Refresh user data from API
        const refreshedResponse = await fetch(userInfoUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          mode: "cors",
        });

        if (refreshedResponse.ok) {
          const refreshedResponseText = await refreshedResponse.text();
          try {
            const refreshedData = refreshedResponseText
              ? JSON.parse(refreshedResponseText)
              : {};
            setUserData(refreshedData);
          } catch {
            setUserData(updatedUserData);
          }
        } else {
          setUserData(updatedUserData);
        }

        // Refresh user exams
        const refreshedExamsResponse = await fetch(
          `${getApiUrl(API_ENDPOINTS.USER_EXAMS)}/${userIdString}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            mode: "cors",
          }
        );

        if (refreshedExamsResponse.ok) {
          const refreshedExamsResponseText =
            await refreshedExamsResponse.text();
          try {
            const refreshedExamsData = refreshedExamsResponseText
              ? JSON.parse(refreshedExamsResponseText)
              : [];
            const examsData = Array.isArray(refreshedExamsData)
              ? refreshedExamsData
              : refreshedExamsData.exams || refreshedExamsData.data || [];
            setUserExams(examsData);
          } catch {
            // Keep existing userExams if parsing fails
          }
        }

        setIsEditing(false);
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error: any) {
        console.error("Error updating profile:", error);
        setErrorMessage(
          error.message || "Failed to update profile. Please try again."
        );
      }
    },
  });

  useEffect(() => {
    // Check authentication
    const authenticated = localStorage.getItem("authenticated");
    const storedUserData = localStorage.getItem("user_data");

    if (!authenticated || !storedUserData) {
      router.push("/login");
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const parsedStoredData = JSON.parse(storedUserData);
        const userId = parsedStoredData.user_id;

        console.log("Stored user data:", parsedStoredData);
        console.log("Extracted user_id:", userId);
        console.log("user_id type:", typeof userId);

        if (!userId) {
          console.error("user_id not found in stored user data");
          router.push("/login");
          return;
        }

        setIsLoading(true);
        setErrorMessage("");

        // Fetch user info from API
        // Ensure user_id is converted to string for URL
        const userIdString = String(userId);
        const apiUrl = `${getApiUrl(API_ENDPOINTS.USER_INFO)}/${userIdString}`;
        console.log("Fetching user info from:", apiUrl);

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          mode: "cors",
        });

        const responseText = await response.text();
        console.log("User Info API Response Status:", response.status);
        console.log("User Info API Response:", responseText);
        console.log("User ID used:", userId);
        console.log("Full API URL:", apiUrl);

        if (!response.ok) {
          // If 404, show more helpful error
          if (response.status === 404) {
            console.error("User not found. User ID:", userId);
            setErrorMessage(
              `User profile not found. Please check if user_id is correct: ${userId}`
            );
            // Fallback to localStorage data
      const parsedData = JSON.parse(storedUserData);
      setUserData(parsedData);
            setIsLoading(false);
            return;
          }
          throw new Error(
            responseText || `Failed to fetch user info: ${response.status}`
          );
        }

        let apiData: any;
        try {
          apiData = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          console.error("Failed to parse JSON:", parseError);
          throw new Error("Invalid response from server");
        }

        console.log("User info from API:", apiData);

        // Set user data from API response
        setUserData(apiData);

        // Handle grade_exams - if not in API response, initialize with empty array or default
        let grade_exams: GradeExam[] = [];
        if (apiData.grade_exams && Array.isArray(apiData.grade_exams)) {
          // Convert old format {grade, exam} to new format {grade, exams}
          grade_exams = apiData.grade_exams.map((item: any) => ({
            grade: item.grade,
            exams: item.exam ? [item.exam] : item.exams || [],
            isExisting: false,
          }));
        } else if (apiData.grades && Array.isArray(apiData.grades)) {
          grade_exams = apiData.grades.map((grade: number) => ({
            grade,
            exams: [],
            isExisting: false,
          }));
        } else if (apiData.grade) {
          grade_exams = [
            { grade: apiData.grade, exams: [], isExisting: false },
          ];
        } else {
          grade_exams = [{ grade: 8, exams: [], isExisting: false }];
        }

        formik.setValues({
          first_name: apiData.first_name || "",
          last_name: apiData.last_name || "",
          email: apiData.email || "",
          grade_exams: grade_exams,
          date_of_birth: apiData.date_of_birth || "",
          phone_number: apiData.phone_number || "",
          country_code: apiData.country_code || "+91",
          school_name: apiData.school_name || "",
          city: apiData.city || "",
          state: apiData.state || "",
          profile_image: apiData.profile_image || "",
        });
      } catch (error: any) {
        console.error("Error fetching user info:", error);
        setErrorMessage(
          error.message || "Failed to load profile. Please try again later."
        );
        // Fallback to localStorage data if API fails
        try {
          const parsedData = JSON.parse(storedUserData);
          setUserData(parsedData);
        } catch (fallbackError) {
          console.error("Error parsing fallback data:", fallbackError);
      router.push("/login");
        }
    } finally {
      setIsLoading(false);
    }
    };

    fetchUserInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Fetch user exams from API
  useEffect(() => {
    const fetchUserExams = async () => {
      const storedUserData = localStorage.getItem("user_data");
      if (!storedUserData) return;

      try {
        const parsedStoredData = JSON.parse(storedUserData);
        const userId = parsedStoredData.user_id;

        if (!userId) {
          console.error("user_id not found");
          return;
        }

        setIsLoadingExams(true);
        const userIdString = String(userId);
        const apiUrl = `${getApiUrl(API_ENDPOINTS.USER_EXAMS)}/${userIdString}`;
        console.log("Fetching user exams from:", apiUrl);

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          mode: "cors",
        });

        const responseText = await response.text();
        console.log("User Exams API Response:", responseText);

        if (!response.ok) {
          throw new Error(
            responseText || `Failed to fetch user exams: ${response.status}`
          );
        }

        let data: any;
        try {
          data = responseText ? JSON.parse(responseText) : [];
        } catch (parseError) {
          console.error("Failed to parse JSON:", parseError);
          throw new Error("Invalid response from server");
        }

        const examsData = Array.isArray(data)
          ? data
          : data.exams || data.data || [];

        console.log("User's registered exams:", examsData);
        setUserExams(examsData);
      } catch (error: any) {
        console.error("Error fetching user exams:", error);
        // Don't show error for user exams, just log it
      } finally {
        setIsLoadingExams(false);
      }
    };

    if (userData) {
      fetchUserExams();
    }
  }, [userData]);

  // Initialize grade_exams from userExams when editing starts
  useEffect(() => {
    if (
      isEditing &&
      userExams.length > 0 &&
      formik.values.grade_exams.length === 1 &&
      !formik.values.grade_exams[0].isExisting
    ) {
      const groupedByGrade = getExamsByGradeFromArray(userExams);
      const initialGradeExams: GradeExam[] = Object.entries(groupedByGrade).map(
        ([grade, exams]) => ({
          grade: Number(grade),
          exams: exams.map((e: any) => e.exam_overview_id),
          isExisting: true,
        })
      );

      if (initialGradeExams.length > 0) {
        formik.setFieldValue("grade_exams", initialGradeExams);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, userExams]);

  // Helper function to group exams by grade
  const getExamsByGradeFromArray = (
    examsArray: any[]
  ): Record<number, any[]> => {
    const grouped: Record<number, any[]> = {};
    examsArray.forEach((exam: any) => {
      if (!grouped[exam.grade]) {
        grouped[exam.grade] = [];
      }
      grouped[exam.grade].push(exam);
    });
    return grouped;
  };

  // Fetch exams from API
  useEffect(() => {
    const fetchExams = async () => {
      setIsLoadingExams(true);
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

        const examsData = Array.isArray(data)
          ? data
          : data.exams || data.data || [];

        setExams(examsData);
      } catch (error: any) {
        console.error("Error fetching exams:", error);
        setErrorMessage(
          error.message || "Failed to load exams. Please try again later."
        );
    } finally {
        setIsLoadingExams(false);
      }
    };

    fetchExams();
  }, []);

  const handleCancel = () => {
    setIsEditing(false);
    if (userData) {
      // Handle both old format and new format
      let grade_exams: GradeExam[] = [];
      if (
        (userData as any).grade_exams &&
        Array.isArray((userData as any).grade_exams)
      ) {
        // Convert old format {grade, exam} to new format {grade, exams}
        grade_exams = (userData as any).grade_exams.map((item: any) => ({
          grade: item.grade,
          exams: item.exam ? [item.exam] : item.exams || [],
          isExisting: false,
        }));
      } else if (
        (userData as any).grades &&
        Array.isArray((userData as any).grades)
      ) {
        grade_exams = (userData as any).grades.map((grade: number) => ({
          grade,
          exams: [],
          isExisting: false,
        }));
      } else if ((userData as any).grade) {
        grade_exams = [
          { grade: (userData as any).grade, exams: [], isExisting: false },
        ];
      } else {
        grade_exams = [{ grade: 8, exams: [], isExisting: false }];
      }

      formik.setValues({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        email: userData.email || "",
        grade_exams: grade_exams,
        date_of_birth: userData.date_of_birth || "",
        phone_number: userData.phone_number || "",
        country_code: userData.country_code || "+91",
        school_name: userData.school_name || "",
        city: userData.city || "",
        state: userData.state || "",
        profile_image: userData.profile_image || "",
      });
    }
  };

  const getFilteredExams = (grade: number) => {
    if (!grade) return [];
    return exams.filter((exam) => exam.grade === grade);
  };

  // Get available grades (excluding already used grades for new entries)
  const getAvailableGrades = (currentIndex: number): number[] => {
    const usedGrades = formik.values.grade_exams
      .filter((_, idx) => idx !== currentIndex)
      .map((item) => item.grade)
      .filter((grade) => grade > 0); // Filter out grade 0 (unselected)
    return Array.from({ length: 12 }, (_, i) => i + 1).filter(
      (grade) => !usedGrades.includes(grade)
    );
  };

  // Get registered exam IDs for a grade (from userExams)
  const getRegisteredExamIds = (grade: number): number[] => {
    return userExams
      .filter((exam: any) => exam.grade === grade)
      .map((exam: any) => exam.exam_overview_id);
  };

  // Group user exams by grade
  const getExamsByGrade = (): Record<number, any[]> => {
    const grouped: Record<number, any[]> = {};
    userExams.forEach((exam: any) => {
      if (!grouped[exam.grade]) {
        grouped[exam.grade] = [];
      }
      grouped[exam.grade].push(exam);
    });
    return grouped;
  };

  // Format date as DD/MM/YYYY
  const formatDate = (dateString: string): string => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "Invalid date";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="md:ml-64">
        <div className="container mx-auto px-4 md:px-6 py-8 max-w-4xl">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600 mt-1">
                  Manage your account information and preferences
                </p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Messages */}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">{successMessage}</p>
              </div>
            )}
            {errorMessage && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{errorMessage}</p>
              </div>
            )}

            {/* Profile Form */}
            <FormikProvider value={formik}>
            <div className="space-y-6">
                {/* Profile Image Section */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    {isEditing ? (
                      <div className="flex flex-col items-center">
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 mb-4">
                          {formik.values.profile_image ? (
                            <img
                              src={formik.values.profile_image}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-4xl text-gray-400">
                                {userData?.first_name?.[0]?.toUpperCase() ||
                                  userData?.last_name?.[0]?.toUpperCase() ||
                                  "?"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Validate file size (max 5MB)
                                if (file.size > 5 * 1024 * 1024) {
                                  setErrorMessage(
                                    "Image size must be less than 5MB"
                                  );
                                  return;
                                }
                                // Validate file type
                                if (!file.type.startsWith("image/")) {
                                  setErrorMessage(
                                    "Please select a valid image file"
                                  );
                                  return;
                                }
                                // Convert to base64
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const base64String = reader.result as string;
                                  formik.setFieldValue(
                                    "profile_image",
                                    base64String
                                  );
                                  setErrorMessage("");
                                };
                                reader.onerror = () => {
                                  setErrorMessage("Failed to read image file");
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {formik.values.profile_image
                              ? "Change Photo"
                              : "Upload Photo"}
                          </Button>
                        </div>
                        {formik.values.profile_image && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="mt-2 text-red-600 hover:text-red-700"
                            onClick={() => {
                              formik.setFieldValue("profile_image", "");
                            }}
                          >
                            Remove Photo
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                        {userData?.profile_image ? (
                          <img
                            src={userData.profile_image}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-4xl text-gray-400">
                              {userData?.first_name?.[0]?.toUpperCase() ||
                                userData?.last_name?.[0]?.toUpperCase() ||
                                "?"}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-lg font-semibold text-gray-900">
                      {userData?.first_name} {userData?.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{userData?.email}</p>
                  </div>
                </div>

              {/* Personal Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    {isEditing ? (
                        <div>
                          <Input
                        type="text"
                        name="first_name"
                            value={formik.values.first_name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={
                              formik.touched.first_name &&
                              formik.errors.first_name
                                ? "border-red-500"
                                : ""
                            }
                          />
                          {formik.touched.first_name &&
                            formik.errors.first_name && (
                              <p className="mt-1 text-sm text-red-600">
                                {formik.errors.first_name}
                              </p>
                            )}
                        </div>
                    ) : (
                      <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                        {userData.first_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    {isEditing ? (
                        <div>
                          <Input
                        type="text"
                        name="last_name"
                            value={formik.values.last_name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={
                              formik.touched.last_name &&
                              formik.errors.last_name
                                ? "border-red-500"
                                : ""
                            }
                          />
                          {formik.touched.last_name &&
                            formik.errors.last_name && (
                              <p className="mt-1 text-sm text-red-600">
                                {formik.errors.last_name}
                              </p>
                            )}
                        </div>
                    ) : (
                      <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                        {userData.last_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    {isEditing ? (
                        <div>
                          <Input
                            disabled
                        type="email"
                        name="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={
                              formik.touched.email && formik.errors.email
                                ? "border-red-500"
                                : "bg-gray-100 cursor-not-allowed text-black-500"
                            }
                          />
                          {formik.touched.email && formik.errors.email && (
                            <p className="mt-1 text-sm text-red-600">
                              {formik.errors.email}
                            </p>
                          )}
                        </div>
                    ) : (
                      <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                        {userData.email}
                      </p>
                    )}
                  </div>

                  <div>
                      <Label
                        htmlFor="date_of_birth"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Date of Birth
                      </Label>
                    {isEditing ? (
                        <div>
                          <Popover
                            open={calendarOpen}
                            onOpenChange={setCalendarOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                id="date_of_birth"
                                className={`w-full justify-between font-normal ${
                                  formik.touched.date_of_birth &&
                                  formik.errors.date_of_birth
                                    ? "border-red-500"
                                    : ""
                                }`}
                                type="button"
                              >
                                {formik.values.date_of_birth
                                  ? formatDate(formik.values.date_of_birth)
                                  : "Select date"}
                                <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  formik.values.date_of_birth
                                    ? new Date(formik.values.date_of_birth)
                                    : undefined
                                }
                                captionLayout="dropdown"
                                onSelect={(date) => {
                                  if (date) {
                                    // Format date as YYYY-MM-DD for Formik
                                    const year = date.getFullYear();
                                    const month = String(
                                      date.getMonth() + 1
                                    ).padStart(2, "0");
                                    const day = String(date.getDate()).padStart(
                                      2,
                                      "0"
                                    );
                                    const dateString = `${year}-${month}-${day}`;
                                    formik.setFieldValue(
                                      "date_of_birth",
                                      dateString
                                    );
                                    formik.setFieldTouched(
                                      "date_of_birth",
                                      true
                                    );
                                    setCalendarOpen(false);
                                  }
                                }}
                                disabled={(date) => {
                                  // Disable future dates
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  return date > today;
                                }}
                                fromYear={1900}
                                toYear={new Date().getFullYear()}
                              />
                            </PopoverContent>
                          </Popover>
                          {formik.touched.date_of_birth &&
                            formik.errors.date_of_birth && (
                              <p className="mt-1 text-sm text-red-600">
                                {formik.errors.date_of_birth}
                              </p>
                            )}
                        </div>
                    ) : (
                      <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                          {formatDate(userData.date_of_birth)}
                      </p>
                    )}
                    </div>
                  </div>
                  </div>

                  <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Grade & Exam Selection
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                    {isEditing ? (
                        <FieldArray name="grade_exams">
                          {({ push, remove }) => {
                            return (
                              <div className="space-y-4">
                                {formik.values.grade_exams.map(
                                  (gradeExam, index) => {
                                    const isExisting =
                                      gradeExam.isExisting || false;
                                    const registeredExamIds = isExisting
                                      ? getRegisteredExamIds(gradeExam.grade)
                                      : [];
                                    const filteredExams = getFilteredExams(
                                      gradeExam.grade
                                    );
                                    const availableGrades = isExisting
                                      ? [gradeExam.grade]
                                      : getAvailableGrades(index);

                                    const hasNoGrade =
                                      !isExisting && gradeExam.grade === 0;
                                    const hasGradeButNoExams =
                                      !isExisting &&
                                      gradeExam.grade > 0 &&
                                      gradeExam.exams.length === 0;

                                    return (
                                      <div
                                        key={index}
                                        className="relative flex flex-col gap-4 items-start p-4 border border-gray-200 rounded-lg bg-gray-50"
                                      >
                                        {/* Cross Icon to Remove Row - Top Right Corner for new entries */}
                                        {!isExisting && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              remove(index);
                                              formik.setFieldTouched(
                                                "grade_exams",
                                                true
                                              );
                                            }}
                                            className="absolute top-2 right-2 text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                                            title="Remove"
                                          >
                                            <X className="h-4 w-4" />
                                          </button>
                                        )}
                                        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">
                                          {/* Grade Dropdown */}
                                          <div>
                                            <Label className="text-sm font-medium text-gray-700 mb-1 block">
                                              Grade
                                            </Label>
                                            <Select
                                              value={
                                                gradeExam.grade > 0
                                                  ? gradeExam.grade.toString()
                                                  : ""
                                              }
                                              onValueChange={(value) => {
                                                formik.setFieldValue(
                                                  `grade_exams.${index}.grade`,
                                                  parseInt(value)
                                                );
                                                // Reset exams when grade changes
                                                formik.setFieldValue(
                                                  `grade_exams.${index}.exams`,
                                                  []
                                                );
                                                // Don't mark as touched when grade is selected
                                                // Validation will show only when button is clicked
                                              }}
                                              disabled={isExisting}
                                            >
                                              <SelectTrigger
                                                className={
                                                  (formik.touched.grade_exams?.[
                                                    index
                                                  ] &&
                                                  formik.errors.grade_exams?.[
                                                    index
                                                  ] &&
                                                  typeof formik.errors
                                                    .grade_exams[index] ===
                                                    "object" &&
                                                  (
                                                    formik.errors.grade_exams[
                                                      index
                                                    ] as any
                                                  ).grade
                                                    ? "border-red-500"
                                                    : "") +
                                                  (isExisting
                                                    ? " bg-gray-100 cursor-not-allowed"
                                                    : "")
                                                }
                                              >
                                                <SelectValue placeholder="Select grade" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {availableGrades.map(
                                                  (grade) => (
                                                    <SelectItem
                                                      key={grade}
                                                      value={grade.toString()}
                                                    >
                                                      Grade {grade}
                                                    </SelectItem>
                                                  )
                                                )}
                                              </SelectContent>
                                            </Select>
                                          </div>

                                          {/* Exam Selection - Multi-select for both existing and new */}
                                          <div>
                                            <Label className="text-sm font-medium text-gray-700 mb-1 block">
                                              Exams
                                            </Label>
                                            {isExisting ? (
                                              // Multi-select component for existing grades
                                              <MultiSelect
                                                options={filteredExams.map(
                                                  (exam: any) => {
                                                    const isRegistered =
                                                      registeredExamIds.includes(
                                                        exam.exam_overview_id
                                                      );
                                                    return {
                                                      label: `${exam.exam} - Level ${exam.level}`,
                                                      value:
                                                        exam.exam_overview_id.toString(),
                                                      subLabel: isRegistered
                                                        ? "Registered"
                                                        : undefined,
                                                      isRegistered:
                                                        isRegistered,
                                                    };
                                                  }
                                                )}
                                                value={gradeExam.exams.map(
                                                  (id) => id.toString()
                                                )}
                                                onValueChange={(
                                                  selectedValues
                                                ) => {
                                                  // Ensure registered exams are always included
                                                  const selectedIds =
                                                    selectedValues.map((v) =>
                                                      parseInt(v)
                                                    );
                                                  const finalExams = [
                                                    ...registeredExamIds, // Always include registered exams
                                                    ...selectedIds.filter(
                                                      (id) =>
                                                        !registeredExamIds.includes(
                                                          id
                                                        )
                                                    ), // Add non-registered selected exams
                                                  ];
                                                  formik.setFieldValue(
                                                    `grade_exams.${index}.exams`,
                                                    finalExams
                                                  );
                                                  formik.setFieldTouched(
                                                    `grade_exams.${index}`,
                                                    true
                                                  );
                                                }}
                                                placeholder="Select exams"
                                                maxCount={10}
                                                className={
                                                  gradeExam.grade > 0 &&
                                                  formik.touched.grade_exams?.[
                                                    index
                                                  ] &&
                                                  formik.errors.grade_exams?.[
                                                    index
                                                  ] &&
                                                  typeof formik.errors
                                                    .grade_exams[index] ===
                                                    "object" &&
                                                  (
                                                    formik.errors.grade_exams[
                                                      index
                                                    ] as any
                                                  ).exams
                                                    ? "border-red-500"
                                                    : ""
                                                }
                      />
                    ) : (
                                              // Multi-select component for new grades
                                              <MultiSelect
                                                options={filteredExams.map(
                                                  (exam: any) => ({
                                                    label: `${exam.exam} - Level ${exam.level}`,
                                                    value:
                                                      exam.exam_overview_id.toString(),
                                                  })
                                                )}
                                                value={gradeExam.exams.map(
                                                  (id) => id.toString()
                                                )}
                                                onValueChange={(
                                                  selectedValues
                                                ) => {
                                                  const selectedIds =
                                                    selectedValues.map((v) =>
                                                      parseInt(v)
                                                    );
                                                  formik.setFieldValue(
                                                    `grade_exams.${index}.exams`,
                                                    selectedIds
                                                  );
                                                  formik.setFieldTouched(
                                                    `grade_exams.${index}`,
                                                    true
                                                  );
                                                }}
                                                placeholder={
                                                  !gradeExam.grade
                                                    ? "Select grade first"
                                                    : isLoadingExams
                                                    ? "Loading exams..."
                                                    : "Select exams"
                                                }
                                                maxCount={10}
                                                disabled={
                                                  !gradeExam.grade ||
                                                  isLoadingExams
                                                }
                                                className={
                                                  gradeExam.grade > 0 &&
                                                  formik.touched.grade_exams?.[
                                                    index
                                                  ] &&
                                                  formik.errors.grade_exams?.[
                                                    index
                                                  ] &&
                                                  typeof formik.errors
                                                    .grade_exams[index] ===
                                                    "object" &&
                                                  (
                                                    formik.errors.grade_exams[
                                                      index
                                                    ] as any
                                                  ).exams
                                                    ? "border-red-500"
                                                    : ""
                                                }
                                              />
                                            )}
                                            {/* Validation Error - Show below exam dropdown */}
                                            {/* Only show exam validation error if grade is selected but exams are not */}
                                            {gradeExam.grade > 0 &&
                                              formik.touched.grade_exams?.[
                                                index
                                              ] &&
                                              (formik.errors.grade_exams?.[
                                                index
                                              ] &&
                                              typeof formik.errors.grade_exams[
                                                index
                                              ] === "object" &&
                                              (
                                                formik.errors.grade_exams[
                                                  index
                                                ] as any
                                              ).exams ? (
                                                <p className="mt-1 text-sm text-red-600">
                                                  {
                                                    (
                                                      formik.errors.grade_exams[
                                                        index
                                                      ] as any
                                                    ).exams
                                                  }
                                                </p>
                                              ) : null)}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                )}

                                {/* Show validation message after FieldArray elements if any tab has no grade */}
                                {formik.values.grade_exams.some(
                                  (item, idx) =>
                                    !item.isExisting &&
                                    item.grade === 0 &&
                                    formik.touched.grade_exams?.[idx]
                                ) && (
                                  <div className="w-full mt-2">
                                    <p className="text-sm text-red-600">
                                      Grade & exam are required
                                    </p>
                                  </div>
                                )}

                                {/* Push Button */}
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={async () => {
                                    // Mark all incomplete tabs as touched to show validation
                                    formik.values.grade_exams.forEach(
                                      (item, idx) => {
                                        if (
                                          !item.isExisting &&
                                          (item.grade === 0 ||
                                            item.exams.length === 0)
                                        ) {
                                          formik.setFieldTouched(
                                            `grade_exams.${idx}`,
                                            true
                                          );
                                        }
                                      }
                                    );

                                    // Validate the current form state
                                    const errors = await formik.validateForm();

                                    // Check if there are any validation errors in grade_exams
                                    const hasGradeExamErrors =
                                      errors.grade_exams &&
                                      (typeof errors.grade_exams === "string" ||
                                        (Array.isArray(errors.grade_exams) &&
                                          errors.grade_exams.some(
                                            (err: any) => err !== undefined
                                          )));

                                    // Check if any incomplete tabs exist
                                    const hasIncompleteTabs =
                                      formik.values.grade_exams.some(
                                        (item, idx) =>
                                          !item.isExisting &&
                                          (item.grade === 0 ||
                                            item.exams.length === 0)
                                      );

                                    // Only add new tab if no validation errors and no incomplete tabs
                                    if (
                                      !hasGradeExamErrors &&
                                      !hasIncompleteTabs
                                    ) {
                                      push({
                                        grade: 0,
                                        exams: [],
                                        isExisting: false,
                                      });
                                      formik.setFieldTouched(
                                        "grade_exams",
                                        true
                                      );
                                    } else {
                                      // Set errors to show validation messages
                                      formik.setErrors(errors);
                                    }
                                  }}
                                  className="w-full border-dashed"
                                >
                                  + Add Grade & Exam
                                </Button>
                              </div>
                            );
                          }}
                        </FieldArray>
                      ) : (
                        <div>
                          {userExams.length > 0 ? (
                            <div className="space-y-4">
                              {Object.entries(getExamsByGrade())
                                .sort(
                                  ([gradeA], [gradeB]) =>
                                    Number(gradeA) - Number(gradeB)
                                )
                                .map(([grade, gradeExams]: [string, any[]]) => {
                                  const gradeNum = Number(grade);
                                  const filteredExams =
                                    getFilteredExams(gradeNum);

                                  return (
                                    <div
                                      key={grade}
                                      className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                                    >
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Grade Field - Read Only */}
                                        <div>
                                          <Label className="text-sm font-medium text-gray-700 mb-1 block">
                                            Grade
                                          </Label>
                                          <p className="px-4 py-2 bg-gray-100 rounded-lg text-gray-900 border border-gray-200">
                                            Grade {grade}
                                          </p>
                                        </div>

                                        {/* Exams Field - Display as Tags */}
                                        <div>
                                          <Label className="text-sm font-medium text-gray-700 mb-1 block">
                                            Exams
                                          </Label>
                                          <div className="flex flex-wrap gap-2">
                                            {gradeExams.length > 0 ? (
                                              gradeExams.map((exam: any) => (
                                                <span
                                                  key={exam.exam_overview_id}
                                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                                                >
                                                  {exam.exam} - Level{" "}
                                                  {exam.level}
                                                </span>
                                              ))
                                            ) : (
                                              <p className="px-4 py-2 bg-gray-100 rounded-lg text-gray-500 border border-gray-200 text-sm">
                                                No exams registered
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          ) : (userData as any).grade_exams &&
                            Array.isArray((userData as any).grade_exams) &&
                            (userData as any).grade_exams.length > 0 ? (
                            <div className="space-y-4">
                              {(userData as any).grade_exams.map(
                                (item: any, index: number) => {
                                  // Handle both old format (exam) and new format (exams)
                                  const examId =
                                    item.exam ||
                                    (item.exams && item.exams[0]) ||
                                    0;
                                  const exam = exams.find(
                                    (e: any) => e.exam_overview_id === examId
                                  );
                                  const filteredExams = getFilteredExams(
                                    item.grade
                                  );

                                  return (
                                    <div
                                      key={index}
                                      className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                                    >
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Grade Field - Read Only */}
                                        <div>
                                          <Label className="text-sm font-medium text-gray-700 mb-1 block">
                                            Grade
                                          </Label>
                                          <p className="px-4 py-2 bg-gray-100 rounded-lg text-gray-900 border border-gray-200">
                                            Grade {item.grade}
                                          </p>
                                        </div>

                                        {/* Exams Field - Display as Tags */}
                                        <div>
                                          <Label className="text-sm font-medium text-gray-700 mb-1 block">
                                            Exams
                                          </Label>
                                          <div className="flex flex-wrap gap-2">
                                            {exam ? (
                                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                                {exam.exam} - Level {exam.level}
                                              </span>
                                            ) : (
                                              <p className="px-4 py-2 bg-gray-100 rounded-lg text-gray-500 border border-gray-200 text-sm">
                                                No exam registered
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          ) : (userData as any).grades &&
                            Array.isArray((userData as any).grades) &&
                            (userData as any).grades.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {(userData as any).grades
                                .sort((a: number, b: number) => a - b)
                                .map((grade: number) => (
                                  <div key={grade}>
                                    <Label className="text-sm font-medium text-gray-700 mb-1 block">
                                      Grade
                                    </Label>
                      <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                                      Grade {grade}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          ) : (userData as any).grade ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                                  Grade
                                </Label>
                                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                                  Grade {(userData as any).grade}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                              No grade-exam combinations selected
                            </p>
                          )}
                        </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                        <div>
                      <div className="flex gap-2">
                            <div className="w-24">
                              <Input
                          type="text"
                          name="country_code"
                                value={formik.values.country_code}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                          placeholder="+91"
                                className={
                                  formik.touched.country_code &&
                                  formik.errors.country_code
                                    ? "border-red-500"
                                    : ""
                                }
                              />
                              {formik.touched.country_code &&
                                formik.errors.country_code && (
                                  <p className="mt-1 text-sm text-red-600">
                                    {formik.errors.country_code}
                                  </p>
                                )}
                            </div>
                            <div className="flex-1">
                              <Input
                          type="tel"
                          name="phone_number"
                                value={formik.values.phone_number}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={
                                  formik.touched.phone_number &&
                                  formik.errors.phone_number
                                    ? "border-red-500"
                                    : ""
                                }
                              />
                              {formik.touched.phone_number &&
                                formik.errors.phone_number && (
                                  <p className="mt-1 text-sm text-red-600">
                                    {formik.errors.phone_number}
                                  </p>
                                )}
                            </div>
                          </div>
                      </div>
                    ) : (
                      <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                        {userData.country_code} {userData.phone_number}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* School Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  School Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      School Name
                    </label>
                    {isEditing ? (
                        <div>
                          <Input
                        type="text"
                        name="school_name"
                            value={formik.values.school_name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={
                              formik.touched.school_name &&
                              formik.errors.school_name
                                ? "border-red-500"
                                : ""
                            }
                          />
                          {formik.touched.school_name &&
                            formik.errors.school_name && (
                              <p className="mt-1 text-sm text-red-600">
                                {formik.errors.school_name}
                              </p>
                            )}
                        </div>
                    ) : (
                      <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                        {userData.school_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    {isEditing ? (
                        <div>
                          <Input
                        type="text"
                        name="city"
                            value={formik.values.city}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={
                              formik.touched.city && formik.errors.city
                                ? "border-red-500"
                                : ""
                            }
                          />
                          {formik.touched.city && formik.errors.city && (
                            <p className="mt-1 text-sm text-red-600">
                              {formik.errors.city}
                            </p>
                          )}
                        </div>
                    ) : (
                      <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                        {userData.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    {isEditing ? (
                        <div>
                          <Input
                        type="text"
                        name="state"
                            value={formik.values.state}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={
                              formik.touched.state && formik.errors.state
                                ? "border-red-500"
                                : ""
                            }
                          />
                          {formik.touched.state && formik.errors.state && (
                            <p className="mt-1 text-sm text-red-600">
                              {formik.errors.state}
                            </p>
                          )}
                        </div>
                    ) : (
                      <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                        {userData.state}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                  <form onSubmit={formik.handleSubmit}>
                <div className="flex gap-4 pt-4">
                  <button
                        type="submit"
                        disabled={formik.isSubmitting}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                  >
                        {formik.isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                        type="button"
                        onClick={handleCancel}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
                  </form>
              )}
            </div>
            </FormikProvider>
          </div>
        </div>
      </main>
    </div>
  );
}
