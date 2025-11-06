import { Metadata } from "next";
import PerformanceClient from "./performanceClient";

export const metadata: Metadata = {
  title: "Performance | Olympiad Prep",
  description: "Track your performance and progress",
};

export default function PerformancePage() {
  return <PerformanceClient />;
}
