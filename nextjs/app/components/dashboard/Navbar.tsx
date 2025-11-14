"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Practice Exams", href: "/exams", icon: "📝" },
  { name: "Notes", href: "/notes", icon: "📚" },
  { name: "Practice", href: "/practice", icon: "✏️" },
  { name: "Performance", href: "/performance", icon: "📈" },
  { name: "Profile", href: "/profile", icon: "👤" },
];

interface NavbarProps {
  isQuestionsPage?: boolean;
  onMobileMenuClick?: () => void;
}

export default function Navbar({
  isQuestionsPage = false,
  onMobileMenuClick,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExamsDropdownOpen, setIsExamsDropdownOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("authenticated");
    localStorage.removeItem("user_data");
    window.location.href = "/login";
  };

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm flex-col z-30">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
            Olympiad Prep
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              // Special handling for Exams dropdown
              if (item.name === "Practice Exams") {
                return (
                  <Collapsible
                    key={item.name}
                    open={isExamsDropdownOpen}
                    onOpenChange={setIsExamsDropdownOpen}
                    className="relative"
                  >
                    <CollapsibleTrigger
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition ${
                        pathname === item.href || pathname?.startsWith("/exams")
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-3 text-xl">{item.icon}</span>
                        {item.name}
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          isExamsDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                      <div className="py-1">
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 cursor-not-allowed"
                          disabled
                        >
                          Practice Full Exam
                        </button>
                        <Link
                          href="/exams?type=section"
                          onClick={() => setIsExamsDropdownOpen(false)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        >
                          Practice Section Exam
                        </Link>
                        <Link
                          href="/exams"
                          onClick={() => setIsExamsDropdownOpen(false)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        >
                          Practice Syllabus Exam
                        </Link>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              }
              // Regular nav items
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition ${
                    pathname === item.href
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  <span className="mr-3 text-xl">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition"
          >
            <span className="mr-3">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar with Menu Button */}
      <nav className="md:hidden bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {isMobileMenuOpen ? (
              <Link
                href="/dashboard"
                className="text-xl font-bold text-blue-600"
              >
                Olympiad Prep
              </Link>
            ) : (
              <button
                onClick={() => {
                  if (isQuestionsPage && onMobileMenuClick) {
                    onMobileMenuClick();
                  } else {
                    setIsMobileMenuOpen(!isMobileMenuOpen);
                  }
                }}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
                aria-label={
                  isQuestionsPage ? "Toggle questions list" : "Toggle menu"
                }
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}
            {!isMobileMenuOpen && (
              <Link
                href="/dashboard"
                className="text-xl font-bold text-blue-600"
              >
                Olympiad Prep
              </Link>
            )}
            <div className="w-10"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer/Sidebar */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Mobile Drawer */}
          <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden">
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-blue-600">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {navItems.map((item) => {
                    // Special handling for Exams dropdown in mobile
                    if (item.name === "Practice Exams") {
                      return (
                        <Collapsible
                          key={item.name}
                          open={isExamsDropdownOpen}
                          onOpenChange={setIsExamsDropdownOpen}
                          className="space-y-1"
                        >
                          <CollapsibleTrigger
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition ${
                              pathname === item.href ||
                              pathname?.startsWith("/exams")
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                            }`}
                          >
                            <div className="flex items-center">
                              <span className="mr-3 text-xl">{item.icon}</span>
                              {item.name}
                            </div>
                            <svg
                              className={`w-4 h-4 transition-transform ${
                                isExamsDropdownOpen ? "rotate-180" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-4 space-y-1">
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 cursor-not-allowed rounded-lg"
                              disabled
                            >
                              Practice Full Exam
                            </button>
                            <Link
                              href="/exams?type=section"
                              onClick={() => {
                                setIsExamsDropdownOpen(false);
                                setIsMobileMenuOpen(false);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                            >
                              Practice Section Exam
                            </Link>
                            <Link
                              href="/exams"
                              onClick={() => {
                                setIsExamsDropdownOpen(false);
                                setIsMobileMenuOpen(false);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                            >
                              Practice Syllabus Exam
                            </Link>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    }
                    // Regular nav items
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition ${
                          pathname === item.href
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        }`}
                      >
                        <span className="mr-3 text-xl">{item.icon}</span>
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* Logout Button */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition"
                >
                  <span className="mr-3">🚪</span>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
