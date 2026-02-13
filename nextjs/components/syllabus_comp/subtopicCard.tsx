"use client";

type SyllabusItem = {
  syllabus_id: number;
  exam_overview_id: number;
  section_id: number;
  topic: string;
  subtopic: string;
};

type GroupedTopic = {
  topic: string;
  syllabusItems: SyllabusItem[];
};

interface SubtopicCardProps {
  group: GroupedTopic;
  topicDifficulties: Record<string, string>;
  questionCounts: Record<number, Record<string, number>>;
  handleStartPractice: (syllabusId: number, difficulty: string) => void;
}

export default function SubtopicCard({
  group,
  topicDifficulties,
  questionCounts,
  handleStartPractice,
}: SubtopicCardProps) {
  const getTopicDifficulty = (topic: string): string => {
    return topicDifficulties[topic] || "Easy";
  };

  const currentDifficulty = getTopicDifficulty(group.topic);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {group.syllabusItems.map((item) => (
        <div
          key={item.syllabus_id}
          className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition p-4 flex flex-col"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center flex-1">
              <span className="text-xl mr-2">📝</span>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {item.subtopic || group.topic}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {(() => {
                    const currentDifficulty = getTopicDifficulty(group.topic);
                    const count =
                      questionCounts[item.syllabus_id]?.[currentDifficulty];
                    return count !== undefined
                      ? `${count} question${count !== 1 ? "s" : ""}`
                      : "Loading...";
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* Difficulty Badge - Shows the topic's difficulty */}
          <div className="mb-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                currentDifficulty === "Easy"
                  ? "bg-green-100 text-green-700"
                  : currentDifficulty === "Medium"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {currentDifficulty === "Easy" && "🟢"}
              {currentDifficulty === "Medium" && "🟡"}
              {currentDifficulty === "Hard" && "🔴"}
              <span className="ml-1">{currentDifficulty}</span>
            </span>
          </div>

          {/* Start Button */}
          <button
            onClick={() => {
              handleStartPractice(item.syllabus_id, currentDifficulty);
            }}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2 mt-auto"
          >
            <span>Start Practice</span>
            <span>→</span>
          </button>
        </div>
      ))}
    </div>
  );
}
