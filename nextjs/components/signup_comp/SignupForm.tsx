"use client";

import { useState, useEffect, useRef } from "react";
import { Formik, Form, Field, useFormikContext } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { signupSchema, type SignupFormValues } from "./signupValidation";
import { getApiUrl, API_ENDPOINTS } from "../../app/config/api";
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
  confirmPassword: string;
};

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [apiError, setApiError] = useState("");
  const apiErrorRef = useRef(apiError);
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [examsError, setExamsError] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Keep ref in sync with state
  useEffect(() => {
    apiErrorRef.current = apiError;
  }, [apiError]);

  // Initial form values
  const initialValues: SignupFormValues = {
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
    confirmPassword: "",
  };

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

  // Convert filteredExams to MultiSelect options format
  const getExamOptions = (filtered: Exam[]) => {
    return filtered.map((exam) => ({
      label: `${exam.exam} - Level ${exam.level}`,
      value: exam.exam_overview_id.toString(),
      subLabel: `Level ${exam.level}`,
    }));
  };

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

  const handleSubmit = async (
    values: SignupFormValues,
    { setErrors, resetForm }: any
  ) => {
    // Clear previous messages
    setSuccessMessage("");
    setApiError("");

    setIsLoading(true);

    try {
      // Prepare data for API - matching FastAPI backend format
      const requestData = {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        password: values.password,
        grade: parseInt(values.grade),
        exam_overview_id: values.exams || [], // Array of exam_overview_id values (numbers)
        date_of_birth: values.dob,
        country_code: values.phoneCode,
        phone_number: values.phone,
        profile_image: "",
        school_name: values.schoolName,
        city: values.city,
        state: values.state,
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
          data = { message: "Success" };
          console.log("Empty response, using default:", data);
        }
      } catch (parseError: any) {
        console.error("Failed to parse JSON:", parseError);
        console.error("Response text was:", responseText);

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

        // Reset form
        resetForm();

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
          const apiErrors: any = {};
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
              apiErrors[mappedField] = error.msg;
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

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(signupSchema)}
      onSubmit={handleSubmit}
      validateOnBlur={true}
      validateOnChange={false}
    >
      {({
        values,
        errors,
        touched,
        setFieldValue,
        setFieldError,
        isSubmitting,
      }) => {
        // Convert filteredExams to MultiSelect options format
        const examOptions = getExamOptions(filteredExams);

        // Handlers
        const handleGradeChange = (value: string) => {
          setFieldValue("grade", value, false);
          setFieldError("grade", undefined);
          if (apiErrorRef.current) setApiError("");
        };

        const handlePhoneCodeChange = (value: string) => {
          setFieldValue("phoneCode", value, false);
          setFieldError("phoneCode", undefined);
          if (apiErrorRef.current) setApiError("");
        };

        const handleExamsChange = (examValues: string[]) => {
          const examIds = examValues.map((v) => parseInt(v, 10));
          setFieldValue("exams", examIds, false);
          setFieldError("exams", undefined);
          if (apiErrorRef.current) setApiError("");
        };

        // Calculate className strings
        const gradeClassName = `w-full ${
          touched.grade && errors.grade ? "border-red-500" : "border-gray-300"
        }`;

        const phoneCodeClassName = `w-full ${
          touched.phoneCode && errors.phoneCode
            ? "border-red-500"
            : "border-gray-300"
        }`;

        // Filter exams based on selected grade - only update display
        useEffect(() => {
          if (values.grade) {
            const selectedGrade = parseInt(values.grade, 10);
            const filtered = exams.filter(
              (exam) => exam.grade === selectedGrade
            );
            setFilteredExams(filtered);
          } else {
            setFilteredExams(exams);
          }
        }, [values.grade, exams]);

        return (
          <Form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <Field name="firstName">
                  {({ field, meta }: any) => (
                    <>
                      <Input
                        type="text"
                        id="firstName"
                        {...field}
                        value={field.value || ""}
                        className={`w-full ${
                          meta.touched && meta.error ? "border-red-500" : ""
                        }`}
                        placeholder="John"
                        aria-invalid={!!(meta.touched && meta.error)}
                        aria-describedby={
                          meta.touched && meta.error
                            ? "firstName-error"
                            : undefined
                        }
                      />
                      {meta.touched && meta.error && (
                        <p
                          id="firstName-error"
                          className="mt-1 text-sm text-red-600"
                        >
                          {meta.error}
                        </p>
                      )}
                    </>
                  )}
                </Field>
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Field name="lastName">
                  {({ field, meta }: any) => (
                    <>
                      <Input
                        type="text"
                        id="lastName"
                        {...field}
                        value={field.value || ""}
                        className={`w-full ${
                          meta.touched && meta.error ? "border-red-500" : ""
                        }`}
                        placeholder="Doe"
                        aria-invalid={!!(meta.touched && meta.error)}
                        aria-describedby={
                          meta.touched && meta.error
                            ? "lastName-error"
                            : undefined
                        }
                      />
                      {meta.touched && meta.error && (
                        <p
                          id="lastName-error"
                          className="mt-1 text-sm text-red-600"
                        >
                          {meta.error}
                        </p>
                      )}
                    </>
                  )}
                </Field>
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <Field name="email">
                {({ field, meta }: any) => (
                  <>
                    <Input
                      type="email"
                      id="email"
                      {...field}
                      value={field.value || ""}
                      className={`w-full ${
                        meta.touched && meta.error ? "border-red-500" : ""
                      }`}
                      placeholder="your.email@example.com"
                      aria-invalid={!!(meta.touched && meta.error)}
                      aria-describedby={
                        meta.touched && meta.error ? "email-error" : undefined
                      }
                    />
                    {meta.touched && meta.error && (
                      <p id="email-error" className="mt-1 text-sm text-red-600">
                        {meta.error}
                      </p>
                    )}
                  </>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <Field name="password">
                  {({ field, meta }: any) => (
                    <>
                      <Input
                        type="password"
                        id="password"
                        {...field}
                        value={field.value || ""}
                        className={`w-full ${
                          meta.touched && meta.error ? "border-red-500" : ""
                        }`}
                        placeholder="••••••••"
                        aria-invalid={!!(meta.touched && meta.error)}
                        aria-describedby={
                          meta.touched && meta.error
                            ? "password-error"
                            : undefined
                        }
                      />
                      {meta.touched && meta.error && (
                        <p
                          id="password-error"
                          className="mt-1 text-sm text-red-600"
                        >
                          {meta.error}
                        </p>
                      )}
                    </>
                  )}
                </Field>
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <Field name="confirmPassword">
                  {({ field, meta }: any) => (
                    <>
                      <Input
                        type="password"
                        id="confirmPassword"
                        {...field}
                        value={field.value || ""}
                        className={`w-full ${
                          meta.touched && meta.error ? "border-red-500" : ""
                        }`}
                        placeholder="••••••••"
                        aria-invalid={!!(meta.touched && meta.error)}
                        aria-describedby={
                          meta.touched && meta.error
                            ? "confirmPassword-error"
                            : undefined
                        }
                      />
                      {meta.touched && meta.error && (
                        <p
                          id="confirmPassword-error"
                          className="mt-1 text-sm text-red-600"
                        >
                          {meta.error}
                        </p>
                      )}
                    </>
                  )}
                </Field>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label
                  htmlFor="grade"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Grade <span className="text-red-500">*</span>
                </label>
                <Select
                  value={values.grade || ""}
                  onValueChange={handleGradeChange}
                >
                  <SelectTrigger
                    id="grade"
                    className={gradeClassName}
                    aria-invalid={!!(touched.grade && errors.grade)}
                    aria-describedby={
                      touched.grade && errors.grade ? "grade-error" : undefined
                    }
                  >
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => `${i + 1}`).map(
                      (g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                {touched.grade && errors.grade && (
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
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="dob"
                      className={`w-full justify-between font-normal ${
                        touched.dob && errors.dob ? "border-red-500" : ""
                      }`}
                      type="button"
                      aria-invalid={!!(touched.dob && errors.dob)}
                      aria-describedby={
                        touched.dob && errors.dob ? "dob-error" : undefined
                      }
                    >
                      {values.dob ? formatDate(values.dob) : "Select date"}
                      <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={values.dob ? new Date(values.dob) : undefined}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(
                            2,
                            "0"
                          );
                          const day = String(date.getDate()).padStart(2, "0");
                          const dateString = `${year}-${month}-${day}`;
                          setFieldValue("dob", dateString);
                          setFieldError("dob", undefined);
                          setCalendarOpen(false);
                        }
                      }}
                      disabled={(date) => date > new Date()}
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
                {touched.dob && errors.dob && (
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
              ) : !values.grade ? (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-500 text-center">
                  Please select your grade first to see available exams
                </div>
              ) : (
                <>
                  <MultiSelect
                    options={examOptions}
                    value={values.exams?.map((id) => id.toString()) || []}
                    onValueChange={handleExamsChange}
                    placeholder={
                      values.grade
                        ? "Select exams for your grade"
                        : "Select exams"
                    }
                    maxCount={filteredExams.length || 100}
                    className={
                      touched.exams && errors.exams
                        ? "border-red-500"
                        : "border-gray-300"
                    }
                    disabled={!values.grade || filteredExams.length === 0}
                  />
                  {touched.exams && errors.exams && (
                    <p id="exams-error" className="mt-1 text-sm text-red-600">
                      {errors.exams}
                    </p>
                  )}
                  {!values.grade && !(touched.exams && errors.exams) && (
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
                  Code <span className="text-red-500">*</span>
                </label>
                <Select
                  value={String(values.phoneCode || "")}
                  onValueChange={handlePhoneCodeChange}
                >
                  <SelectTrigger
                    id="phoneCode"
                    className={phoneCodeClassName}
                    aria-invalid={!!(touched.phoneCode && errors.phoneCode)}
                    aria-describedby={
                      touched.phoneCode && errors.phoneCode
                        ? "phoneCode-error"
                        : undefined
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
                {touched.phoneCode && errors.phoneCode && (
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
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Field name="phone">
                  {({ field, meta }: any) => (
                    <>
                      <Input
                        type="tel"
                        id="phone"
                        {...field}
                        value={field.value || ""}
                        className={`w-full ${
                          meta.touched && meta.error ? "border-red-500" : ""
                        }`}
                        placeholder="9876543210"
                        aria-invalid={!!(meta.touched && meta.error)}
                        aria-describedby={
                          meta.touched && meta.error ? "phone-error" : undefined
                        }
                      />
                      {meta.touched && meta.error && (
                        <p
                          id="phone-error"
                          className="mt-1 text-sm text-red-600"
                        >
                          {meta.error}
                        </p>
                      )}
                    </>
                  )}
                </Field>
              </div>
            </div>

            <div>
              <label
                htmlFor="schoolName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                School Name <span className="text-red-500">*</span>
              </label>
              <Field name="schoolName">
                {({ field, meta }: any) => (
                  <>
                    <Input
                      type="text"
                      id="schoolName"
                      {...field}
                      value={field.value || ""}
                      className={`w-full ${
                        meta.touched && meta.error ? "border-red-500" : ""
                      }`}
                      placeholder="Springfield Public School"
                      aria-invalid={!!(meta.touched && meta.error)}
                      aria-describedby={
                        meta.touched && meta.error
                          ? "schoolName-error"
                          : undefined
                      }
                    />
                    {meta.touched && meta.error && (
                      <p
                        id="schoolName-error"
                        className="mt-1 text-sm text-red-600"
                      >
                        {meta.error}
                      </p>
                    )}
                  </>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  City <span className="text-red-500">*</span>
                </label>
                <Field name="city">
                  {({ field, meta }: any) => (
                    <>
                      <Input
                        type="text"
                        id="city"
                        {...field}
                        value={field.value || ""}
                        className={`w-full ${
                          meta.touched && meta.error ? "border-red-500" : ""
                        }`}
                        placeholder="Mumbai"
                        aria-invalid={!!(meta.touched && meta.error)}
                        aria-describedby={
                          meta.touched && meta.error ? "city-error" : undefined
                        }
                      />
                      {meta.touched && meta.error && (
                        <p
                          id="city-error"
                          className="mt-1 text-sm text-red-600"
                        >
                          {meta.error}
                        </p>
                      )}
                    </>
                  )}
                </Field>
              </div>
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  State <span className="text-red-500">*</span>
                </label>
                <Field name="state">
                  {({ field, meta }: any) => (
                    <>
                      <Input
                        type="text"
                        id="state"
                        {...field}
                        value={field.value || ""}
                        className={`w-full ${
                          meta.touched && meta.error ? "border-red-500" : ""
                        }`}
                        placeholder="Maharashtra"
                        aria-invalid={!!(meta.touched && meta.error)}
                        aria-describedby={
                          meta.touched && meta.error ? "state-error" : undefined
                        }
                      />
                      {meta.touched && meta.error && (
                        <p
                          id="state-error"
                          className="mt-1 text-sm text-red-600"
                        >
                          {meta.error}
                        </p>
                      )}
                    </>
                  )}
                </Field>
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

            <Button
              type="submit"
              disabled={isLoading || isSubmitting}
              className={`w-full py-3 font-semibold rounded-lg shadow-sm transition duration-200 ${
                isLoading || isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-700"
              }`}
              style={{
                backgroundColor: "#2563eb",
                color: "white",
              }}
            >
              {isLoading || isSubmitting ? (
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
            </Button>
          </Form>
        );
      }}
    </Formik>
  );
}
