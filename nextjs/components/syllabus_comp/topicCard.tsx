"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SubtopicCard from "./subtopicCard";

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

interface TopicCardProps {
  groupedTopics: GroupedTopic[];
  topicDifficulties: Record<string, string>;
  questionCounts: Record<number, Record<string, number>>;
  handleDifficultyChange: (topic: string, difficulty: string) => void;
  handleStartPractice: (syllabusId: number, difficulty: string) => void;
}

export default function TopicCard({
  groupedTopics,
  topicDifficulties,
  questionCounts,
  handleDifficultyChange,
  handleStartPractice,
}: TopicCardProps) {
  const getTopicDifficulty = (topic: string): string => {
    return topicDifficulties[topic] || "Easy";
  };

  return (
    <div className="space-y-6">
      {groupedTopics.map((group, groupIndex) => {
        const currentDifficulty = getTopicDifficulty(group.topic);
        return (
          <div
            key={groupIndex}
            className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6"
          >
            {/* Topic Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
              <div className="flex items-center">
                <div className="text-2xl sm:text-3xl mr-2 sm:mr-3">📖</div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {group.topic}
                </h2>
              </div>

              {/* Difficulty Dropdown - Top Right Corner */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label
                  htmlFor={`difficulty-${groupIndex}`}
                  className="text-sm font-medium text-gray-700 whitespace-nowrap"
                >
                  Difficulty:
                </label>
                <Select
                  value={currentDifficulty}
                  onValueChange={(value) =>
                    handleDifficultyChange(group.topic, value)
                  }
                >
                  <SelectTrigger
                    id={`difficulty-${groupIndex}`}
                    className="w-full sm:w-[140px] text-sm sm:text-base"
                  >
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">🟢 Easy</SelectItem>
                    <SelectItem value="Medium">🟡 Medium</SelectItem>
                    <SelectItem value="Hard">🔴 Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subtopics */}
            <SubtopicCard
              group={group}
              topicDifficulties={topicDifficulties}
              questionCounts={questionCounts}
              handleStartPractice={handleStartPractice}
            />
          </div>
        );
      })}
    </div>
  );
}
