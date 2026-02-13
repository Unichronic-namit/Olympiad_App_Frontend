"use client";

import { useRouter } from "next/navigation";

type Section = {
  section_id: number;
  exam_overview_id: number;
  section: string;
  no_of_questions: number;
  marks_per_question: number;
  total_marks: number;
};

interface SectionCardProps {
  sections: Section[];
  examId: string;
  examType: string | null;
  handleStartPractice: (sectionId: number) => void;
}

export default function SectionCard({
  sections,
  examId,
  examType,
  handleStartPractice,
}: SectionCardProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sections.map((section) => (
        <div
          key={section.section_id}
          className="bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition cursor-pointer"
          onClick={(e) => {
            // Only handle card click if it's not a section exam (section exam is handled by button)
            if (examType !== "section") {
              router.push(
                `/exams/${examId}/sections/${section.section_id}/topics?type=${examType}`
              );
            }
          }}
        >
          <div className="p-6">
            {/* Section Icon and Name */}
            <div className="flex items-center mb-4">
              <div className="text-4xl mr-3">📚</div>
              <h2 className="text-2xl font-bold text-gray-900">
                {section.section}
              </h2>
            </div>

            {/* Section Details */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  📝 Questions
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {section.no_of_questions}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  ⭐ Marks per Question
                </span>
                <span className="text-lg font-bold text-green-600">
                  {section.marks_per_question}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  🎯 Total Marks
                </span>
                <span className="text-lg font-bold text-purple-600">
                  {section.total_marks}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (examType === "section") {
                  handleStartPractice(section.section_id);
                } else {
                  router.push(
                    `/exams/${examId}/sections/${section.section_id}/topics?type=${examType}`
                  );
                }
              }}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-lg shadow-sm transition duration-200 flex items-center justify-center gap-2"
            >
              <span>
                {examType === "section"
                  ? "Start Practice"
                  : "Start Learning"}
              </span>
              <span>→</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
