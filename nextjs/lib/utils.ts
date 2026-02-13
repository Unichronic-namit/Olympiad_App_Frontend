import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Cookies from "js-cookie";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Session management utilities
export interface SessionData {
  userId: string | null;
  email: string | null;
  password: string | null;
}

/**
 * Get session data from cookies
 * @returns SessionData object with userId, email, and password
 */
export function getSessionData(): SessionData {
  if (typeof window === "undefined") {
    return { userId: null, email: null, password: null };
  }

  return {
    userId: Cookies.get("session_userid") || null,
    email: Cookies.get("session_email") || null,
    password: Cookies.get("session_password") || null,
  };
}

/**
 * Check if user is authenticated (has active session)
 * @returns boolean indicating if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const authenticated = Cookies.get("authenticated");
  return authenticated === "true";
}

/**
 * Clear session data (logout)
 */
export function clearSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  // Clear cookies
  Cookies.remove("authenticated");
  Cookies.remove("session_userid");
  Cookies.remove("session_email");
  Cookies.remove("session_password");

  // Clear localStorage
  localStorage.removeItem("authenticated");
  localStorage.removeItem("user_data");
}
