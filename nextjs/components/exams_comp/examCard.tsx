"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Exam = {
  exam_overview_id: number;
  exam: string;
  grade: number;
  level: number;
  total_questions: number;
  total_marks: number;
  total_time_mins: number;
};

interface ExamCardProps {
  filteredExams: Exam[];
}

export default function ExamCard({ filteredExams }: ExamCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredExams.map((exam) => (
        <div
          key={exam.exam_overview_id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
        >
          {/* Exam Name */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">{exam.exam}</h2>

          {/* Grade and Level */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                Grade {exam.grade}
              </span>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                Level {exam.level}
              </span>
            </div>
          </div>

          {/* Exam Details */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Questions</p>
              <p className="text-xl font-bold text-gray-900">
                {exam.total_questions || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Marks</p>
              <p className="text-xl font-bold text-gray-900">
                {exam.total_marks || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Time</p>
              <p className="text-xl font-bold text-gray-900">
                {exam.total_time_mins || 0}m
              </p>
            </div>
          </div>

          {/* View Section Button */}
          <button
            onClick={() => {
              const examType = searchParams.get("type");
              const url = examType
                ? `/exams/${exam.exam_overview_id}/sections?type=${examType}`
                : `/exams/${exam.exam_overview_id}/sections`;
              router.push(url);
            }}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition duration-200"
          >
            View Sections
          </button>
        </div>
      ))}
    </div>
  );
}
