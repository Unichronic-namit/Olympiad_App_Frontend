import { Metadata } from "next";
import ProfileClient from "./profileClient";

export const metadata: Metadata = {
  title: "Profile | Olympiad Prep",
  description: "View and edit your profile information",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
