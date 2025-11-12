"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getApiUrl, API_ENDPOINTS } from "../../config/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";

export default function SignupPage() {
  type Exam = {
    exam_overview_id: number;
    exam: string;
    grade: number;
    level: number;
    total_questions: number;
    total_marks: number;
    total_time_mins: number;
  };

  type FormData = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    grade: string;
    exams: number[];
    dob: string;
    phoneCode: string;
    phone: string;
    schoolName: string;
    city: string;
    state: string;
  };

  type Errors = Partial<Record<keyof FormData | "confirmPassword", string>>;

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    grade: "",
    exams: [],
    dob: "",
    phoneCode: "+91",
    phone: "",
    schoolName: "",
    city: "",
    state: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [apiError, setApiError] = useState("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [examsError, setExamsError] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Fetch exams from API
  useEffect(() => {
    const fetchExams = async () => {
      setIsLoadingExams(true);
      setExamsError("");

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
        console.log("Exams API Response:", responseText);

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

        // Handle both array and object responses
        const examsData = Array.isArray(data)
          ? data
          : data.exams || data.data || [];

        setExams(examsData);
        // Initially, show all exams if no grade is selected
        setFilteredExams(examsData);
      } catch (error: any) {
        console.error("Error fetching exams:", error);
        setExamsError(
          error.message || "Failed to load exams. Please try again later."
        );
      } finally {
        setIsLoadingExams(false);
      }
    };

    fetchExams();
  }, []);

  // Filter exams based on selected grade
  useEffect(() => {
    if (formData.grade) {
      const selectedGrade = parseInt(formData.grade, 10);
      const filtered = exams.filter((exam) => exam.grade === selectedGrade);
      setFilteredExams(filtered);

      // Remove selected exams that don't match the new grade
      setFormData((prev) => ({
        ...prev,
        exams: prev.exams.filter((examId) => {
          const exam = exams.find((e) => e.exam_overview_id === examId);
          return exam && exam.grade === selectedGrade;
        }),
      }));
    } else {
      // If no grade selected, show all exams
      setFilteredExams(exams);
    }
  }, [formData.grade, exams]);

  // Handle MultiSelect value change for exams
  const handleExamsChange = (values: string[]) => {
    const examIds = values.map((v) => parseInt(v, 10));
    setFormData((prev) => ({ ...prev, exams: examIds }));
    setErrors((prev) => ({ ...prev, exams: undefined }));
    if (apiError) setApiError("");
  };

  // Convert filteredExams to MultiSelect options format
  const examOptions = filteredExams.map((exam) => ({
    label: exam.exam,
    value: exam.exam_overview_id.toString(),
    subLabel: `Level ${exam.level}`,
  }));

  // Format date as DD/MM/YYYY for display
  const formatDate = (dateString: string): string => {
    if (!dateString) return "Select date";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "Select date";
    }
  };

  const validate = (): Errors => {
    const newErrors: Errors = {};

    const nameRegex = /^[A-Za-z][A-Za-z\s'-]{1,}$/;
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
    const phoneRegex = /^[0-9]{7,15}$/;

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    else if (!nameRegex.test(formData.firstName))
      newErrors.firstName = "Enter a valid first name";

    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    else if (!nameRegex.test(formData.lastName))
      newErrors.lastName = "Enter a valid last name";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Enter a valid email";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Minimum 6 characters";

    if (!confirmPassword) newErrors.confirmPassword = "Please confirm password";
    else if (confirmPassword !== formData.password)
      newErrors.confirmPassword = "Passwords do not match";

    if (!formData.grade) newErrors.grade = "Select your grade";

    if (!formData.dob) newErrors.dob = "Date of birth is required";
    else {
      const dobDate = new Date(formData.dob);
      const now = new Date();
      if (dobDate > now) newErrors.dob = "DOB cannot be in the future";
      const age =
        (now.getTime() - dobDate.getTime()) / (365.25 * 24 * 3600 * 1000);
      if (age < 5) newErrors.dob = "Minimum age is 5";
    }

    if (!formData.phoneCode) newErrors.phoneCode = "Code required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!phoneRegex.test(formData.phone))
      newErrors.phone = "Enter a valid phone number";

    if (!formData.schoolName.trim())
      newErrors.schoolName = "School name is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous messages
    setSuccessMessage("");
    setApiError("");

    // Validate form
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);

    try {
      // Prepare data for API - matching FastAPI backend format
      const requestData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        grade: parseInt(formData.grade),
        exam_overview_id: formData.exams, // Array of exam_overview_id values (numbers)
        date_of_birth: formData.dob,
        country_code: formData.phoneCode,
        phone_number: formData.phone,
        profile_image: "",
        school_name: formData.schoolName,
        city: formData.city,
        state: formData.state,
      };

      const apiUrl = getApiUrl(API_ENDPOINTS.SIGNUP);
      console.log("API URL:", apiUrl);
      console.log("Request Data:", requestData);
      console.log("Exam Overview IDs:", requestData.exam_overview_id);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestData),
        // Add mode for CORS
        mode: "cors",
      });

      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);

      // Get response as text first (can only read body once)
      const responseText = await response.text();
      console.log("Raw Response Text:", responseText);

      // Try to parse as JSON
      let data: any;
      try {
        if (responseText && responseText.trim()) {
          data = JSON.parse(responseText);
          console.log("Parsed Response Data:", data);
        } else {
          // Empty response - create default success object
          data = { message: "Success" };
          console.log("Empty response, using default:", data);
        }
      } catch (parseError: any) {
        console.error("Failed to parse JSON:", parseError);
        console.error("Response text was:", responseText);

        // Show error message
        const errorMsg = responseText
          ? responseText.length > 200
            ? "Server returned an error"
            : responseText
          : "Server returned invalid response format";
        setApiError(errorMsg);
        setIsLoading(false);
        return;
      }

      // Handle success - status 201 as per Python code
      if (response.status === 201) {
        setSuccessMessage("Account created successfully! Please sign in.");

        // Clear form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          grade: "",
          exams: [],
          dob: "",
          phoneCode: "+91",
          phone: "",
          schoolName: "",
          city: "",
          state: "",
        });
        setConfirmPassword("");

        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return;
      }

      // Handle errors
      if (response.status === 400) {
        setApiError("Email already registered or invalid data");
      } else if (data.detail) {
        if (Array.isArray(data.detail)) {
          // FastAPI validation errors format
          const apiErrors: Errors = {};
          data.detail.forEach((error: any) => {
            const field = error.loc?.[error.loc.length - 1];
            if (field) {
              const fieldMap: Record<string, keyof FormData> = {
                first_name: "firstName",
                last_name: "lastName",
                date_of_birth: "dob",
                country_code: "phoneCode",
                phone_number: "phone",
                school_name: "schoolName",
              };
              const mappedField = fieldMap[field] || field;
              apiErrors[mappedField as keyof Errors] = error.msg;
            }
          });
          setErrors(apiErrors);
          setApiError("Please fix the errors in the form");
        } else {
          setApiError(data.detail || "An error occurred during signup");
        }
      } else {
        setApiError("Failed to create account. Please try again.");
      }
    } catch (error: any) {
      console.error("Signup error:", error);

      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        setApiError(
          "Network error. Please check your internet connection and try again."
        );
      } else if (error.message === "Server returned non-JSON response") {
        setApiError("Server error. Please contact support or try again later.");
      } else {
        setApiError(
          error.message ||
            "Network error. Please check your connection and try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    // Clear API error when user starts typing
    if (apiError) setApiError("");
  };

  // Handle Select component changes (for grade and phoneCode)
  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    // Clear API error when user makes a selection
    if (apiError) setApiError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl p-8 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join Us Today
          </h1>
          <p className="text-gray-600">
            Start your Olympiad preparation journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                First Name
              </label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full ${errors.firstName ? "border-red-500" : ""}`}
                placeholder="John"
                aria-invalid={!!errors.firstName}
                aria-describedby={
                  errors.firstName ? "firstName-error" : undefined
                }
              />
              {errors.firstName && (
                <p id="firstName-error" className="mt-1 text-sm text-red-600">
                  {errors.firstName}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Last Name
              </label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full ${errors.lastName ? "border-red-500" : ""}`}
                placeholder="Doe"
                aria-invalid={!!errors.lastName}
                aria-describedby={
                  errors.lastName ? "lastName-error" : undefined
                }
              />
              {errors.lastName && (
                <p id="lastName-error" className="mt-1 text-sm text-red-600">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full ${errors.email ? "border-red-500" : ""}`}
              placeholder="your.email@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full ${errors.password ? "border-red-500" : ""}`}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
              />
              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600">
                  {errors.password}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: undefined,
                  }));
                }}
                className={`w-full ${
                  errors.confirmPassword ? "border-red-500" : ""
                }`}
                placeholder="••••••••"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword ? "confirmPassword-error" : undefined
                }
              />
              {errors.confirmPassword && (
                <p
                  id="confirmPassword-error"
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label
                htmlFor="grade"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Grade
              </label>
              <Select
                value={formData.grade || ""}
                onValueChange={(value) => handleSelectChange("grade", value)}
              >
                <SelectTrigger
                  id="grade"
                  className={`w-full ${
                    errors.grade ? "border-red-500" : "border-gray-300"
                  }`}
                  aria-invalid={!!errors.grade}
                  aria-describedby={errors.grade ? "grade-error" : undefined}
                >
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => `${i + 1}`).map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.grade && (
                <p id="grade-error" className="mt-1 text-sm text-red-600">
                  {errors.grade}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="dob"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date of Birth
              </label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="dob"
                    className={`w-full justify-between font-normal ${
                      errors.dob ? "border-red-500" : ""
                    }`}
                    type="button"
                    aria-invalid={!!errors.dob}
                    aria-describedby={errors.dob ? "dob-error" : undefined}
                  >
                    {formData.dob ? formatDate(formData.dob) : "Select date"}
                    <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dob ? new Date(formData.dob) : undefined}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      if (date) {
                        // Format date as YYYY-MM-DD for formData
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const day = String(date.getDate()).padStart(2, "0");
                        const dateString = `${year}-${month}-${day}`;
                        setFormData((prev) => ({ ...prev, dob: dateString }));
                        setErrors((prev) => ({ ...prev, dob: undefined }));
                        setCalendarOpen(false);
                      }
                    }}
                    disabled={(date) => date > new Date()}
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
              {errors.dob && (
                <p id="dob-error" className="mt-1 text-sm text-red-600">
                  {errors.dob}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="exams"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Exams
            </label>
            {isLoadingExams ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-500 text-center">
                Loading exams...
              </div>
            ) : examsError ? (
              <div className="w-full px-4 py-3 border border-red-500 rounded-lg bg-red-50 text-sm text-red-600">
                {examsError}
              </div>
            ) : !formData.grade ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-500 text-center">
                Please select your grade first to see available exams
              </div>
            ) : (
              <>
                <MultiSelect
                  options={examOptions}
                  value={formData.exams.map((id) => id.toString())}
                  onValueChange={handleExamsChange}
                  placeholder={
                    formData.grade
                      ? "Select exams for your grade"
                      : "Select exams"
                  }
                  maxCount={5}
                  className={
                    errors.exams ? "border-red-500" : "border-gray-300"
                  }
                  disabled={!formData.grade || filteredExams.length === 0}
                />
                {errors.exams && (
                  <p id="exams-error" className="mt-1 text-sm text-red-600">
                    {errors.exams}
                  </p>
                )}
                {!formData.grade && !errors.exams && (
                  <p className="mt-1 text-xs text-gray-500">
                    Please select your grade first to see available exams
                  </p>
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label
                htmlFor="phoneCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Code
              </label>
              <Select
                value={formData.phoneCode}
                onValueChange={(value) =>
                  handleSelectChange("phoneCode", value)
                }
              >
                <SelectTrigger
                  id="phoneCode"
                  className={`w-full ${
                    errors.phoneCode ? "border-red-500" : "border-gray-300"
                  }`}
                  aria-invalid={!!errors.phoneCode}
                  aria-describedby={
                    errors.phoneCode ? "phoneCode-error" : undefined
                  }
                >
                  <SelectValue placeholder="Select code" />
                </SelectTrigger>
                <SelectContent>
                  {["+91", "+1", "+44", "+61", "+81", "+49", "+971"].map(
                    (code) => (
                      <SelectItem key={code} value={code}>
                        {code}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              {errors.phoneCode && (
                <p id="phoneCode-error" className="mt-1 text-sm text-red-600">
                  {errors.phoneCode}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number
              </label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full ${errors.phone ? "border-red-500" : ""}`}
                placeholder="9876543210"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
              {errors.phone && (
                <p id="phone-error" className="mt-1 text-sm text-red-600">
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="schoolName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              School Name
            </label>
            <Input
              type="text"
              id="schoolName"
              name="schoolName"
              value={formData.schoolName}
              onChange={handleChange}
              className={`w-full ${errors.schoolName ? "border-red-500" : ""}`}
              placeholder="Springfield Public School"
              aria-invalid={!!errors.schoolName}
              aria-describedby={
                errors.schoolName ? "schoolName-error" : undefined
              }
            />
            {errors.schoolName && (
              <p id="schoolName-error" className="mt-1 text-sm text-red-600">
                {errors.schoolName}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                City
              </label>
              <Input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full ${errors.city ? "border-red-500" : ""}`}
                placeholder="Mumbai"
                aria-invalid={!!errors.city}
                aria-describedby={errors.city ? "city-error" : undefined}
              />
              {errors.city && (
                <p id="city-error" className="mt-1 text-sm text-red-600">
                  {errors.city}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                State
              </label>
              <Input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`w-full ${errors.state ? "border-red-500" : ""}`}
                placeholder="Maharashtra"
                aria-invalid={!!errors.state}
                aria-describedby={errors.state ? "state-error" : undefined}
              />
              {errors.state && (
                <p id="state-error" className="mt-1 text-sm text-red-600">
                  {errors.state}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
              disabled={isLoading}
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
              I agree to the Terms and Conditions
            </label>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}

          {/* API Error Message */}
          {apiError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{apiError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm transition duration-200 ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in here
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/"
            className="block text-center text-sm text-gray-600 hover:text-blue-600 transition"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
