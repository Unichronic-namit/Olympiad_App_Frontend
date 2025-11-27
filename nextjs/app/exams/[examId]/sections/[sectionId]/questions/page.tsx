"use client";

import { Suspense } from "react";
import QuestionsPageContent from "../../../../../../components/questions_comp/question_page_client";

export default function QuestionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading questions...</p>
          </div>
        </div>
      }
    >
      <QuestionsPageContent />
    </Suspense>
  );
}
