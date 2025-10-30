import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">Olympiad Prep</div>
          <div className="space-x-4">
            <Link
              href="/login"
              className="text-gray-700 hover:text-blue-600 transition px-4 py-2"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Master Olympiad Exams with
            <span className="block text-blue-600"> Expert Preparation</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
            Comprehensive practice questions, detailed solutions, and
            personalized learning paths for Mathematics, Science, and
            Competitive Exams
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-md"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="bg-white border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition"
            >
              Already a member? Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose Olympiad Prep?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Comprehensive Content
              </h3>
              <p className="text-gray-600">
                Access thousands of practice questions covering all topics for
                Mathematics and Science Olympiads
              </p>
            </div>

            <div className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Expert Solutions
              </h3>
              <p className="text-gray-600">
                Detailed step-by-step solutions by experienced educators to help
                you understand concepts deeply
              </p>
            </div>

            <div className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Track Your Progress
              </h3>
              <p className="text-gray-600">
                Monitor your performance with detailed analytics and identify
                areas for improvement
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-50 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Excel in Olympiad Exams?
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Join thousands of students who are achieving their goals
          </p>
          <Link
            href="/signup"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-md inline-block"
          >
            Start Your Journey Today
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 text-gray-600 py-8">
        <div className="container mx-auto px-6 text-center">
          <p>© 2024 Olympiad Prep. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
