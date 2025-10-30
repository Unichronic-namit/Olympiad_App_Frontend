"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/dashboard/Navbar";

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);

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
  }, [router]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content Area */}
      <main className="md:ml-64">
        {/* Dashboard Content */}
        <div className="container mx-auto px-4 md:px-6 py-8">
          {/* Welcome Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {userData.first_name || "Student"}! 👋
            </h1>
            <p className="text-gray-600">
              Ready to ace your Olympiad exams? Let's get started with your
              preparation.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Exams</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="text-4xl">📝</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Practice Tests</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="text-4xl">✏️</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Study Hours</p>
                  <p className="text-2xl font-bold text-gray-900">0h</p>
                </div>
                <div className="text-4xl">⏰</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                </div>
                <div className="text-4xl">📈</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border-2 border-blue-200 rounded-lg text-left hover:bg-blue-50 transition">
                <div className="text-2xl mb-2">📝</div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Start Practice Test
                </h3>
                <p className="text-sm text-gray-600">
                  Take a practice exam to test your knowledge
                </p>
              </button>

              <button className="p-4 border-2 border-blue-200 rounded-lg text-left hover:bg-blue-50 transition">
                <div className="text-2xl mb-2">📚</div>
                <h3 className="font-semibold text-gray-900 mb-1">View Notes</h3>
                <p className="text-sm text-gray-600">
                  Access your study materials and notes
                </p>
              </button>

              <button className="p-4 border-2 border-blue-200 rounded-lg text-left hover:bg-blue-50 transition">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  View Performance
                </h3>
                <p className="text-sm text-gray-600">
                  Check your progress and analytics
                </p>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity yet.</p>
              <p className="text-sm mt-2">
                Start practicing to see your activity here.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
