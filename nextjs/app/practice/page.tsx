"use client";

import Navbar from "../components/dashboard/Navbar";

export default function PracticePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="md:ml-64">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-6">✏️</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Practice Zone
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Interactive practice sessions and mock tests are coming soon!
            </p>
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                What to Expect:
              </h2>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-blue-500 mr-3">🎯</span>
                    <span className="text-gray-700">Timed mock tests</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-500 mr-3">📊</span>
                    <span className="text-gray-700">Performance analytics</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-500 mr-3">🔄</span>
                    <span className="text-gray-700">Instant feedback</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-blue-500 mr-3">📱</span>
                    <span className="text-gray-700">
                      Mobile-friendly interface
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-500 mr-3">🎓</span>
                    <span className="text-gray-700">Grade-wise difficulty</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-500 mr-3">🏆</span>
                    <span className="text-gray-700">Achievement badges</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
