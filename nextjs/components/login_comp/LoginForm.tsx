"use client";

import { Formik, Form, Field } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { getApiUrl, API_ENDPOINTS } from "../../app/config/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginSchema, type LoginFormValues } from "./loginValidation";

export default function LoginForm() {
  const router = useRouter();

  const initialValues: LoginFormValues = {
    email: "",
    password: "",
  };

  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting, setFieldError, setStatus }: any
  ) => {
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.LOGIN), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
        mode: "cors",
      });

      console.log("Login Response Status:", response.status);

      // Get response as text first (can only read body once)
      const responseText = await response.text();
      console.log("Login Raw Response Text:", responseText);

      // Try to parse as JSON
      let data: any;
      try {
        if (responseText && responseText.trim()) {
          data = JSON.parse(responseText);
          console.log("Login Parsed Response Data:", data);
        } else {
          data = {};
          console.log("Empty response");
        }
      } catch (parseError: any) {
        console.error("Failed to parse JSON:", parseError);
        setStatus("Server returned invalid response format");
        setSubmitting(false);
        return;
      }

      // Handle success - status 200 as per Python code
      if (response.status === 200) {
        // Extract user information from response
        const userId = data.user_id || data.id || data.userId || null;
        const userEmail = data.email || values.email;
        const userPassword = values.password; // Store password from form

        // Create session and store user data in cookies
        // Set cookies with expiration (7 days from now)
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);

        Cookies.set("authenticated", "true", { expires: expirationDate });
        Cookies.set("session_userid", userId?.toString() || "", {
          expires: expirationDate,
        });
        Cookies.set("session_email", userEmail, { expires: expirationDate });
        Cookies.set("session_password", userPassword, {
          expires: expirationDate,
        });

        // Also store in localStorage for backward compatibility
        localStorage.setItem("authenticated", "true");
        localStorage.setItem("user_data", JSON.stringify(data));

        console.log(
          "Login successful, session created. Redirecting to dashboard..."
        );
        console.log("Session data:", {
          userId: userId,
          email: userEmail,
          password: "***", // Don't log actual password
        });

        // Use Next.js router to navigate without page refresh
        router.push("/dashboard");
      } else if (response.status === 401) {
        console.log("Login failed: Invalid credentials");
        setStatus(data.detail || "Invalid email or password");
      } else if (response.status === 403) {
        console.log("Login failed: Account deactivated");
        setStatus(data.detail || "Your account is deactivated");
      } else {
        console.log("Login failed: Unknown error", data);
        setStatus(data.detail || "Failed to sign in. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setStatus("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(loginSchema)}
      onSubmit={handleSubmit}
      validateOnBlur={true}
      validateOnChange={false}
    >
      {({ isSubmitting, status, errors, touched }) => (
        <Form className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <Field name="email">
              {({ field }: any) => (
                <>
                  <Input
                    type="email"
                    id="email"
                    {...field}
                    value={field.value || ""}
                    className="w-full"
                    placeholder="your.email@example.com"
                    aria-invalid={!!(touched.email && errors.email)}
                  />
                  {touched.email && errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </>
              )}
            </Field>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <Field name="password">
              {({ field }: any) => (
                <>
                  <Input
                    type="password"
                    id="password"
                    {...field}
                    value={field.value || ""}
                    className="w-full"
                    placeholder="••••••••"
                    aria-invalid={!!(touched.password && errors.password)}
                  />
                  {touched.password && errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </>
              )}
            </Field>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isSubmitting}
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
              Forgot password?
            </a>
          </div>

          {/* Error Message */}
          {status && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{status}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 font-semibold rounded-lg shadow-sm transition duration-200 ${
              isSubmitting
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
            }}
          >
            {isSubmitting ? (
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
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
